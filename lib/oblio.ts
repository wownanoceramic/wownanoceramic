const OBLIO_API = 'https://www.oblio.eu/api';
const CIF = '51554728';
const SERIES = 'SW';
const GESTIUNE = 'EMAG';

// ─── OAuth 2.0 Token ──────────────────────────────────────────────────────────
async function getOblioToken(): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.OBLIO_EMAIL!,
    client_secret: process.env.OBLIO_SECRET!,
  });
  const res = await fetch(`${OBLIO_API}/authorize/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const rawAuth = await res.text();
  if (!res.ok) throw new Error(`Oblio auth failed [${res.status}]: ${rawAuth}`);
  const data = JSON.parse(rawAuth);
  if (!data.access_token) throw new Error(`Oblio: token lipsa: ${rawAuth}`);
  return data.access_token;
}

// ─── Creare Factură Fiscală ───────────────────────────────────────────────────
export interface InvoiceParams {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  quantity: number;
  unitPrice: number;       // preț produs fără transport
  transportCost: number;   // 0 dacă e gratuit
  totalAmount: number;
  issueDate?: string;
}

export async function createInvoice(params: InvoiceParams): Promise<{
  seriesName: string;
  number: string;
  link: string;
}> {
  const token = await getOblioToken();
  const today = new Date().toISOString().split('T')[0];

  // ─── Produse ─────────────────────────────────────────────────────────────
  const products: any[] = [
    {
      name: 'Kit Complet WOW NanoCeramic',
      code: 'CS-IT-252',
      management: GESTIUNE,
      price: params.unitPrice,
      measuringUnit: 'buc',
      vatName: 'Normala',
      vatPercentage: 21,
      vatIncluded: 1,
      quantity: params.quantity,
      productType: 'Produs Finit',
    },
  ];

  // Adaugă transport doar dacă e > 0
  if (params.transportCost > 0) {
    products.push({
      name: 'Transport',
      code: 'TRANSPORT',
      management: GESTIUNE,
      price: params.transportCost,
      measuringUnit: 'buc',
      vatName: 'Normala',
      vatPercentage: 21,
      vatIncluded: 1,
      quantity: 1,
      productType: 'Serviciu',
    });
  }

  const payload = {
    cif: CIF,
    client: {
      name: params.name,
      address: params.address,
      city: params.city,
      state: params.county,
      email: params.email,
      phone: params.phone,
      cif: '',
      vatPayer: false,
    },
    issueDate: params.issueDate || today,
    dueDate: params.issueDate || today,
    deliveryDate: params.issueDate || today,
    seriesName: SERIES,
    language: 'RO',
    precision: 2,
    currency: 'RON',
    useStock: 1,
    products,
  };

  console.log('[Oblio] payload:', JSON.stringify(payload));

  const res = await fetch(`${OBLIO_API}/docs/invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const rawInvoice = await res.text();
  console.log(`[Oblio] response [${res.status}]:`, rawInvoice);

  let data: any;
  try {
    data = JSON.parse(rawInvoice);
  } catch {
    throw new Error(`Oblio invoice: JSON invalid [${res.status}]: ${rawInvoice}`);
  }

  if (!res.ok || data.status !== 200) {
    throw new Error(`Oblio invoice error [${res.status}]: ${JSON.stringify(data)}`);
  }

  return {
    seriesName: data.data?.seriesName || SERIES,
    number: String(data.data?.number || ''),
    link: data.data?.link || '',
  };
}
