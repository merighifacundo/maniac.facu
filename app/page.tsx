const tileStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  border: "2px solid var(--ega-lgray)",
  background: "var(--ega-black)",
  textDecoration: "none",
  aspectRatio: "1 / 1",
  textAlign: "center",
  gap: 8,
};

export default function Page() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: 16,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          color: "var(--ega-yellow)",
          fontSize: 16,
          letterSpacing: 2,
          textAlign: "center",
        }}
      >
        PICK A GAME
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 16,
          width: "100%",
        }}
      >
        <a href="/mansion" style={{ ...tileStyle, color: "var(--ega-lgreen)" }}>
          <div style={{ fontSize: 12 }}>MANSION</div>
          <div style={{ fontSize: 8, color: "var(--ega-lgray)" }}>point &amp; click</div>
        </a>
        <a href="/lander" style={{ ...tileStyle, color: "var(--ega-lcyan)" }}>
          <div style={{ fontSize: 12 }}>MOON LANDER</div>
          <div style={{ fontSize: 8, color: "var(--ega-lgray)" }}>land the rocket</div>
        </a>
        <a href="/princes" style={{ ...tileStyle, color: "var(--ega-yellow)" }}>
          <div style={{ fontSize: 12 }}>TWO PRINCES</div>
          <div style={{ fontSize: 8, color: "var(--ega-lgray)" }}>throw for the throne</div>
        </a>
      </div>
    </main>
  );
}
