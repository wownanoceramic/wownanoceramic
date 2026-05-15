'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

const JUDETE = [
  'Alba','Arad','Argeș','Bacău','Bihor','Bistrița-Năsăud','Botoșani','Brăila',
  'Brașov','București','Buzău','Călărași','Caraș-Severin','Cluj','Constanța',
  'Covasna','Dâmbovița','Dolj','Galați','Giurgiu','Gorj','Harghita','Hunedoara',
  'Ialomița','Iași','Ilfov','Maramureș','Mehedinți','Mureș','Neamț','Olt',
  'Prahova','Sălaj','Satu Mare','Sibiu','Suceava','Teleorman','Timiș','Tulcea',
  'Vâlcea','Vaslui','Vrancea',
];

const TRANSPORT_CURIER  = 21.99;
const TRANSPORT_EASYBOX = 16.99;

// Injectează județul în câmpul de căutare al widget-ului Sameday după ce se deschide
function injectCountySearch(county: string) {
  if (!county) return;

  // Încearcă la fiecare 200ms, max 3 secunde
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;

    // Caută toate inputurile vizibile în pagină
    const inputs = Array.from(document.querySelectorAll('input')) as HTMLInputElement[];

    // Câmpul de județ are placeholder "Caută în funcție de județ"
    const countyInput = inputs.find(el =>
      el.placeholder?.toLowerCase().includes('jude') ||
      el.placeholder?.toLowerCase().includes('county')
    );

    if (countyInput) {
      // Setăm valoarea și triggeram evenimentele necesare
      const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputSetter?.call(countyInput, county);
      countyInput.dispatchEvent(new Event('input',  { bubbles: true }));
      countyInput.dispatchEvent(new Event('change', { bubbles: true }));
      countyInput.focus();
      clearInterval(interval);
      return;
    }

    if (attempts >= 15) clearInterval(interval); // Stop după 3s
  }, 200);
}

// ─── EasyBox Widget ───────────────────────────────────────────────────────────
function EasyboxWidget({ onSelect, county }: {
  onSelect: (locker: { id: number; name: string; address: string; city: string }) => void;
  county: string;
}) {
  const [sdkReady, setSdkReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    function initPlugin() {
      if (initialized.current) return;
      initialized.current = true;
      try {
        (window as any).LockerPlugin.init({
          clientId: 'a1123899-1c58-4162-bf71-e2d2a320722b',
          apiUsername: 'starwowAPI',
          countryCode: 'RO',
          langCode: 'ro',
          theme: 'dark',
        });

        const instance = (window as any).LockerPlugin.getInstance();

        instance.subscribe((msg: any) => {
          if (msg?.lockerId) {
            onSelect({
              id: msg.lockerId,
              name: msg.name || `EasyBox #${msg.lockerId}`,
              address: msg.address || '',
              city: msg.city || '',
            });
            instance.close();
          }
        });

        instance.subscribeToPluginClosed(() => {});
        setSdkReady(true);
      } catch (e) {
        console.error('LockerPlugin init error:', e);
      }
    }

    if ((window as any).LockerPlugin) { initPlugin(); return; }
    if (document.getElementById('sameday-sdk')) return;

    const script = document.createElement('script');
    script.id = 'sameday-sdk';
    script.src = 'https://cdn.sameday.ro/locker-plugin/lockerpluginsdk.js';
    script.async = true;
    script.onload = () => initPlugin();
    script.onerror = () => console.error('Sameday SDK failed to load');
    document.body.appendChild(script);
  }, []);

  function handleOpen() {
    const plugin = (window as any).LockerPlugin;
    if (!plugin) {
      alert('Harta EasyBox se încarcă. Încearcă din nou în câteva secunde.');
      return;
    }
    if (!sdkReady) {
      setTimeout(() => handleOpen(), 500);
      return;
    }

    plugin.getInstance().open();

    // După ce se deschide widget-ul, injectăm județul în search
    if (county) {
      setTimeout(() => injectCountySearch(county), 400);
    }
  }

  return (
    <button type="button" onClick={handleOpen} style={{
      width: '100%', padding: '12px', background: '#1a1a1a',
      border: '1px solid #C9A020', color: '#C9A020', borderRadius: '8px',
      cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
      fontSize: '14px', fontWeight: '600',
    }}>
      📍 {sdkReady ? 'Deschide harta EasyBox' : 'Se încarcă harta...'}
    </button>
  );
}

