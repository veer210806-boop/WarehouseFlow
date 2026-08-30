export default function Loading({ message = 'Loading warehouse data...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      color: 'var(--text-muted)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--border-medium)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: '16px'
      }} />
      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
