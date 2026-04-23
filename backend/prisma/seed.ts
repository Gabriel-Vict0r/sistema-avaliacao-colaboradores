import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar usuário admin inicial (usar adUsername do AD)
  const admin = await prisma.user.upsert({
    where: { adUsername: 'admin' },
    update: {},
    create: {
      adUsername: 'admin',
      email: 'admin@empresa.local',
      name: 'Administrador',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin criado:', admin.email);

  // Colaboradores de exemplo
  const gestora = await prisma.employee.upsert({
    where: { email: 'ana.silva@empresa.local' },
    update: {},
    create: {
      name: 'Ana Silva Santos',
      email: 'ana.silva@empresa.local',
      position: 'Gerente de Vendas',
      department: 'Comercial',
      type: 'GESTORES',
    },
  });

  const operacional = await prisma.employee.upsert({
    where: { email: 'joao.pedro@empresa.local' },
    update: {},
    create: {
      name: 'João Pedro Santos',
      email: 'joao.pedro@empresa.local',
      position: 'Operador de Máquinas',
      department: 'Produção',
      type: 'OPERACIONAIS',
    },
  });

  console.log('✅ Colaboradores criados:', gestora.name, '|', operacional.name);
  console.log('');
  console.log('📌 Para adicionar novos usuários admin, use o endpoint POST /api/users');
  console.log('   (requer autenticação AD + role ADMIN)');
  console.log('');
  console.log('🚀 Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
