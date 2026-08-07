import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SideArt } from "./lib/kit";

// Portada 1920x1080 para módulo o clase. Misma identidad que los videos.
// Varía por: tag (MÓDULO X / CLASE X.Y) · title · icon (SideArt) · color (acento del módulo).
export type PortadaProps = { tag: string; title: string; sub?: string; icon: string; color?: string; titleSize?: number };

export const Portada: React.FC<PortadaProps> = ({ tag, title, sub, icon, color = "#22d3ee", titleSize = 132 }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#07070f", fontFamily: "Segoe UI, sans-serif" }}>
      <Img src={staticFile("bg.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* velo para contraste del texto */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(7,7,15,.82) 0%,rgba(7,7,15,.5) 55%,rgba(7,7,15,0) 100%)" }} />

      {/* bloque de texto */}
      <div style={{ position: "absolute", left: 130, top: 0, bottom: 0, width: 1120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 30 }}>
          <div style={{ width: 44, height: 6, background: color, borderRadius: 99, boxShadow: `0 0 16px ${color}` }} />
          <span style={{ color, fontSize: 30, fontWeight: 800, letterSpacing: 7, textTransform: "uppercase" }}>{tag}</span>
        </div>
        <div style={{ fontSize: titleSize, fontWeight: 800, letterSpacing: -3, lineHeight: 1.02, color: "#fff", textShadow: "0 6px 40px rgba(0,0,0,.5)" }}>{title}</div>
        {sub && <div style={{ marginTop: 34, fontSize: 40, fontWeight: 300, color: "#c4c4d4", maxWidth: 940, lineHeight: 1.3 }}>{sub}</div>}
        <div style={{ marginTop: 64, display: "flex", alignItems: "center", gap: 14, opacity: 0.9 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#22d3ee)" }} />
          <span style={{ fontSize: 26, fontWeight: 700, color: "#e8e8f0", letterSpacing: 1 }}>Sistema de Ingresos Diarios</span>
        </div>
      </div>

      {/* ícono temático */}
      <div style={{ position: "absolute", right: 150, top: "50%", transform: "translateY(-50%)" }}>
        <SideArt name={icon} color={color} size={540} />
      </div>
    </AbsoluteFill>
  );
};
