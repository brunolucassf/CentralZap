// ============================================================
// Seed inicial do Central Zap
// Cria um usuário de exemplo para facilitar os testes.
// Execute com: npm run seed  (após rodar as migrations)
// ============================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@centralzap.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Usuário de exemplo já existe. Pulando seed.');
    return;
  }

  const hashed = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Admin Central Zap',
      email,
      password: hashed,
    },
  });

  // Cria uma tag de exemplo
  await prisma.tag.create({
    data: {
      name: 'cliente',
      color: '#10b981',
      userId: user.id,
    },
  });

  console.log('Seed concluído. Usuário:', email, '| Senha: admin123');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
