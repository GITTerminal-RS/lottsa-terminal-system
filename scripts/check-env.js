#!/usr/bin/env node

/**
 * Script para verificar variables de entorno antes del build
 * Uso: node scripts/check-env.js
 */

const requiredEnvVars = [
  'VITE_APP_SUPABASE_URL',
  'VITE_APP_SUPABASE_ANON_KEY'
];

console.log('🔍 Verificando variables de entorno...\n');

let allPresent = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  
  if (!value) {
    console.log(`❌ ${varName}: NO CONFIGURADA`);
    allPresent = false;
  } else {
    // Mostrar solo los primeros y últimos caracteres por seguridad
    const maskedValue = value.length > 10 
      ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
      : '***';
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
});

console.log('\n' + '='.repeat(50));

if (allPresent) {
  console.log('🎉 Todas las variables de entorno están configuradas!');
  process.exit(0);
} else {
  console.log('⚠️  Faltan variables de entorno requeridas.');
  console.log('\n📋 Para configurar:');
  console.log('1. Crea un archivo .env.local');
  console.log('2. Agrega las variables faltantes');
  console.log('3. En Render, configúralas en Environment Variables');
  console.log('\n📖 Ver DEPLOYMENT.md para más detalles');
  process.exit(1);
}
