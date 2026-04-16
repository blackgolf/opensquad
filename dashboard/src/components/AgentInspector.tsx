import { useMemo } from "react";
import { useSquadStore } from "@/store/useSquadStore";

export function AgentInspector() {
  const selectedSquad = useSquadStore((s) => s.selectedSquad);
  const squadState = useSquadStore((s) =>
    s.selectedSquad ? s.activeStates.get(s.selectedSquad) ?? null : null
  );
  const inspectedAgentId = useSquadStore((s) => s.inspectedAgentId);
  const nearbyAgentId = useSquadStore((s) => s.nearbyAgentId);
  const inspectAgent = useSquadStore((s) => s.inspectAgent);

  const agent = useMemo(
    () => squadState?.agents.find((item) => item.id === inspectedAgentId) ?? null,
    [inspectedAgentId, squadState]
  );

  if (!selectedSquad || !squadState) {
    return (
      <aside style={panelStyle}>
        <div style={eyebrowStyle}>Office Guide</div>
        <h3 style={titleStyle}>Escolha um squad ativo</h3>
        <p style={bodyStyle}>Quando um squad estiver selecionado, o escritorio ganha vida e voce pode visitar cada agente.</p>
      </aside>
    );
  }

  if (!agent) {
    return (
      <aside style={panelStyle}>
        <div style={eyebrowStyle}>Office Guide</div>
        <h3 style={titleStyle}>Chegue perto de um agente</h3>
        <p style={bodyStyle}>
          Ande pelo escritorio com <strong>WASD</strong> ou setas. Quando um agente estiver perto, pressione <strong>E</strong> para abrir a conversa.
        </p>
      </aside>
    );
  }

  return (
    <aside style={panelStyle}>
      <div style={eyebrowStyle}>Canal Direto</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h3 style={titleStyle}>{agent.name}</h3>
          <div style={statusPillStyle}>
            <span
              style={{
                ...statusDotStyle,
                background:
                  nearbyAgentId === agent.id ? "var(--accent-cyan)" : statusColor(agent.status),
              }}
            />
            {agent.status}
          </div>
        </div>
        <button style={ghostButtonStyle} onClick={() => inspectAgent(null)}>
          Fechar
        </button>
      </div>

      <div style={sectionStyle}>
        <div style={sectionLabelStyle}>Squad</div>
        <div style={bodyStyle}>{selectedSquad}</div>
      </div>

      <div style={sectionStyle}>
        <div style={sectionLabelStyle}>Passo Atual</div>
        <div style={bodyStyle}>
          {squadState.step.current}/{squadState.step.total} {squadState.step.label}
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={sectionLabelStyle}>Perguntas sugeridas</div>
        <div style={suggestionListStyle}>
          <div style={suggestionStyle}>O que voce esta fazendo agora?</div>
          <div style={suggestionStyle}>Existe algum bloqueio no seu fluxo?</div>
          <div style={suggestionStyle}>Quem recebe sua proxima entrega?</div>
        </div>
      </div>

      {squadState.handoff && (
        <div style={sectionStyle}>
          <div style={sectionLabelStyle}>Ultimo handoff</div>
          <div style={bodyStyle}>
            {squadState.handoff.from} para {squadState.handoff.to}
          </div>
          <div style={{ ...bodyStyle, color: "var(--text-secondary)" }}>{squadState.handoff.message}</div>
        </div>
      )}
    </aside>
  );
}

function statusColor(status: string) {
  switch (status) {
    case "working":
      return "var(--accent-cyan)";
    case "done":
      return "var(--accent-green)";
    case "checkpoint":
      return "var(--accent-amber)";
    default:
      return "rgba(255,255,255,0.35)";
  }
}

const panelStyle: React.CSSProperties = {
  width: 320,
  minWidth: 320,
  height: "100%",
  padding: 18,
  borderLeft: "1px solid var(--border)",
  background:
    "linear-gradient(180deg, rgba(17, 23, 34, 0.96), rgba(11, 15, 24, 0.96))",
  display: "grid",
  alignContent: "start",
  gap: 16,
};

const eyebrowStyle: React.CSSProperties = {
  color: "var(--accent-cyan)",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 1.2,
};

const titleStyle: React.CSSProperties = {
  fontSize: 22,
};

const bodyStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.6,
};

const sectionStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "var(--text-secondary)",
};

const statusPillStyle: React.CSSProperties = {
  marginTop: 8,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 999,
  padding: "6px 10px",
  background: "rgba(255,255,255,0.05)",
  color: "var(--text-primary)",
  fontSize: 12,
};

const statusDotStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
};

const suggestionListStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const suggestionStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: "10px 12px",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text-secondary)",
  fontSize: 12,
  lineHeight: 1.5,
};

const ghostButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 999,
  padding: "8px 12px",
  background: "transparent",
  color: "var(--text-secondary)",
  fontFamily: "inherit",
  cursor: "pointer",
};
