import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Scenario, ScenarioData } from '../types';
import { DEFAULT_SCENARIO } from '../constants/defaults';

interface ScenarioStore {
  scenarios: Scenario[];
  activeId: string | null;
  // Active scenario data (editing state)
  current: ScenarioData;
  // Actions
  setActiveId: (id: string) => void;
  updateCurrent: (data: ScenarioData) => void;
  saveScenario: (name: string) => void;
  loadScenario: (id: string) => void;
  duplicateScenario: (id: string, name: string) => void;
  deleteScenario: (id: string) => void;
  renameScenario: (id: string, name: string) => void;
  newScenario: () => void;
}

export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set, get) => ({
      scenarios: [],
      activeId: null,
      current: DEFAULT_SCENARIO,

      setActiveId: (id) => set({ activeId: id }),

      updateCurrent: (data) => {
        const { activeId, scenarios } = get();
        if (activeId) {
          const now = new Date().toISOString();
          set({
            current: data,
            scenarios: scenarios.map(s =>
              s.id === activeId ? { ...s, data, updatedAt: now } : s
            ),
          });
        } else {
          set({ current: data });
        }
      },

      saveScenario: (name) => {
        const { activeId, current, scenarios } = get();
        const now = new Date().toISOString();

        if (activeId) {
          // Update existing
          set({
            scenarios: scenarios.map(s =>
              s.id === activeId
                ? { ...s, name, data: current, updatedAt: now }
                : s
            ),
          });
        } else {
          // Create new
          const id = crypto.randomUUID();
          const newScenario: Scenario = {
            id,
            name,
            createdAt: now,
            updatedAt: now,
            data: current,
          };
          set({ scenarios: [...scenarios, newScenario], activeId: id });
        }
      },

      loadScenario: (id) => {
        const scenario = get().scenarios.find(s => s.id === id);
        if (scenario) {
          set({ activeId: id, current: scenario.data });
        }
      },

      duplicateScenario: (id, name) => {
        const scenario = get().scenarios.find(s => s.id === id);
        if (!scenario) return;
        const now = new Date().toISOString();
        const newId = crypto.randomUUID();
        const dup: Scenario = {
          id: newId,
          name,
          createdAt: now,
          updatedAt: now,
          data: JSON.parse(JSON.stringify(scenario.data)),
        };
        set({ scenarios: [...get().scenarios, dup], activeId: newId, current: dup.data });
      },

      deleteScenario: (id) => {
        const { scenarios, activeId } = get();
        const filtered = scenarios.filter(s => s.id !== id);
        const newActive = activeId === id ? (filtered[0]?.id ?? null) : activeId;
        set({
          scenarios: filtered,
          activeId: newActive,
          current: newActive
            ? (filtered.find(s => s.id === newActive)?.data ?? DEFAULT_SCENARIO)
            : DEFAULT_SCENARIO,
        });
      },

      renameScenario: (id, name) => {
        set({
          scenarios: get().scenarios.map(s =>
            s.id === id ? { ...s, name, updatedAt: new Date().toISOString() } : s
          ),
        });
      },

      newScenario: () => {
        set({ activeId: null, current: JSON.parse(JSON.stringify(DEFAULT_SCENARIO)) });
      },
    }),
    {
      name: 'deal-calculator-scenarios',
      partialize: (state) => ({
        scenarios: state.scenarios,
        activeId: state.activeId,
        current: state.current,
      }),
      // Migrate old stored data that's missing new fields
      merge: (persisted: unknown, current) => {
        const p = persisted as typeof current;
        const migrate = (data: typeof p.current) => ({
          ...data,
          renovations: (data.renovations ?? []).map(r => ({
            ...r,
            multiplier: r.multiplier ?? 1.0,
          })),
          property: {
            ...data.property,
            alternativeYieldPct: data.property.alternativeYieldPct ?? 7,
          },
          purchaseCosts: {
            ...data.purchaseCosts,
            brokerCommission: data.purchaseCosts.brokerCommission
              ?? ((data.purchaseCosts as unknown as { brokerCommissionPct?: number }).brokerCommissionPct !== undefined
                ? { value: (data.purchaseCosts as unknown as { brokerCommissionPct: number }).brokerCommissionPct, unit: 'pct' as const }
                : { value: 0, unit: 'pct' as const }),
            attorney: data.purchaseCosts.attorney
              ?? ((data.purchaseCosts as unknown as { attorneyPct?: number }).attorneyPct !== undefined
                ? { value: (data.purchaseCosts as unknown as { attorneyPct: number }).attorneyPct, unit: 'pct' as const }
                : { value: 0, unit: 'pct' as const }),
          },
        });
        return {
          ...current,
          ...p,
          current: migrate(p.current),
          scenarios: p.scenarios.map(s => ({ ...s, data: migrate(s.data) })),
        };
      },
    }
  )
);
