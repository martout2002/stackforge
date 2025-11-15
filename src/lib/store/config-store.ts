import { create } from 'zustand';
import { ScaffoldConfig } from '@/types';

interface ConfigState {
  config: ScaffoldConfig;
  updateConfig: (updates: Partial<ScaffoldConfig>) => void;
  resetConfig: () => void;
}

const defaultConfig: ScaffoldConfig = {
  projectName: '',
  description: '',
  framework: 'next',
  nextjsRouter: 'app',
  auth: 'none',
  database: 'none',
  api: 'rest-fetch',
  styling: 'tailwind',
  shadcn: true,
  colorScheme: 'purple',
  deployment: ['vercel'],
  aiTemplate: 'none',
  aiProvider: 'anthropic',
  extras: {
    docker: false,
    githubActions: false,
    redis: false,
    prettier: true,
    husky: false,
  },
};

export const useConfigStore = create<ConfigState>((set) => ({
  config: defaultConfig,
  updateConfig: (updates) =>
    set((state) => {
      // Only update if values actually changed
      const hasChanges = Object.keys(updates).some(
        key => state.config[key as keyof ScaffoldConfig] !== updates[key as keyof ScaffoldConfig]
      );
      
      if (!hasChanges) return state;
      
      return {
        config: { ...state.config, ...updates },
      };
    }),
  resetConfig: () => set({ config: defaultConfig }),
}));
