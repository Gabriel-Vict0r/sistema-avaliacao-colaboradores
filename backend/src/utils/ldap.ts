import ActiveDirectory from "activedirectory2";
import { env } from "../config/env";

export interface ADUser {
  sAMAccountName: string;
  mail?: string;
  displayName?: string;
  givenName?: string;
  sn?: string;
  userPrincipalName?: string;
}

const adConfig = {
  url: env.AD_URL,
  baseDN: env.AD_BASE_DN,
  username: env.AD_SERVICE_USER,
  password: env.AD_SERVICE_PASSWORD,
  attributes: {
    user: [
      "sAMAccountName",
      "mail",
      "displayName",
      "givenName",
      "sn",
      "userPrincipalName",
    ],
  },
  referrals: {
    enabled: false,
    limit: 0,
  },
};

function createAD() {
  return new ActiveDirectory(adConfig);
}

// "auroraserios.local" → "DC=auroraserios,DC=local"
function domainToDn(domain: string): string {
  return domain
    .split(".")
    .map((part) => `DC=${part}`)
    .join(",");
}

export function authenticateAD(
  username: string,
  password: string,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const ad = createAD();

    let loginName = username;
    if (!username.includes("@") && !username.includes("\\") && env.AD_DOMAIN) {
      loginName = `${env.AD_DOMAIN}\\${username}`;
    }

    ad.authenticate(loginName, password, (err: Error | null, auth: boolean) => {
      if (err) {
        if (err.message && err.message.includes("InvalidCredentials")) {
          resolve(false);
          return;
        }
        reject(err);
        return;
      }
      resolve(auth);
    });
  });
}

export function findADUser(username: string): Promise<ADUser | null> {
  return new Promise((resolve, reject) => {
    const ad = createAD();
    const sAMAccountName = username.replace(/^.*\\/, "").replace(/@.*$/, "");

    ad.findUser(sAMAccountName, (err: Error | null, user: ADUser | null) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(user || null);
    });
  });
}

export function extractSAMAccountName(username: string): string {
  return username.replace(/^.*\\/, "").replace(/@.*$/, "").toLowerCase();
}

function escapeLdap(str: string): string {
  return str
    .replace(/\\/g, "\\5c")
    .replace(/\*/g, "\\2a")
    .replace(/\(/g, "\\28")
    .replace(/\)/g, "\\29")
    .replace(/\0/g, "\\00");
}

export function searchADUsers(search?: string): Promise<ADUser[]> {
  return new Promise((resolve, reject) => {
    const ad = createAD();

    const term = search ? escapeLdap(search.trim()) : "";

    const activeFilter =
      "(&(objectClass=user)(objectCategory=person)(!(userAccountControl:1.2.840.113556.1.4.803:=2))";
    const searchFilter = term
      ? `(|(sAMAccountName=*${term}*)(displayName=*${term}*)(givenName=*${term}*)(sn=*${term}*))`
      : "";
    const filter = `${activeFilter}${searchFilter})`;

    // AD_DOMAIN precisa ser um FQDN com pelo menos um ponto (ex: "auroraserios.local").
    // Se for apenas um nome curto (ex: "AURORASERIOS"), usamos AD_BASE_DN diretamente.
    const isFqdn = env.AD_DOMAIN && env.AD_DOMAIN.includes('.');
    const baseDN = isFqdn ? domainToDn(env.AD_DOMAIN) : env.AD_BASE_DN;

    const opts = { filter, baseDN };

    console.log("[LDAP] searchADUsers → filter:", filter, "| baseDN:", baseDN);

    (ad as any).findUsers(opts, (err: Error | null, users: ADUser[] | null) => {
      if (err) {
        const isReferral =
          err.name === "ReferralError" ||
          (err as any).lde_message?.includes("RefErr") ||
          err.message?.includes("Referral");

        if (isReferral) {
          console.warn(
            "[LDAP] ReferralError mesmo com baseDN =",
            baseDN,
            "— verifique AD_DOMAIN e AD_BASE_DN no .env",
          );
          resolve([]);
          return;
        }

        reject(err);
        return;
      }

      const result = (users || [])
        .filter((u) => u.sAMAccountName)
        .slice(0, 300);

      console.log(`[LDAP] searchADUsers → ${result.length} usuário(s) encontrado(s)`);
      resolve(result);
    });
  });
}
