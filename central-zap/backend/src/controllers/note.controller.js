// Notas internas por contato (nunca enviadas ao WhatsApp)
import { z } from 'zod';
import { prisma } from '../prisma/client.js';

const noteSchema = z.object({ content: z.string() });

export async function getNote(req, res) {
  const { contactId } = req.params;
  const note = await prisma.note.findFirst({
    where: { contactId, userId: req.user.id },
  });
  res.json(note || { content: '' });
}

// Cria ou atualiza (upsert) a nota de um contato
export async function upsertNote(req, res) {
  try {
    const { content } = noteSchema.parse(req.body);
    const { contactId } = req.params;
    const contact = await prisma.contact.findFirst({ where: { id: contactId, userId: req.user.id } });
    if (!contact) return res.status(404).json({ error: 'Contato não encontrado.' });

    const note = await prisma.note.upsert({
      where: { id: (await prisma.note.findFirst({ where: { contactId, userId: req.user.id } }))?.id || 'no-id' },
      create: { content, contactId, userId: req.user.id },
      update: { content },
    });
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
