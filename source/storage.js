// Inserted into Gu by patch14.py. All known production keys start write-protected. A successful
// read (including confirmed absence/corruption) releases that key. Operational errors never do.
const saveSchemas = new Map([
  ['skin-fade-studio-session-v2', ['version', 19]],
  ['skin-fade-studio-meta-v1', ['v', 1]],
  ['skin-fade-studio-rewards-v4', ['v', 4]],
]);
const unreadKeys = new Set([...saveSchemas.keys(), 'skin-fade-studio-audio-v1', 'skin-fade-studio-detail-v1']);
async function U(key, fallback) {
  unreadKeys.add(key);
  const [raw] = await a.get([key], false);
  let value = raw;
  if (typeof raw === 'string') {
    try { value = JSON.parse(raw); } catch (_) { value = null; }
  }
  const schema = saveSchemas.get(key);
  if (schema && value && Number.isFinite(value[schema[0]]) && value[schema[0]] > schema[1]) {
    throw Object.assign(new Error('Progress needs a newer game version'), {code: 'SAVE_TOO_NEW'});
  }
  unreadKeys.delete(key);
  return value == null ? fallback : value;
}
function requireRead(key) {
  if (unreadKeys.has(key)) throw new Error('Progress is protected until it loads successfully');
}
async function D(key, value) {
  if (HSC.otherTab) return;
  requireRead(key);
  const serialized = JSON.stringify(value);
  const write = m.catch(() => {}).then(() => {
    // A subsequent failed read must also block writes that were queued before it failed.
    requireRead(key);
    return a.set([key], [serialized]);
  });
  m = write;
  return write;
}
async function M(key) {
  requireRead(key);
  await a.delete([key]);
}
