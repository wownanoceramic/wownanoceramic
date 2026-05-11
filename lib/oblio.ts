const OBLIO_API = 'https://www.oblio.eu/api';
const CIF = '51554728';
const SERIES = 'SW';

// ─── OAuth 2.0 Token (x-www-form-urlencoded) ─────────────────────────────────
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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Oblio auth failed: ${err}`);
  }

  const data = await res.json();

  if (!data.access_token) {
    throw new Error(`Oblio: token lipsa in raspuns: ${JSON.stringify(data)}`);
  }

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
  unitPrice: number;
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
    products: [
      {
        name: 'WOW NanoCeramic - Soluție Protecție Ceramică',
        code: 'WNC-001',
        price: params.unitPrice,
        measuringUnit: 'buc',
        vatName: 'Normala',
        vatPercentage: 21,
        vatIncluded: 1,
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
