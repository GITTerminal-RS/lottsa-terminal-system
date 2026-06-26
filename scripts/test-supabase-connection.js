#!/usr/bin/env node

/**
 * Verifica conectividad con Supabase (DNS, API REST, tablas y RPC).
 * Uso: node scripts/test-supabase-connection.js
 * Requiere .env.local o variables VITE_APP_SUPABASE_* en el entorno.
 */

import fs from 'fs';
import path from 'path';

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.VITE_APP_SUPABASE_URL;
const anonKey = process.env.VITE_APP_SUPABASE_ANON_KEY;

const headers = {
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`,
  'Content-Type': 'application/json',
};

function mask(value) {
  if (!value || value.length <= 12) return '***';
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

async function testFetch(label, fetchUrl, options = {}) {
  try {
    const res = await fetch(fetchUrl, { ...options, headers: { ...headers, ...options.headers } });
    const text = await res.text();
    let body = text;
    try {
      body = JSON.parse(text);
    } catch {
      // respuesta no JSON
    }
    return { label, ok: res.ok, status: res.status, body };
  } catch (err) {
    return {
      label,
      ok: false,
      status: null,
      error: err.cause?.code || err.code || err.message,
      message: err.message,
    };
  }
}

console.log('🔍 Diagnóstico de conexión Supabase\n');
console.log('='.repeat(55));

if (!url || !anonKey) {
  console.log('❌ Faltan variables de entorno.');
  console.log('   Crea .env.local con:');
  console.log('   VITE_APP_SUPABASE_URL=https://tu-proyecto.supabase.co');
  console.log('   VITE_APP_SUPABASE_ANON_KEY=tu_anon_key');
  console.log('\n   Copia env.example → .env.local y completa los valores.');
  process.exit(1);
}

console.log(`URL:  ${mask(url)} (${url})`);
console.log(`Key:  ${mask(anonKey)}`);
console.log('='.repeat(55));

const tests = [
  ['Ping REST API', `${url}/rest/v1/`, { method: 'HEAD' }],
  ['Tabla malla', `${url}/rest/v1/malla?select=id,texto&limit=1`],
  ['Tabla noticias', `${url}/rest/v1/noticias?select=id,contexto&limit=3&order=id.desc`],
  ['RPC viaja_ya', `${url}/rest/v1/rpc/viaja_ya`, { method: 'POST', body: '{}' }],
];

for (const [label, fetchUrl, opts] of tests) {
  const result = await testFetch(label, fetchUrl, opts);
  console.log(`\n📌 ${result.label}`);

  if (result.error) {
    console.log(`   ❌ Error de red: ${result.error}`);
    if (result.error === 'ENOTFOUND' || String(result.message).includes('getaddrinfo')) {
      console.log('   → El dominio no existe. Proyecto eliminado, URL incorrecta o DNS aún propagando.');
    }
    continue;
  }

  if (result.status === 503) {
    console.log('   ⚠️  HTTP 503 — Supabase aún reactivándose o no disponible.');
    console.log('   → Espera 10-15 min tras Restore y vuelve a probar.');
  } else if (result.ok) {
    console.log(`   ✅ HTTP ${result.status}`);
    const preview = JSON.stringify(result.body);
    console.log(`   Datos: ${preview.length > 200 ? preview.slice(0, 200) + '...' : preview}`);
  } else if (result.status === 401 || result.status === 403) {
    console.log(`   ❌ HTTP ${result.status} — Clave anon incorrecta o sin permisos (RLS).`);
    console.log(`   Respuesta: ${JSON.stringify(result.body)}`);
  } else {
    console.log(`   ❌ HTTP ${result.status}`);
    console.log(`   Respuesta: ${JSON.stringify(result.body)}`);
  }
}

console.log('\n' + '='.repeat(55));
console.log('📋 Checklist:');
console.log('  1. Supabase Dashboard → proyecto Active (no Paused)');
console.log('  2. Settings → API → URL y anon key coinciden con Render / .env.local');
console.log('  3. Si cambiaste variables en Render → Manual Deploy');
console.log('  4. Local: cp env.example .env.local y npm run dev');
console.log('  5. RLS: tablas malla/noticias deben permitir lectura anon si son públicas');
