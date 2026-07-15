// Controller de tags + associação a contatos
import { z } from 'zod';
import { prisma } from '../prisma/client.js';

const tagSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
});

export async function listTags(req, res) {
  const tags = await prisma.tag.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(tags);
}

export async function createTag(req, res) {
  try {
    const { name, color } = tagSchema.parse(req.body);
    const tag = await prisma.tag.create({
      data: { name, color: color || '#10b981', userId: req.user.id },
    });
    res.status(201).json(tag);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteTag(req, res) {
  await prisma.tag.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
  res.json({ ok: true });
}

// Associa/remove tag de um contato
export async function assignTag(req, res) {
  const { contactId, tagId } = req.params;
  // valida posse
  const contact = await prisma.contact.findFirst({ where: { id: contactId, userId: req.user.id } });
  if (!contact) return res.status(404).json({ error: 'Contato não encontrado.' });
  await prisma.contactTag.upsert({
    where: { contactId_tagId: { contactId, tagId } },
    create: { contactId, tagId },
    update: {},
  });
  res.json({ ok: true });
}

export async function unassignTag(req, res) {
  const { contactId, tagId } = req.params;
  await prisma.contactTag.deleteMany({ where: { contactId, tagId } });
  res.json({ ok: true });
}
