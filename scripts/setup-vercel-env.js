/**
 * Vercel Environment Variables Setup Script
 * 
 * This script is a REFERENCE for setting up Vercel env vars.
 * The actual secret values are stored in .env.local (gitignored).
 * 
 * To run manually:
 *   node scripts/setup-vercel-env.js
 * 
 * Or add variables individually:
 *   vercel env add DATABASE_URL production
 *   vercel env add DIRECT_URL production
 *   ...etc
 */

const { spawnSync, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const cwd = path.resolve(__dirname, '..');

// Read values from .env.local if it exists
function readEnvFile(filePath) {
  const envVars = {};
  if (!fs.existsSync(filePath)) return envVars;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
  return envVars;
}

const envLocalPath = path.join(cwd, '.env.local');
const envPath = path.join(cwd, '.env');
const localVars = { ...readEnvFile(envPath), ...readEnvFile(envLocalPath) };

// Required environment variable names for the project
const requiredVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'OWNER_ALERT_EMAIL',
  'SECONDARY_OWNER_ALERT_EMAIL',
  'SHOP_WHATSAPP_NUMBER',
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
];

const envTarget = process.argv[2] || 'production';

console.log(`Setting up Vercel environment variables for [${envTarget}]...\n`);
console.log('Reading values from .env.local and .env files...\n');

let successCount = 0;
let failCount = 0;

for (const name of requiredVars) {
  const value = localVars[name];
  if (!value) {
    console.log(`⚠ Skipping ${name} - not found in local env files`);
    failCount++;
    continue;
  }

  try {
    // Remove existing
    try {
      execSync(`vercel env rm ${name} ${envTarget} --yes`, { cwd, encoding: 'utf8', stdio: 'pipe' });
      console.log(`  Removed existing ${name}`);
    } catch (e) {
      // ignore - may not exist
    }

    // Add new value using stdin
    const result = spawnSync('vercel', ['env', 'add', name, envTarget], {
      cwd,
      input: value + '\n',
      encoding: 'utf8',
      shell: true,
    });

    const combined = (result.stdout || '') + (result.stderr || '');
    if (result.status === 0 || combined.includes('Added')) {
      console.log(`✓ Added ${name} to ${envTarget}`);
      successCount++;
    } else {
      console.log(`✗ Failed ${name}: ${combined.slice(0, 100)}`);
      failCount++;
    }
  } catch (e) {
    console.error(`Error setting ${name}:`, e.message);
    failCount++;
  }
}

console.log(`\n✅ Done! ${successCount} variables added, ${failCount} skipped/failed.`);
console.log('Run "vercel env ls" to verify.');
