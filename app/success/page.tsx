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
        Îți mulțumim! Te vom contacta telefonic în scurt timp pentru confirmarea comenzii și generarea AWB-ului de livrare.
      </p>
      <p style={{ color: '#F0C040', fontSize: '16px', marginTop: '12px', fontWeight: '700' }}>
        📞 Sunăm de la: 0771 181 151
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
