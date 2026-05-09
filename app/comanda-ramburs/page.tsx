'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const JUDETE = [
  'Alba','Arad','Argeș','Bacău','Bihor','Bistrița-Năsăud','Botoșani','Brăila',
  'Brașov','București','Buzău','Călărași','Caraș-Severin','Cluj','Constanța',
  'Covasna','Dâmbovița','Dolj','Galați','Giurgiu','Gorj','Harghita','Hunedoara',
  'Ialomița','Iași','Ilfov','Maramureș','Mehedinți','Mureș','Neamț','Olt',
  'Prahova','Sălaj','Satu Mare','Sibiu','Suceava','Teleorman','Timiș','Tulcea',
  'Vâlcea','Vaslui','Vrancea'
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', background: '#1a1a1a',
  border: '1px solid #333', color: '#fff', borderRadius: '6px',
  fontSize: '14px', fontFamily: 'Montserrat,sans-serif', outline: 'none',
  boxSizing: 'border-box'
};
const labelStyle: React.CSSProperties = {
  fontSize: '12px', fontWeight: '600', color: '#ccc',
  marginBottom: '6px', display: 'block', letterSpacing: '0.5px'
};
const rowStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'
};
const sectionTitle: React.CSSProperties = {
  fontSize: '13px', fontWeight: '800', letterSpacing: '2px',
  textTransform: 'uppercase' as const, color: '#fff',
  marginBottom: '20px', paddingBottom: '10px',
  borderBottom: '1px solid rgba(201,160,32,0.2)'
};
const errorStyle: React.CSSProperties = {
  color: '#e53935', fontSize: '11px', marginTop: '4px'
};

function FormField({ label, required, children, error }: any) {
  return (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{color:'#C9A020'}}> *</span>}</label>
      {children}
      {error && <div style={errorStyle}>{label} este un câmp obligatoriu.</div>}
    </div>
  );
}

function JudetSelect({ value, onChange, error }: any) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{...inputStyle, appearance: 'none' as const, backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23888\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center'}}>
      <option value="">Selectează o opțiune...</option>
      {JUDETE.map(j => <option key={j} value={j}>{j}</option>)}
    </select>
  );
}

function ComandaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qty = searchParams.get('qty') || '1';
  const price = searchParams.get('price') || '99';
  const [loading, setLoading] = useState(false);
  const [altaAdresa, setAltaAdresa] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [form, setForm] = useState({
    nume: '', prenume: '', adresa: '', email: '', telefon: '',
    localitate: '', judet: '', numeSocietate: '', codFiscal: '', tara: 'România',
    sNume: '', sPrenume: '', sAdresa: '', sLocalitate: '', sJudet: '', sTara: 'România'
  });

  const set = (field: string) => (e: any) => setForm(f => ({...f, [field]: e.target.value}));

  function validate() {
    const req = ['nume','prenume','adresa','email','telefon','localitate','judet'];
    const sReq = altaAdresa ? ['sNume','sPrenume','sAdresa','sLocalitate','sJudet'] : [];
    const errs: any = {};
    [...req, ...sReq].forEach(k => { if (!form[k as keyof typeof form].trim()) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/order-cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: qty, price, altaAdresa })
      });
      const data = await res.json();
      if (data.success) router.push('/success');
      else { alert('Eroare. Încearcă din nou.'); setLoading(false); }
    } catch { alert('Eroare de conexiune.'); setLoading(false); }
  }

  return (
    <div style={{width:'100%', maxWidth:'640px'}}>
      {/* Order summary */}
      <div style={{background:'rgba(201,160,32,0.08)', border:'1px solid rgba(201,160,32,0.25)', borderRadius:'8px', padding:'14px 18px', marginBottom:'28px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <span style={{color:'#ccc', fontSize:'13px'}}>WOW NanoCeramic x{qty} — Ramburs</span>
        <span style={{color:'#C9A020', fontWeight:'700', fontSize:'16px'}}>{price} RON</span>
      </div>

      {/* Billing section */}
      <div style={sectionTitle}>Detalii Facturare și Livrare</div>

      <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
        <div style={rowStyle}>
          <FormField label="Nume" required error={errors.nume}>
            <input style={inputStyle} placeholder="Nume" value={form.nume} onChange={set('nume')}/>
          </FormField>
          <FormField label="Prenume" required error={errors.prenume}>
            <input style={inputStyle} placeholder="Prenume" value={form.prenume} onChange={set('prenume')}/>
          </FormField>
        </div>

        <FormField label="Adresă" required error={errors.adresa}>
          <input style={inputStyle} placeholder="Nume stradă, număr, apartament, etc." value={form.adresa} onChange={set('adresa')}/>
        </FormField>

        <div style={rowStyle}>
          <FormField label="Adresă Email" required error={errors.email}>
            <input style={inputStyle} type="email" placeholder="Adresă Email" value={form.email} onChange={set('email')}/>
          </FormField>
          <FormField label="Telefon" required error={errors.telefon}>
            <input style={inputStyle} placeholder="Număr Telefon" value={form.telefon} onChange={set('telefon')}/>
          </FormField>
        </div>

        <div style={rowStyle}>
          <FormField label="Localitate" required error={errors.localitate}>
            <input style={inputStyle} placeholder="Municipiu/Oraș/Localitate" value={form.localitate} onChange={set('localitate')}/>
          </FormField>
          <FormField label="Județ" required error={errors.judet}>
            <JudetSelect value={form.judet} onChange={(v:string) => setForm(f=>({...f,judet:v}))} error={errors.judet}/>
          </FormField>
        </div>

        <div style={rowStyle}>
          <FormField label="Nume Societate (opțional)">
            <input style={inputStyle} placeholder="SRL, PFA, etc. - opțional" value={form.numeSocietate} onChange={set('numeSocietate')}/>
          </FormField>
          <FormField label="Cod Fiscal Societate (opțional)">
            <input style={inputStyle} placeholder="CUI - opțional" value={form.codFiscal} onChange={set('codFiscal')}/>
          </FormField>
        </div>

        <FormField label="Țară/regiune" required>
          <select style={{...inputStyle}} value={form.tara} onChange={set('tara')}>
            <option>România</option>
          </select>
        </FormField>

        {/* Checkbox alta adresa */}
        <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', marginTop:'4px'}}>
          <input type="checkbox" checked={altaAdresa} onChange={e => setAltaAdresa(e.target.checked)}
            style={{width:'16px', height:'16px', cursor:'pointer', accentColor:'#C9A020'}}/>
          <span style={{color:'#fff', fontSize:'13px', fontWeight:'600'}}>Livrezi la o altă adresă?</span>
        </label>

        {/* Shipping address */}
        {altaAdresa && (
          <div style={{borderTop:'1px solid rgba(201,160,32,0.2)', paddingTop:'20px', display:'flex', flexDirection:'column', gap:'14px', marginTop:'8px'}}>
            <div style={sectionTitle}>Adresă de Livrare</div>
            <div style={rowStyle}>
              <FormField label="Nume" required error={errors.sNume}>
                <input style={inputStyle} placeholder="Nume" value={form.sNume} onChange={set('sNume')}/>
              </FormField>
              <FormField label="Prenume" required error={errors.sPrenume}>
                <input style={inputStyle} placeholder="Prenume" value={form.sPrenume} onChange={set('sPrenume')}/>
              </FormField>
            </div>
            <FormField label="Adresă" required error={errors.sAdresa}>
              <input style={inputStyle} placeholder="Nume stradă, număr, apartament, etc." value={form.sAdresa} onChange={set('sAdresa')}/>
            </FormField>
            <div style={rowStyle}>
              <FormField label="Localitate" required error={errors.sLocalitate}>
                <input style={inputStyle} placeholder="Municipiu/Oraș/Localitate" value={form.sLocalitate} onChange={set('sLocalitate')}/>
              </FormField>
              <FormField label="Județ" required error={errors.sJudet}>
                <JudetSelect value={form.sJudet} onChange={(v:string) => setForm(f=>({...f,sJudet:v}))} error={errors.sJudet}/>
              </FormField>
            </div>
            <FormField label="Țară/regiune" required>
              <select style={{...inputStyle}} value={form.sTara} onChange={set('sTara')}>
                <option>România</option>
              </select>
            </FormField>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          width:'100%', padding:'16px', background:'linear-gradient(135deg,#F0C040 0%,#B8860B 40%,#F5D060 60%,#8B6508 100%)',
          color:'#000', border:'none', borderRadius:'6px', fontWeight:'800',
          fontSize:'13px', letterSpacing:'2px', textTransform:'uppercase' as const,
          cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'Montserrat,sans-serif',
          marginTop:'8px', opacity: loading ? 0.7 : 1
        }}>
          {loading ? 'Se trimite...' : 'Plasează Comanda'}
        </button>
      </div>
    </div>
  );
}

export default function ComandaRamburs() {
  return (
    <div style={{
      minHeight:'100vh', background:'#0a0a0a', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'flex-start', color:'#fff',
      fontFamily:'Montserrat,sans-serif', padding:'60px 20px'
    }}>
      <h1 style={{color:'#C9A020', fontSize:'24px', fontWeight:'800', letterSpacing:'3px',
        textTransform:'uppercase', marginBottom:'32px'}}>
        Comandă Ramburs
      </h1>
      <Suspense fallback={<p style={{color:'#aaa'}}>Se încarcă...</p>}>
        <ComandaForm/>
      </Suspense>
    </div>
  );
}
