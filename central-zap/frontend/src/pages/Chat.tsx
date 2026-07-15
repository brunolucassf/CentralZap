import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { onNewMessage } from '../services/socket';
import Avatar from '../components/Avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Chat() {
  const { contactId } = useParams();
  const [contact, setContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [tags, setTags] = useState<any[]>([]);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [qr, setQuickReplies] = useState<any[]>([]);
  const [showQr, setShowQr] = useState(false);
  const [note, setNote] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function load() {
    if (!contactId) return;
    const { data } = await api.get(`/chat/${contactId}`);
    setContact(data);
    setMessages(data.messages || []);
    setNote(data.note?.content || '');
    api.get('/tags').then((r) => setTags(r.data)).catch(() => {});
    api.get('/quick-replies').then((r) => setQuickReplies(r.data)).catch(() => {});
  }

  useEffect(() => {
    load();
    const off = onNewMessage((e) => {
      if (e.contact?.id === contactId) {
        load();
      }
    });
    return () => { off(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!text.trim()) return;
    try {
      await api.post(`/chat/${contactId}/send`, { body: text });
      setText('');
      setShowQr(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Falha ao enviar.');
    }
  }

  // Lida com a digitação de "/" para abrir respostas rápidas
  function onInputChange(v: string) {
    setText(v);
    if (v === '/') setShowQr(true);
    else if (!v.startsWith('/')) setShowQr(false);
  }

  function applyQuickReply(body: string) {
    setText(body);
    setShowQr(false);
  }

  async function saveNote() {
    await api.post(`/notes/${contactId}`, { content: note });
    setNoteOpen(false);
    toast.success('Nota salva.');
  }

  async function toggleTag(tagId: string) {
    const has = contact.tags?.some((ct: any) => ct.tag.id === tagId);
    if (has) await api.delete(`/tags/assign/${contactId}/${tagId}`);
    else await api.post(`/tags/assign/${contactId}/${tagId}`);
    load();
  }

  const activeReminder = contact?.reminders?.find((r: any) => r.status === 'pending' || r.status === 'snoozed');

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col">
      {!contact ? (
        <div className="grid flex-1 place-items-center text-ink-600/60">Carregando conversa...</div>
      ) : (
        <>
          {/* Cabeçalho da conversa */}
          <div className="mb-3 flex items-center gap-3">
            <Avatar name={contact.name} color={contact.account?.color} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{contact.name}</p>
              <p className="text-xs text-ink-600/60">{contact.phone}</p>
            </div>
            <span className="badge text-[10px]" style={{ background: contact.account.color + '22', color: contact.account.color }}>
              {contact.account.name}
            </span>
            <button className="btn-ghost" onClick={() => setShowTagPicker((v) => !v)}>🏷️ Tags</button>
            <button className="btn-ghost" onClick={() => { setNoteOpen((v) => !v); if (!noteOpen) setNote(contact.note?.content || ''); }}>📝 Nota</button>
          </div>

          {/* Seletor de tags */}
          <AnimatePresence>
            {showTagPicker && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2 flex flex-wrap gap-2 overflow-hidden">
                {tags.map((t) => {
                  const has = contact.tags?.some((ct: any) => ct.tag.id === t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTag(t.id)}
                      className="badge border"
                      style={{
                        background: has ? t.color + '33' : 'transparent',
                        color: t.color,
                        borderColor: t.color + '66',
                      }}
                    >
                      {has ? '✓ ' : ''}{t.name}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Banner de lembrete ativo */}
          {activeReminder && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-3 flex items-center gap-3 rounded-xl bg-amber-500/15 border border-amber-500/30 px-4 py-2.5">
              <span className="text-lg">⏰</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Lembrete ativo</p>
                <p className="text-xs">{activeReminder.description}{activeReminder.value ? ` — R$ ${activeReminder.value.toFixed(2)}` : ''}</p>
              </div>
            </motion.div>
          )}

          {/* Bloco de nota interna */}
          <AnimatePresence>
            {noteOpen ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-3 rounded-xl border border-accent/30 bg-accent/10 p-3">
                <label className="label">Nota interna (visível apenas no sistema)</label>
                <textarea className="input min-h-[80px]" value={note} onChange={(e) => setNote(e.target.value)} />
                <div className="mt-2 flex gap-2">
                  <button className="btn-primary" onClick={saveNote}>Salvar nota</button>
                  <button className="btn-ghost" onClick={() => setNoteOpen(false)}>Cancelar</button>
                </div>
              </motion.div>
            ) : contact.note?.content ? (
              <div className="mb-3 rounded-xl border border-accent/25 bg-accent/5 px-4 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-accent/80">Nota</p>
                <p className="text-sm">{contact.note.content}</p>
              </div>
            ) : null}
          </AnimatePresence>

          {/* Histórico de mensagens */}
          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto rounded-2xl bg-paper-100/50 dark:bg-ink-900/40 p-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-soft ${m.fromMe ? 'bg-accent text-white rounded-br-sm' : 'bg-white dark:bg-ink-800 text-ink-900 dark:text-paper-100 rounded-bl-sm'}`}>
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`mt-0.5 text-[10px] ${m.fromMe ? 'text-white/70' : 'text-ink-600/50'}`}>
                    {format(new Date(m.timestamp), 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="py-10 text-center text-sm text-ink-600/50">Nenhuma mensagem ainda. Envie a primeira!</p>
            )}
          </div>

          {/* Input com respostas rápidas */}
          <div className="relative mt-3">
            <AnimatePresence>
              {showQr && qr.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute bottom-full mb-2 w-full max-w-md rounded-xl glass-strong p-2 shadow-glass">
                  {qr.map((qitem) => (
                    <button key={qitem.id} onClick={() => applyQuickReply(qitem.message)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-accent/10">
                      <span className="text-xs font-semibold text-accent">/{qitem.shortcut}</span>
                      <span className="truncate pl-3 text-xs text-ink-600/70">{qitem.message}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="Digite uma mensagem... (use / para respostas rápidas)"
                value={text}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
              />
              <button className="btn-primary px-5" onClick={send}>Enviar</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
