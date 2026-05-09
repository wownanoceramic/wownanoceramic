'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ComandaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qty = searchParams.get('qty') || '1';
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    const res = await fetch('/api/order-cod', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, quantity: qty })
    });
    const data = await res.json();
    if (data.success) {
      router.push('/success');
    } else {
      alert('Eroare. Incearca din nou.');
      setLoading(false);
    }
  }

  return (
    <div style={{ width:'100%', maxWidth:'400px', display:'flex', flexDirection:'column', gap:'16px' }}>
      <p style={{ color:'#aaa', marginBottom:'16px', textAlign:'center' }}>WOW NanoCeramic x{qty} — Plătești la livrare</p>
      <input placeholder="Nume complet" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
        style={{ padding:'14px', background:'#1a1a1a', border:'1px solid #333', color:'#fff', borderRadius:'6px', fontSize:'15px' }} />
      <input placeholder="Telefon" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
        style={{ padding:'14px', background:'#1a1a1a', border:'1px solid #333', color:'#fff', borderRadius:'6px', fontSize:'15px' }} />
      <input placeholder="Adresa completa (strada, nr, oras, judet)" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
        style={{ padding:'14px', background:'#1a1a1a', border:'1px solid #333', color:'#fff', borderRadius:'6px', fontSize:'15px' }} />
      <button onClick={handleSubmit} disabled={loading}
        style={{ padding:'16px', background:'#F0C040', color:'#000', border:'none', borderRadius:'6px', fontWeight:'700', fontSize:'16px', cursor:'pointer' }}>
        {loading ? 'Se trimite...' : 'Plasează Comanda'}
      </button>
    </div>
  );
}

export default function ComandaRamburs() {
  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'Montserrat,sans-serif', padding:'40px' }}>
      <h1 style={{ color:'#F0C040', marginBottom:'8px' }}>Comandă Ramburs</h1>
      <Suspense fallback={<p style={{color:'#aaa'}}>Se încarcă...</p>}>
        <ComandaForm />
      </Suspense>
    </div>
  );
}