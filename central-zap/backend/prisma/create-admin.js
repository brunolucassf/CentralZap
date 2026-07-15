// Cria/atualiza o utilizador admin (login: admin / senha: admin2612)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const email = 'admin';
const password = 'admin2612';

try {
  const hashed = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { password: hashed } });
    console.log('Utilizador "admin" atualizado com a nova senha.');
  } else {
    await prisma.user.create({ data: { name: 'Admin', email, password: hashed } });
    console.log('Utilizador "admin" criado (senha: admin2612).');
  }
} catch (e) {
  console.error('Erro:', e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
