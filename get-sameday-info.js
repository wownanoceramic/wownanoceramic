// Script de test - ruleaza cu: node get-sameday-info.js
require('dotenv').config({ path: '.env.local' });

const USERNAME = process.env.SAMEDAY_API_USERNAME;
const PASSWORD = process.env.SAMEDAY_API_PASSWORD;

async function get(token, path) {
  const res = await fetch(`https://api.sameday.ro${path}`, {
    headers: { Authorization: token },
  });
  const status = res.status;
  let data;
  try { data = await res.json(); } catch { data = null; }
  return { status, data };
}

async function main() {
  // Autentificare
  const authRes = await fetch('https://api.sameday.ro/api/authenticate', {
    method: 'POST',
    headers: {
      'X-AUTH-USERNAME': USERNAME,
      'X-AUTH-PASSWORD': PASSWORD,
    },
  });
  const authData = await authRes.json();
  const token = authData.token;
  console.log('Token obtinut:', token ? '✓' : '✗');
  console.log('Auth response complet:', JSON.stringify(authData, null, 2));

  // Testeaza endpoint-uri posibile
  const endpoints = [
    '/api/client/services',
    '/api/client/pickup-points',
    '/api/client',
    '/api/v2/client/services',
    '/api/v2/client/pickup-points',
    '/api/awb',
    '/api/client/awb',
  ];

  console.log('\n--- TESTARE ENDPOINT-URI ---');
  for (const ep of endpoints) {
    const { status, data } = await get(token, ep);
    const ok = status >= 200 && status < 300;
    console.log(`${ok ? '✓' : '✗'} [${status}] ${ep}`);
    if (ok) console.log('  Data:', JSON.stringify(data).substring(0, 200));
  }
}

main().catch(console.error);
