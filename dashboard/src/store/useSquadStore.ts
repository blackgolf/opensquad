import { create } from "zustand";
import type { SquadInfo, SquadState, UserProfile } from "@/types/state";

interface SquadStore {
  // State
  squads: Map<string, SquadInfo>;
  activeStates: Map<string, SquadState>;
  selectedSquad: string | null;
  isConnected: boolean;
  userProfile: UserProfile | null;
  nearbyAgentId: string | null;
  inspectedAgentId: string | null;

  // Actions
  selectSquad: (name: string | null) => void;
  setConnected: (connected: boolean) => void;
  setSnapshot: (squads: SquadInfo[], activeStates: Record<string, SquadState>) => void;
  setSquadActive: (squad: string, state: SquadState) => void;
  updateSquadState: (squad: string, state: SquadState) => void;
  setSquadInactive: (squad: string) => void;
  setUserProfile: (profile: UserProfile) => void;
  setNearbyAgent: (agentId: string | null) => void;
  inspectAgent: (agentId: string | null) => void;
}

export const useSquadStore = create<SquadStore>((set) => ({
  squads: new Map(),
  activeStates: new Map(),
  selectedSquad: null,
  isConnected: false,
  userProfile: null,
  nearbyAgentId: null,
  inspectedAgentId: null,

  selectSquad: (name) => set({ selectedSquad: name }),

  setConnected: (connected) => set({ isConnected: connected }),

  setSnapshot: (squads, activeStates) =>
    set((prev) => {
      const nextStates = new Map(Object.entries(activeStates));
      const selectedSquad =
        prev.selectedSquad && (nextStates.has(prev.selectedSquad) || squads.some((s) => s.code === prev.selectedSquad))
          ? prev.selectedSquad
          : nextStates.keys().next().value ?? squads[0]?.code ?? null;

      return {
        squads: new Map(squads.map((s) => [s.code, s])),
        activeStates: nextStates,
        selectedSquad,
      };
    }),

  setSquadActive: (squad, state) =>
    set((prev) => ({
      activeStates: new Map(prev.activeStates).set(squad, state),
    })),

  updateSquadState: (squad, state) =>
    set((prev) => ({
      activeStates: new Map(prev.activeStates).set(squad, state),
    })),

  setSquadInactive: (squad) =>
    set((prev) => {
      const next = new Map(prev.activeStates);
      next.delete(squad);
      return {
        activeStates: next,
        // Reset selection if the inactive squad was selected
        selectedSquad: prev.selectedSquad === squad ? null : prev.selectedSquad,
      };
    }),

  setUserProfile: (profile) => set({ userProfile: profile }),

  setNearbyAgent: (agentId) =>
    set((prev) => ({
      nearbyAgentId: agentId,
      inspectedAgentId: agentId ?? prev.inspectedAgentId,
    })),

  inspectAgent: (agentId) => set({ inspectedAgentId: agentId }),
}));
