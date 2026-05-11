require('dotenv').config({ path: '.env.local' });

const EMAIL = process.env.OBLIO_EMAIL;
const SECRET = process.env.OBLIO_SECRET;

console.log('OBLIO_EMAIL:', EMAIL ? '✓ setat' : '✗ LIPSA');
console.log('OBLIO_SECRET:', SECRET ? '✓ setat' : '✗ LIPSA');

async function main() {
  // 1. Token
  console.log('\n--- AUTENTIFICARE ---');
  const params = new URLSearchParams({ client_id: EMAIL, client_secret: SECRET });

  const authRes = await fetch('https://www.oblio.eu/api/authorize/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const authData = await authRes.json();
  console.log('Status:', authRes.status);
  console.log('Raspuns:', JSON.stringify(authData, null, 2));

  if (!authData.access_token) {
    console.log('\n✗ Auth esuata - oprire.');
    return;
  }

  const token = authData.access_token;
  console.log('✓ Token obtinut!');

  // 2. Test factura
  console.log('\n--- CREARE FACTURA TEST ---');
  const today = new Date().toISOString().split('T')[0];

  const payload = {
    cif: '51554728',
    client: {
      name: 'Client Test',
      address: 'Str. Test 1',
      city: 'Rm.Valcea',
      state: 'Vâlcea',
      email: 'test@test.com',
      phone: '0700000000',
      cif: '',
      vatPayer: false,
    },
    issueDate: today,
    dueDate: today,
    seriesName: 'SW',
    language: 'RO',
    precision: 2,
    currency: 'RON',
    products: [
      {
        name: 'WOW NanoCeramic - Soluție Protecție Ceramică',
        code: 'WNC-001',
        price: 199,
        measuringUnit: 'buc',
        vatName: 'Normala',
        vatPercentage: 21,
        vatIncluded: 1,
        quantity: 1,
        productType: 'Marfa',
      },
    ],
  };

  const invRes = await fetch('https://www.oblio.eu/api/docs/invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const invData = await invRes.json();
  console.log('Status:', invRes.status);
  console.log('Raspuns:', JSON.stringify(invData, null, 2));
}

main().catch(console.error);
