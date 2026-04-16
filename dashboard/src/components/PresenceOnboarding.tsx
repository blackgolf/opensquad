import { FormEvent, useMemo, useState } from "react";
import { CHARACTER_NAMES, type CharacterName } from "@/office/assetKeys";
import { useSquadStore } from "@/store/useSquadStore";

const STARTER_ROLES = ["Founder", "Operator", "Client", "PM"];

export function PresenceOnboarding() {
  const setUserProfile = useSquadStore((s) => s.setUserProfile);
  const initialAvatar = useMemo(() => CHARACTER_NAMES[0] as CharacterName, []);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Operator");
  const [avatar, setAvatar] = useState<CharacterName>(initialAvatar);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setUserProfile({
      name: trimmedName,
      avatar,
      role,
    });
  }

  return (
    <div style={backdropStyle}>
      <form style={dialogStyle} onSubmit={handleSubmit}>
        <div style={eyebrowStyle}>Living Dashboard MVP</div>
        <h2 style={titleStyle}>Entre no escritorio do seu squad</h2>
        <p style={subtitleStyle}>
          Crie seu avatar para circular pelo dashboard, chegar perto dos agentes e abrir conversas contextuais.
        </p>

        <label style={labelStyle}>
          Nome
          <input
            style={inputStyle}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Rafael"
            autoFocus
          />
        </label>

        <label style={labelStyle}>
          Papel
          <select style={inputStyle} value={role} onChange={(event) => setRole(event.target.value)}>
            {STARTER_ROLES.map((starterRole) => (
              <option key={starterRole} value={starterRole}>
                {starterRole}
              </option>
            ))}
          </select>
        </label>

        <div style={labelStyle}>
          Avatar
          <div style={avatarGridStyle}>
            {CHARACTER_NAMES.map((characterName) => {
              const isSelected = characterName === avatar;

              return (
                <button
                  key={characterName}
                  type="button"
                  onClick={() => setAvatar(characterName)}
                  style={{
                    ...avatarOptionStyle,
                    borderColor: isSelected ? "var(--accent-cyan)" : "rgba(255,255,255,0.12)",
                    background: isSelected ? "rgba(30, 197, 255, 0.15)" : "rgba(255,255,255,0.04)",
                  }}
                >
                  <img
                    src={`/assets/avatars/${characterName}_talk.png`}
                    alt={characterName}
                    style={avatarImageStyle}
                  />
                  <span style={avatarLabelStyle}>{characterName}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" style={primaryButtonStyle} disabled={!name.trim()}>
          Entrar no escritorio
        </button>
      </form>
    </div>
  );
}

const backdropStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background:
    "radial-gradient(circle at top, rgba(56, 125, 255, 0.22), transparent 36%), rgba(7, 10, 17, 0.72)",
  backdropFilter: "blur(10px)",
  zIndex: 30,
};

const dialogStyle: React.CSSProperties = {
  width: "min(920px, 100%)",
  maxHeight: "100%",
  overflow: "auto",
  padding: 24,
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(19, 28, 44, 0.96), rgba(11, 17, 29, 0.96))",
  boxShadow: "0 32px 64px rgba(0,0,0,0.36)",
  display: "grid",
  gap: 16,
};

const eyebrowStyle: React.CSSProperties = {
  color: "var(--accent-cyan)",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1.5,
};

const titleStyle: React.CSSProperties = {
  fontSize: 28,
  lineHeight: 1.1,
};

const subtitleStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 14,
  lineHeight: 1.6,
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  fontSize: 13,
  color: "var(--text-secondary)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text-primary)",
  fontFamily: "inherit",
  outline: "none",
};

const avatarGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
  gap: 10,
};

const avatarOptionStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
  justifyItems: "center",
  padding: 10,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  cursor: "pointer",
};

const avatarImageStyle: React.CSSProperties = {
  width: 44,
  height: 56,
  imageRendering: "pixelated",
  objectFit: "contain",
};

const avatarLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--text-primary)",
};

const primaryButtonStyle: React.CSSProperties = {
  justifySelf: "start",
  border: "none",
  borderRadius: 999,
  padding: "12px 18px",
  background: "linear-gradient(135deg, #00d4ff, #27a6ff)",
  color: "#071321",
  fontFamily: "inherit",
  fontWeight: 700,
  cursor: "pointer",
};
