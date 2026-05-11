const SAMEDAY_API = 'https://api.sameday.ro';

// ─── Autentificare ────────────────────────────────────────────────────────────
export async function samedayAuth(): Promise<string> {
  const res = await fetch(`${SAMEDAY_API}/api/authenticate`, {
    method: 'POST',
    headers: {
      'X-AUTH-USERNAME': process.env.SAMEDAY_USERNAME!,
      'X-AUTH-PASSWORD': process.env.SAMEDAY_PASSWORD!,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sameday auth failed: ${err}`);
  }

  const data = await res.json();
  return data.token; // "Bearer eyJ..."
}

// ─── Creare AWB ───────────────────────────────────────────────────────────────
export interface AWBParams {
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  county: string;
  cashOnDelivery: number;
  quantity: number;
  observation?: string;
  deliveryType: 'curier' | 'easybox';
  lockerId?: number;
  pickupPointId?: number;
}

export async function createAWB(params: AWBParams): Promise<{ awb: string }> {
  const token = await samedayAuth();

  const pickupPoint = params.pickupPointId
    || Number(process.env.SAMEDAY_PICKUP_POINT)
    || 396691;

  const weight = params.quantity * 0.2;

  const serviceId = params.deliveryType === 'easybox'
    ? Number(process.env.SAMEDAY_SERVICE_EASYBOX) || 39
    : Number(process.env.SAMEDAY_SERVICE_NEXTDAY) || 7;

  const payload: any = {
    pickupPoint,
    packageType: 1,
    packageNumber: 1,
    packageWeight: weight,
    service: serviceId,
    awbPayment: 1,
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
    parcels: [{ weight, width: 15, length: 20, height: 5, type: 1 }],
  };

  if (params.deliveryType === 'easybox' && params.lockerId) {
    payload.locker = params.lockerId;
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

  return { awb: data.awbNumber };
}
