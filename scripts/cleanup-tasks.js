#!/usr/bin/env node
const fetch = require('node-fetch');

async function main() {
  const base = process.env.EXPO_PUBLIC_POSTGREST_URL || 'http://localhost:3000';
  const tasksUrl = `${base}/tasks`;
  const offersUrl = `${base}/offers`;

  const keepIds = new Set([
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001'
  ]);

  const res = await fetch(`${tasksUrl}?select=id`);
  if (!res.ok) throw new Error(`Failed to list tasks: ${res.status}`);
  const all = await res.json();
  const remove = all.filter(t => !keepIds.has(String(t.id))).map(t => t.id);
  if (remove.length === 0) { console.log('[cleanup] Nothing to remove'); return; }

  // Delete dependent offers
  await fetch(`${offersUrl}?task_id=in.(${remove.map(id => `"${id}"`).join(',')})`, { method: 'DELETE', headers: { Prefer: 'return=representation' } }).catch(() => {});

  const delRes = await fetch(`${tasksUrl}?id=in.(${remove.map(id => `"${id}"`).join(',')})`, { method: 'DELETE', headers: { Prefer: 'return=representation' } });
  if (!delRes.ok) throw new Error(`Failed to delete tasks: ${delRes.status}`);
  console.log(`[cleanup] Removed ${remove.length} tasks; kept ${keepIds.size}.`);
}

main().catch(e => { console.error('[cleanup] Error:', e?.message || e); process.exit(1); });


