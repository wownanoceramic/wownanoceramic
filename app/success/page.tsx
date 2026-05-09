export default function SuccessPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontFamily: 'Montserrat, sans-serif',
      textAlign: 'center',
      padding: '40px'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
      <h1 style={{ color: '#F0C040', fontSize: '32px', marginBottom: '16px' }}>
        Comandă plasată cu succes!
      </h1>
      <p style={{ color: '#ccc', fontSize: '18px', maxWidth: '500px' }}>
        Îți mulțumim! Vei primi un email de confirmare în câteva minute.
        Comanda va fi livrată în 2-4 zile lucrătoare.
      </p>
      <a href="/" style={{
        marginTop: '32px',
        background: '#F0C040',
        color: '#000',
        padding: '14px 32px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '700'
      }}>
        Înapoi la site
      </a>
    </div>
  );
}