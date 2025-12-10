import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Quiz de Afinidade Financeira para Casais - Lemon";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(to bottom right, #111111, #000000)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "sans-serif",
        padding: "80px",
        position: "relative",
      }}
    >
      {/* Background decorations for "Modern/Dynamic" feel */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          left: "-100px",
          width: "400px",
          height: "400px",
          background: "rgba(132, 204, 22, 0.15)", // Low opacity lime
          borderRadius: "50%",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          right: "-100px",
          width: "500px",
          height: "500px",
          background: "rgba(132, 204, 22, 0.1)",
          borderRadius: "50%",
          filter: "blur(80px)",
        }}
      />

      {/* Header / Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "#84cc16",
            marginRight: "16px",
            boxShadow: "0 0 20px rgba(132, 204, 22, 0.5)",
          }}
        />
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.02em",
          }}
        >
          Lemon
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "#84cc16",
            marginBottom: "20px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            background: "rgba(132, 204, 22, 0.1)",
            padding: "8px 24px",
            borderRadius: "100px",
            border: "1px solid rgba(132, 204, 22, 0.2)",
          }}
        >
          Quiz para Casais
        </div>

        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            marginBottom: "20px",
          }}
        >
          Vocês dão <span style={{ color: "#84cc16" }}>Match</span>
          <br />
          Financeiro?
        </div>

        <div
          style={{
            fontSize: 32,
            color: "#a3a3a3",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            maxWidth: "800px",
          }}
        >
          Descubra a compatibilidade do casal e como prosperar juntos.
        </div>
      </div>

      {/* Footer / Archetypes Palls */}
      <div
        style={{
          display: "flex",
          gap: "40px",
          marginTop: "40px",
          opacity: 0.8,
        }}
      >
        {/* Using simple text for archetypes to intriguie */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#3b82f6",
            }}
          />
          <span style={{ color: "#d4d4d4", fontSize: 20 }}>Arquiteto</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#eab308",
            }}
          />
          <span style={{ color: "#d4d4d4", fontSize: 20 }}>Espírito Livre</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#a855f7",
            }}
          />
          <span style={{ color: "#d4d4d4", fontSize: 20 }}>Impulsionador</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#22c55e",
            }}
          />
          <span style={{ color: "#d4d4d4", fontSize: 20 }}>Essencialista</span>
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
