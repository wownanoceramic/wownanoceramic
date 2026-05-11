const SAMEDAY_API = 'https://api.sameday.ro';

// ─── Autentificare ────────────────────────────────────────────────────────────
export async function samedayAuth(): Promise<string> {
  const res = await fetch(`${SAMEDAY_API}/api/authenticate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-App': process.env.SAMEDAY_USERNAME!,
    },
    body: JSON.stringify({
      username: process.env.SAMEDAY_USERNAME,
      password: process.env.SAMEDAY_PASSWORD,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sameday auth failed: ${err}`);
  }

  const data = await res.json();
  return data.token; // "Bearer eyJ..."
}

// ─── Lockerele EasyBox pentru un județ ───────────────────────────────────────
export async function getEasyboxLockers(county: string) {
  const token = await samedayAuth();

  const res = await fetch(
    `${SAMEDAY_API}/api/easybox-pod-locations?county=${encodeURIComponent(county)}&countryCode=RO`,
    {
      headers: { Authorization: token },
    }
  );

  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

// ─── Creare AWB ───────────────────────────────────────────────────────────────
export interface AWBParams {
  // Date destinatar
  name: string;
  phone: string;
  email: string;
  street: string;    // adresa completa
  city: string;
  county: string;

  // Comanda
  cashOnDelivery: number; // 0 pentru plata card
  quantity: number;
  observation?: string;

  // Livrare
  deliveryType: 'curier' | 'easybox';
  lockerId?: number; // doar pentru EasyBox

  // Pickup point (selectat de admin)
  pickupPointId?: number;
}

export async function createAWB(params: AWBParams): Promise<{ awb: string; awbPdf?: string }> {
  const token = await samedayAuth();

  // Pickup point: folosim primul ID ca default, al doilea ca fallback
  const pickupPoint = params.pickupPointId || Number(process.env.SAMEDAY_PICKUP_POINT) || 396691;

  // Greutate: 0.2 kg per produs
  const weight = params.quantity * 0.2;

  const payload: any = {
    pickupPoint,
    packageType: 1,          // 1 = colet
    packageNumber: 1,
    packageWeight: weight,
    awbPayment: 1,            // 1 = destinatarul plătește (ramburs sau taxa livrare)
    cashOnDelivery: params.cashOnDelivery,
    cashOnDeliveryReturns: params.cashOnDelivery > 0 ? 1 : 0,
    insuredValue: 0,
    thirdPartyPickup: 0,
    observation: params.observation || `WOW NanoCeramic x${params.quantity}`,
    awbRecipient: {
      name: params.name,
      phoneNumber: params.phone,
      email: params.email,
      address: {
        name: params.name,
        postalCode: '',
        city: params.city,
        county: params.county,
        countryCode: 'RO',
        details: params.street,
      },
    },
    parcels: [
      {
        weight,
        width: 15,
        length: 20,
        height: 5,
        type: 1,
      },
    ],
  };

  // Serviciu: curier NextDay sau EasyBox
  if (params.deliveryType === 'easybox' && params.lockerId) {
    payload.service = Number(process.env.SAMEDAY_SERVICE_EASYBOX) || 39; // ID serviciu EasyBox
    payload.locker = params.lockerId;
  } else {
    payload.service = Number(process.env.SAMEDAY_SERVICE_NEXTDAY) || 7;  // ID serviciu NextDay
  }

  const res = await fetch(`${SAMEDAY_API}/api/awb`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.awbNumber) {
    throw new Error(`Sameday AWB error: ${JSON.stringify(data)}`);
  }

  return {
    awb: data.awbNumber,
    awbPdf: data.pdfLink || undefined,
  };
}
