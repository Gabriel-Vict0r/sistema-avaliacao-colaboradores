import { useState, useCallback, useRef } from "react";
import ReactSelect, { type SingleValue, type GroupBase, type ClassNamesConfig } from "react-select";
import { api } from "../lib/api";
import { cn } from "./ui/utils";

export interface ADUserOption {
  username: string;
  displayName: string;
  email: string;
}

interface SelectOption {
  value: string;
  label: string;
  sub: string;
}

const classNames: ClassNamesConfig<SelectOption, false, GroupBase<SelectOption>> = {
  control: ({ isFocused }) =>
    cn(
      "flex h-9 w-full rounded-md border bg-background px-2 text-sm shadow-sm transition-colors",
      "border-input",
      isFocused && "outline-none ring-1 ring-ring"
    ),
  valueContainer: () => "gap-1 py-0",
  singleValue: () => "text-foreground text-sm",
  placeholder: () => "text-muted-foreground text-sm",
  input: () => "text-foreground text-sm m-0 p-0",
  indicatorSeparator: () => "hidden",
  dropdownIndicator: () => "text-muted-foreground px-1",
  clearIndicator: () => "text-muted-foreground px-1 cursor-pointer",
  menu: () =>
    "mt-1 rounded-md border border-border bg-popover text-popover-foreground shadow-md overflow-hidden",
  menuList: () => "p-0",
  option: ({ isFocused, isSelected }) =>
    cn(
      "flex cursor-pointer flex-col px-3 py-2 text-sm",
      (isFocused || isSelected) && "bg-accent text-accent-foreground"
    ),
  noOptionsMessage: () => "py-4 text-center text-sm text-muted-foreground",
  loadingMessage: () => "py-4 text-center text-sm text-muted-foreground",
};

function formatOptionLabel(opt: SelectOption) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-medium leading-tight">{opt.label}</span>
      <span className="text-xs text-muted-foreground leading-tight">{opt.sub}</span>
    </div>
  );
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AdUserCombobox({
  value,
  onChange,
  placeholder = "Selecionar usuário do AD...",
  disabled = false,
}: Props) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadedRef = useRef(false);

  const loadUsers = useCallback(async () => {
    if (loadedRef.current) return;
    setIsLoading(true);
    try {
      const response = await api.get("/auth/ad-users");
      const users: ADUserOption[] = response.data.data.users ?? [];
      setOptions(
        users.map((u) => ({
          value: u.username,
          label: u.displayName,
          sub: u.email ? `${u.username} · ${u.email}` : u.username,
        }))
      );
      loadedRef.current = true;
    } catch {
      // stays empty, user sees no options
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selected = options.find((o) => o.value === value)
    ?? (value ? { value, label: value, sub: value } : null);

  return (
    <ReactSelect<SelectOption>
      unstyled
      classNames={classNames}
      value={selected}
      options={options}
      isLoading={isLoading}
      isDisabled={disabled}
      isClearable
      placeholder={placeholder}
      noOptionsMessage={() => "Nenhum usuário encontrado"}
      loadingMessage={() => "Carregando usuários do AD..."}
      filterOption={(option, input) => {
        if (!input) return true;
        const q = input.toLowerCase();
        return (
          option.data.label.toLowerCase().includes(q) ||
          option.data.value.toLowerCase().includes(q)
        );
      }}
      formatOptionLabel={formatOptionLabel}
      onChange={(opt: SingleValue<SelectOption>) => onChange(opt?.value ?? "")}
      onMenuOpen={loadUsers}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      menuShouldBlockScroll
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
    />
  );
}