// ─── Select județ ─────────────────────────────────────────────────────────────
function JudetSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      width: '100%', padding: '12px 14px', background: '#1a1a1a',
      border: '1px solid #333', borderRadius: '8px', color: value ? '#fff' : '#888',
      fontSize: '14px', cursor: 'pointer', appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23888\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")',
      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
    }}>
      <option value="">Selectează județul...</option>
      {JUDETE.map(j => <option key={j} value={j}>{j}</option>)}
    </select>
  );
}

// ─── Input stilizat ───────────────────────────────────────────────────────────
function Input({ placeholder, value, onChange, type = 'text' }: {
  placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <input type={type} placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '12px 14px', background: '#1a1a1a',
        border: '1px solid #333', borderRadius: '8px', color: '#fff',
        fontSize: '14px', outline: 'none', boxSizing: 'border-box',
        fontFamily: 'Montserrat, sans-serif',
      }}
    />
  );
}

// ─── Formular principal ───────────────────────────────────────────────────────
function ComandaForm() {
  const params = useSearchParams();
  const qty   = Number(params.get('qty')   || 1);
  const price = Number(params.get('price') || 0);

  const [deliveryType, setDeliveryType] = useState<'curier' | 'easybox'>('curier');
  const [locker, setLocker] = useState<{ id: number; name: string; address: string; city: string } | null>(null);

  const [name,   setName]   = useState('');
  const [phone,  setPhone]  = useState('');
  const [email,  setEmail]  = useState('');
  const [street, setStreet] = useState('');
  const [city,   setCity]   = useState('');
  const [county, setCounty] = useState('');

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  function handleLockerSelect(l: { id: number; name: string; address: string; city: string }) {
    setLocker(l);
    if (l.city) setCity(l.city);
  }

  const transportCost = qty === 1
    ? (deliveryType === 'easybox' ? TRANSPORT_EASYBOX : TRANSPORT_CURIER)
    : 0;
  const totalFinal = price + transportCost;

  async function handleSubmit() {
    setError('');
    if (!name || !phone || !email) { setError('Completează numele, telefonul și email-ul.'); return; }
    if (deliveryType === 'curier' && (!street || !city || !county)) { setError('Completează adresa completă pentru livrare curier.'); return; }
    if (deliveryType === 'easybox' && !locker)  { setError('Selectează un punct EasyBox de pe hartă.'); return; }
    if (deliveryType === 'easybox' && !county)  { setError('Selectează județul pentru livrare EasyBox.'); return; }

    setLoading(true);
    try {
      const body: any = { name, phone, email, quantity: qty, cashOnDelivery: totalFinal, deliveryType };

      if (deliveryType === 'curier') {
        body.street = street; body.city = city; body.county = county;
      } else {
        body.lockerId   = locker!.id;
        body.lockerName = locker!.name;
        body.street     = locker!.address;
        body.city       = locker!.city || city;
        body.county     = county;
      }

      const res  = await fetch('/api/order-cod', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Eroare la plasarea comenzii.');
      setSuccess('✅ Comandă plasată cu succes!');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <p style={{ color: '#C9A020', fontSize: '20px', fontWeight: '700' }}>{success}</p>
        <p style={{ color: '#aaa', marginTop: '12px' }}>Te vom contacta telefonic în scurt timp pentru confirmarea comenzii și generarea AWB-ului.</p>
<p style={{ color: '#C9A020', marginTop: '8px', fontWeight: '700' }}>📞 Sunăm de la: 0771 181 151</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Selector tip livrare */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {(['curier', 'easybox'] as const).map(type => (
          <button key={type} type="button"
            onClick={() => { setDeliveryType(type); setLocker(null); }}
            style={{
              flex: 1, padding: '14px', borderRadius: '10px', cursor: 'pointer',
              border: deliveryType === type ? '2px solid #C9A020' : '2px solid #333',
              background: deliveryType === type ? '#1a1500' : '#111',
              color: deliveryType === type ? '#C9A020' : '#888',
              fontWeight: '700', fontSize: '14px', fontFamily: 'Montserrat, sans-serif',
              transition: 'all 0.2s',
            }}
          >
            {type === 'curier' ? '🚚 Curier la ușă' : '📦 EasyBox'}
          </button>
        ))}
      </div>

      {/* Date personale */}
      <Input placeholder="Nume complet *" value={name}  onChange={setName} />
      <Input placeholder="Telefon *"      value={phone} onChange={setPhone} type="tel" />
      <Input placeholder="Email *"        value={email} onChange={setEmail} type="email" />

      {/* ── CURIER ── */}
      {deliveryType === 'curier' && (
        <>
          <Input placeholder="Stradă, număr, apartament *" value={street} onChange={setStreet} />
          <Input placeholder="Oraș *"                       value={city}   onChange={setCity} />
          <JudetSelect value={county} onChange={setCounty} />
        </>
      )}

      {/* ── EASYBOX ── */}
      {deliveryType === 'easybox' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <JudetSelect value={county} onChange={setCounty} />
          <EasyboxWidget onSelect={handleLockerSelect} county={county} />

          {locker && (
            <div style={{ padding: '12px', background: '#0d1a0d', border: '1px solid #2a5c2a', borderRadius: '8px' }}>
              <p style={{ color: '#4caf50', fontWeight: '700', margin: 0 }}>✓ EasyBox selectat</p>
              <p style={{ color: '#ccc', margin: '4px 0 0', fontSize: '13px' }}>
                {locker.name} — {locker.address}, {locker.city}
              </p>
              <button type="button" onClick={() => setLocker(null)} style={{
                marginTop: '8px', background: 'none', border: 'none',
                color: '#888', cursor: 'pointer', fontSize: '12px', padding: 0,
              }}>
                Schimbă lockerul
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p style={{ color: '#ff6b6b', margin: 0, fontSize: '14px' }}>{error}</p>}

      {/* Sumar comandă */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '10px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '14px' }}>
          <span>Produs (x{qty})</span>
          <span style={{ color: '#fff' }}>{price} RON</span>
        </div>
        {qty === 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '14px', marginTop: '8px' }}>
            <span>Transport {deliveryType === 'easybox' ? 'EasyBox' : 'Curier'}</span>
            <span style={{ color: '#fff' }}>{transportCost.toFixed(2)} RON</span>
          </div>
        )}
        {qty > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4caf50', fontSize: '13px', marginTop: '8px' }}>
            <span>Transport</span><span>GRATUIT</span>
          </div>
        )}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          color: '#C9A020', fontWeight: '700', fontSize: '16px',
          marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #333',
        }}>
          <span>Total</span>
          <span>{totalFinal.toFixed(2)} RON</span>
        </div>
      </div>

      <button type="button" onClick={handleSubmit} disabled={loading} style={{
        width: '100%', padding: '16px', background: loading ? '#555' : '#C9A020',
        border: 'none', borderRadius: '10px', color: '#000', fontWeight: '800',
        fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'Montserrat, sans-serif', letterSpacing: '1px',
        textTransform: 'uppercase', transition: 'background 0.2s',
      }}>
        {loading ? 'Se procesează...' : 'Plasează Comanda'}
      </button>
    </div>
  );
}

export default function ComandaRamburs() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start', color: '#fff',
      fontFamily: 'Montserrat, sans-serif', padding: '60px 20px',
    }}>
      <h1 style={{
        color: '#C9A020', fontSize: '24px', fontWeight: '800', letterSpacing: '3px',
        textTransform: 'uppercase', marginBottom: '32px',
      }}>
        Comandă Ramburs
      </h1>
      <Suspense fallback={<p style={{ color: '#aaa' }}>Se încarcă...</p>}>
        <ComandaForm />
      </Suspense>
    </div>
  );
}
