'use client';
import { useState, useEffect } from 'react';

interface Order {
  id: string;
  type: 'ramburs' | 'card';
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  county: string;
  quantity: number;
  total: number;
  deliveryType: 'curier' | 'easybox';
  lockerId?: number;
  lockerName?: string;
  awb?: string;
  invoiceSeries?: string;
  invoiceNumber?: string;
  invoiceLink?: string;
  status: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, { text: string; ok: boolean }>>({});

  const handleLogin = async () => {
    const res = await fetch(`/api/admin/orders?pwd=${encodeURIComponent(password)}`);
    if (res.ok) {
      setAuthed(true);
      setAuthError('');
      const data = await res.json();
      setOrders(data.orders || []);
    } else {
      setAuthError('Parolă greșită.');
    }
  };

  const refreshOrders = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/orders?pwd=${encodeURIComponent(password)}`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
    }
    setLoading(false);
  };

  const generateAWB = async (orderId: string) => {
    setActionLoading(prev => ({ ...prev, [`awb_${orderId}`]: 'loading' }));
    const res = await fetch(`/api/admin/generate-awb?pwd=${encodeURIComponent(password)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessages(prev => ({ ...prev, [orderId]: { text: `✅ AWB: ${data.awb}`, ok: true } }));
      refreshOrders();
    } else {
      setMessages(prev => ({ ...prev, [orderId]: { text: `❌ ${data.error}`, ok: false } }));
    }
    setActionLoading(prev => ({ ...prev, [`awb_${orderId}`]: '' }));
  };

  const generateInvoice = async (orderId: string) => {
    setActionLoading(prev => ({ ...prev, [`inv_${orderId}`]: 'loading' }));
    const res = await fetch(`/api/admin/generate-invoice?pwd=${encodeURIComponent(password)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessages(prev => ({ ...prev, [orderId]: { text: `✅ Factură: ${data.invoice}`, ok: true } }));
      refreshOrders();
    } else {
      setMessages(prev => ({ ...prev, [orderId]: { text: `❌ ${data.error}`, ok: false } }));
    }
    setActionLoading(prev => ({ ...prev, [`inv_${orderId}`]: '' }));
  };

  const statusLabel = (order: Order) => {
    if (order.status === 'complete') return { label: '✅ Complet', color: '#2e7d32' };
    if (order.status === 'awb_done') return { label: '📦 AWB generat', color: '#1565c0' };
    if (order.status === 'invoice_done') return { label: '🧾 Facturat', color: '#6a1b9a' };
    return { label: '🆕 Nouă', color: '#e65100' };
  };

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#1a1a1a', padding: '40px', borderRadius: '12px', border: '1px solid #333', minWidth: '320px' }}>
          <h2 style={{ color: '#C9A020', marginBottom: '24px', textAlign: 'center' }}>🔐 Admin WOW NanoCeramic</h2>
          <input
            type="password"
            placeholder="Parolă admin"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #444', background: '#222', color: '#fff', fontSize: '16px', boxSizing: 'border-box' }}
          />
          {authError && <p style={{ color: '#f44', marginTop: '8px', fontSize: '14px' }}>{authError}</p>}
          <button
            onClick={handleLogin}
            style={{ marginTop: '16px', width: '100%', padding: '12px', background: '#C9A020', color: '#000', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Intră
          </button>
        </div>
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#fff', padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <h1 style={{ color: '#C9A020', margin: 0 }}>📦 Comenzi WOW NanoCeramic</h1>
          <button
            onClick={refreshOrders}
            disabled={loading}
            style={{ padding: '8px 16px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer' }}
          >
            {loading ? '...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Statistici rapide */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total comenzi', value: orders.length, color: '#C9A020' },
            { label: 'Noi (fără AWB)', value: orders.filter(o => !o.awb).length, color: '#e65100' },
            { label: 'Fără factură', value: orders.filter(o => !o.invoiceNumber).length, color: '#6a1b9a' },
            { label: 'Complete', value: orders.filter(o => o.status === 'complete').length, color: '#2e7d32' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '16px 24px', flex: 1, minWidth: '160px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Lista comenzi */}
        {sortedOrders.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '60px' }}>Nicio comandă încă.</div>
        ) : (
          sortedOrders.map(order => {
            const status = statusLabel(order);
            return (
              <div key={order.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                {/* Row 1: ID + Status + Data */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ background: order.type === 'card' ? '#1565c0' : '#e65100', color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      {order.type === 'card' ? '💳 CARD' : '💵 RAMBURS'}
                    </span>
                    <span style={{ color: '#888', fontSize: '13px', fontFamily: 'monospace' }}>{order.id}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: status.color, fontWeight: 'bold', fontSize: '14px' }}>{status.label}</span>
                    <span style={{ color: '#666', fontSize: '13px' }}>{new Date(order.createdAt).toLocaleString('ro-RO')}</span>
                  </div>
                </div>

                {/* Row 2: Date client + Date livrare */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ background: '#222', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ color: '#C9A020', fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>👤 DATE CLIENT</div>
                    <div><strong>{order.name}</strong></div>
                    <div style={{ color: '#aaa', fontSize: '14px' }}>{order.phone}</div>
                    <div style={{ color: '#aaa', fontSize: '14px' }}>{order.email}</div>
                  </div>
                  <div style={{ background: '#222', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ color: '#C9A020', fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>🚚 LIVRARE</div>
                    <div>{order.deliveryType === 'easybox' ? `📦 EasyBox: ${order.lockerName || `#${order.lockerId}`}` : '🚚 Curier la ușă'}</div>
                    <div style={{ color: '#aaa', fontSize: '14px' }}>{order.deliveryType !== 'easybox' && `${order.street}, ${order.city}, ${order.county}`}</div>
                    <div style={{ marginTop: '4px' }}><strong style={{ color: '#C9A020' }}>{order.total} RON</strong> × {order.quantity} buc</div>
                  </div>
                </div>

                {/* AWB + Factură info */}
                {(order.awb || order.invoiceNumber) && (
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {order.awb && (
                      <a
                        href={`https://sameday.ro/awb-tracking?awb=${order.awb}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: '#0d3b1e', border: '1px solid #2e7d32', color: '#66bb6a', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px' }}
                      >
                        📦 AWB: {order.awb} →
                      </a>
                    )}
                    {order.invoiceNumber && (
                      <a
                        href={order.invoiceLink || '#'}
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: '#1a0d2e', border: '1px solid #6a1b9a', color: '#ce93d8', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px' }}
                      >
                        🧾 {order.invoiceSeries} {order.invoiceNumber} →
                      </a>
                    )}
                  </div>
                )}

                {/* Mesaj acțiune */}
                {messages[order.id] && (
                  <div style={{ marginBottom: '12px', padding: '8px 14px', borderRadius: '6px', background: messages[order.id].ok ? '#0d3b1e' : '#3b0d0d', color: messages[order.id].ok ? '#66bb6a' : '#f44', fontSize: '14px' }}>
                    {messages[order.id].text}
                  </div>
                )}

                {/* Butoane acțiuni */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => generateAWB(order.id)}
                    disabled={!!order.awb || actionLoading[`awb_${order.id}`] === 'loading'}
                    style={{
                      padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: order.awb ? 'not-allowed' : 'pointer',
                      background: order.awb ? '#2a2a2a' : '#C9A020', color: order.awb ? '#666' : '#000',
                      fontWeight: 'bold', fontSize: '14px', opacity: order.awb ? 0.6 : 1,
                    }}
                  >
                    {actionLoading[`awb_${order.id}`] === 'loading' ? '⏳ Generare...' : order.awb ? '✅ AWB Generat' : '📦 Generează AWB Sameday'}
                  </button>

                  <button
                    onClick={() => generateInvoice(order.id)}
                    disabled={!!order.invoiceNumber || actionLoading[`inv_${order.id}`] === 'loading'}
                    style={{
                      padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: order.invoiceNumber ? 'not-allowed' : 'pointer',
                      background: order.invoiceNumber ? '#2a2a2a' : '#6a1b9a', color: order.invoiceNumber ? '#666' : '#fff',
                      fontWeight: 'bold', fontSize: '14px', opacity: order.invoiceNumber ? 0.6 : 1,
                    }}
                  >
                    {actionLoading[`inv_${order.id}`] === 'loading' ? '⏳ Emitere...' : order.invoiceNumber ? '✅ Facturat' : '🧾 Emite Factură Oblio'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
