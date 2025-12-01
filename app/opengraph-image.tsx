import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Lemon - Finanças Inteligentes para Casais";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(to bottom right, #1a1a1a, #000000)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        {/* Lime Circle Branding Element */}
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "#84cc16", // Lime-500
            marginRight: "20px",
            boxShadow: "0 0 30px rgba(132, 204, 22, 0.4)",
          }}
        />
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.05em",
          }}
        >
          Lemon
        </div>
      </div>
      <div
        style={{
          fontSize: 40,
          color: "#a3a3a3", // Neutral-400
          fontWeight: 500,
          letterSpacing: "-0.02em",
        }}
      >
        Finanças Inteligentes para Casais
      </div>
    </div>,
    {
      ...size,
    }
  );
}
