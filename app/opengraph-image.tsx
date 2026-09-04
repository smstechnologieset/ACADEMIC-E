import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/content";

export const runtime = "edge";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #0369a1 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header with badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: "bold",
                color: "white",
                boxShadow: "0 10px 25px rgba(37,99,235,0.4)",
              }}
            >
              AE
            </div>
            <span style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
              {siteConfig.name}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "9999px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              fontSize: "14px",
              fontWeight: "600",
              color: "#93c5fd",
            }}
          >
            FAYDA ID Verified Intake
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "950px" }}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: "#60a5fa",
            }}
          >
            &ldquo;{siteConfig.tagline}&rdquo;
          </div>

          <div
            style={{
              fontSize: "52px",
              fontWeight: "900",
              lineHeight: 1.15,
              letterSpacing: "-1px",
              color: "#ffffff",
            }}
          >
            Global Higher Education & Job-Ready Skills for Ethiopia
          </div>

          <div
            style={{
              fontSize: "22px",
              fontWeight: "400",
              lineHeight: 1.5,
              color: "#cbd5e1",
              marginTop: "8px",
            }}
          >
            120+ Programs & 10,000+ Courses delivered via Skillsoft Percipio in partnership with
            University in New York.
          </div>
        </div>

        {/* Footer info pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#93c5fd" }}>
            ✦ Subsidized Tuition in ETB
          </div>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#93c5fd" }}>
            ✦ 24-Week Fast Tracks
          </div>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#93c5fd" }}>
            ✦ Postgraduate Diplomas
          </div>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#93c5fd" }}>
            ✦ 100% Online & Self-Paced
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
