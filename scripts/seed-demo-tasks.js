#!/usr/bin/env node
/*
  Seed 4 open tasks per demo user (0001..0004) near La Nopalera.
  Targets either local PostgREST (EXPO_PUBLIC_POSTGREST_URL) or Supabase REST
  when SUPABASE_REST_URL and SUPABASE_ANON_KEY are provided.
*/
const fetch = require('node-fetch');

const DEMO_LAT = 9.923035;
const DEMO_LON = -84.043457;

// metersFromCenter: distance in meters from center
function offsetByMeters(meters, angleDeg) {
  const angle = (angleDeg % 360) * (Math.PI / 180);
  const dLat = (meters / 111000) * Math.cos(angle);
  const dLon = (meters / (111000 * Math.cos(DEMO_LAT * Math.PI / 180))) * Math.sin(angle);
  return { lat: DEMO_LAT + dLat, lon: DEMO_LON + dLon };
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function hash32(str) {
  let h = 2166136261 >>> 0; // FNV-like
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand01(key) {
  return (hash32(key) % 100000) / 100000; // 0..0.99999
}

const USERS = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Demo User' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'María López' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Carlos Mendez' },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Ana Jiménez' },
];

const SAMPLE = [
  { title: 'Limpieza Rápida', description: 'Aseo básico de apartamento.', category: 'cleaning', reward: 12000 },
  { title: 'Planchar Ropa', description: '10 camisas a planchar.', category: 'laundry_ironing', reward: 8000 },
  { title: 'Paseo de Perro', description: '30 min caminata.', category: 'pet_care', reward: 7000 },
  { title: 'Compras Rápidas', description: 'Comprar lista corta.', category: 'grocery_shopping', reward: 9000 },
];

// Full category list for guaranteed coverage
const ALL_CATEGORIES = [
  'plumbing','electrician','carpentry','painting','appliance_repair','cleaning','laundry_ironing','cooking','grocery_shopping','pet_care','gardening','moving_help','trash_removal','window_washing','babysitting','elderly_care','tutoring','delivery_errands','tech_support','photography'
];

function titleForCategory(cat){
  const map = {
    plumbing:'Reparación de plomería', electrician:'Instalación eléctrica', carpentry:'Trabajo de carpintería', painting:'Pintura de habitación', appliance_repair:'Reparación de electrodoméstico', cleaning:'Limpieza del hogar', laundry_ironing:'Lavandería y planchado', cooking:'Preparación de comida', grocery_shopping:'Compras en supermercado', pet_care:'Cuidado de mascota', gardening:'Jardinería básica', moving_help:'Ayuda de mudanza', trash_removal:'Retiro de basura', window_washing:'Limpieza de ventanas', babysitting:'Cuidado de niños', elderly_care:'Acompañamiento adulto mayor', tutoring:'Tutoría de estudios', delivery_errands:'Mandados rápidos', tech_support:'Soporte técnico', photography:'Sesión de fotos'
  };
  return map[cat] || 'Tarea';
}

async function main() {
  const localBase = process.env.EXPO_PUBLIC_POSTGREST_URL;
  const sbBase = process.env.SUPABASE_REST_URL;
  const sbKey = process.env.SUPABASE_ANON_KEY;
  let base = localBase || sbBase;
  if (!base) throw new Error('Provide EXPO_PUBLIC_POSTGREST_URL or SUPABASE_REST_URL');
  const tasksUrl = `${base.replace(/\/$/, '')}/tasks`;

  const commonHeaders = localBase
    ? { 'Prefer': 'return=representation', 'Content-Type': 'application/json' }
    : { 'Prefer': 'return=representation', 'Content-Type': 'application/json', 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}` };

  const rows = [];
  // Ensure at least one task per category overall, distributing across users
  let userIdx = 0;
  for (const cat of ALL_CATEGORIES) {
    const u = USERS[userIdx % USERS.length];
    userIdx++;
    const j = offsetByMeters(350 + (rand01(cat)*50 - 25), 15 + rand01(cat+':angle')*330);
    rows.push({
      id: uuid(),
      title: titleForCategory(cat),
      description: `${titleForCategory(cat)} cerca de La Nopalera`,
      category: cat,
      reward: 12000 + Math.floor(rand01(cat+':r')*8000),
      time_estimate: '1-3h',
      location: 'Avenida 24, San José',
      latitude: j.lat,
      longitude: j.lon,
      status: 'open',
      user_id: u.id,
      created_at: new Date().toISOString(),
    });
  }

  // Then add 4 per user near/far bands
  for (const u of USERS) {
    // Bands with center distances and ±20m jitter
    const bands = [80, 160, 240, 320];
    for (let i = 0; i < 4; i++) {
      const p = SAMPLE[i % SAMPLE.length];
      const r = rand01(`${u.id}:${p.category}:${i}`);
      const angle = r * 360; // unique per user/category/index
      const jitter = (rand01(`${i}:${p.category}:${u.id}:j`) * 40) - 20; // -20..+20m
      const dist = bands[i] + jitter;
      const j = offsetByMeters(dist, angle);
      rows.push({
        id: uuid(),
        title: p.title,
        description: p.description,
        category: p.category,
        reward: p.reward,
        time_estimate: '1-3h',
        location: 'Avenida 24, San José',
        latitude: j.lat,
        longitude: j.lon,
        status: 'open',
        user_id: u.id,
        created_at: new Date().toISOString(),
      });
    }
  }

  const res = await fetch(tasksUrl, { method: 'POST', headers: commonHeaders, body: JSON.stringify(rows) });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Seed failed: ${res.status} ${txt}`);
  }
  const created = await res.json();
  console.log(`[seed-demo] Inserted ${created.length} tasks near La Nopalera.`);
}

main().catch(e => { console.error('[seed-demo] Error:', e?.message || e); process.exit(1); });


