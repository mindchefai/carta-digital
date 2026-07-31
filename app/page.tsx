export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 24,
        textAlign: "center",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 22, color: "#203C42", margin: 0 }}>Carta Digital by MindChef</h1>
      <p style={{ color: "#6b7280", maxWidth: 420 }}>
        Cada carta vive en Supabase y se sirve en <code>/[slug]</code>.
      </p>
      <a
        href="/demo"
        style={{
          marginTop: 8,
          padding: "10px 18px",
          borderRadius: 8,
          background: "#203C42",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          textDecoration: "none",
        }}
      >
        Ver carta de demo →
      </a>
    </main>
  );
}
