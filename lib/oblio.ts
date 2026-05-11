const OBLIO_API = 'https://www.oblio.eu/api';
const CIF = '51554728';
const SERIES = 'SW';

// ─── OAuth 2.0 Token ──────────────────────────────────────────────────────────
async function getOblioToken(): Promise<string> {
  const res = await fetch(`${OBLIO_API}/authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.OBLIO_EMAIL,
      client_secret: process.env.OBLIO_SECRET,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Oblio auth failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

// ─── Creare Factură Fiscală ───────────────────────────────────────────────────
export interface InvoiceParams {
  // Client
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  county: string;

  // Comandă
  quantity: number;
  unitPrice: number;       // pretul per unitate CU TVA inclus
  totalAmount: number;     // total comanda CU TVA inclus
  issueDate?: string;      // YYYY-MM-DD, default: azi
}

export async function createInvoice(params: InvoiceParams): Promise<{
  seriesName: string;
  number: string;
  link: string;
}> {
  const token = await getOblioToken();

  const today = new Date().toISOString().split('T')[0];

  const payload = {
    cif: CIF,
    client: {
      name: params.name,
      address: params.address,
      city: params.city,
      state: params.county,
      email: params.email,
      phone: params.phone,
      // CIF gol = persoana fizica (fara datele firmei)
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
    products: [
      {
        name: 'WOW NanoCeramic - Soluție Protecție Ceramică',
        code: 'WNC-001',
        price: params.unitPrice,
        measuringUnit: 'buc',
        vatName: 'Normala',
        vatPercentage: 21,
        vatIncluded: 1,       // pretul include TVA
        quantity: params.quantity,
        productType: 'Marfa',
      },
    ],
  };

  const res = await fetch(`${OBLIO_API}/docs/invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || data.status !== 200) {
    throw new Error(`Oblio invoice error: ${JSON.stringify(data)}`);
  }

  return {
    seriesName: data.data?.seriesName || SERIES,
    number: String(data.data?.number || ''),
    link: data.data?.link || '',
  };
}
