import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ScaffoldConfig } from '@/types';

interface ConfigState {
  config: ScaffoldConfig;
  updateConfig: (updates: Partial<ScaffoldConfig>) => void;
  resetConfig: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

const defaultConfig: ScaffoldConfig = {
  projectName: '',
  description: '',
  // New four-category framework structure
  frontendFramework: 'nextjs',
  backendFramework: 'nextjs-api',
  buildTool: 'auto',
  projectStructure: 'nextjs-only',
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

/**
 * Auto-adjust backend framework options when frontend framework changes
 */
function autoAdjustBackendFramework(
  frontendFramework: ScaffoldConfig['frontendFramework'],
  currentBackendFramework: ScaffoldConfig['backendFramework']
): ScaffoldConfig['backendFramework'] {
  // If frontend is not Next.js and backend is set to nextjs-api, change to none
  if (frontendFramework !== 'nextjs' && currentBackendFramework === 'nextjs-api') {
    return 'none';
  }
  return currentBackendFramework;
}

/**
 * Auto-adjust project structure when framework selections change
 */
function autoAdjustProjectStructure(
  frontendFramework: ScaffoldConfig['frontendFramework'],
  backendFramework: ScaffoldConfig['backendFramework'],
  currentStructure: ScaffoldConfig['projectStructure']
): ScaffoldConfig['projectStructure'] {
  // If Next.js with Next.js API routes, suggest nextjs-only
  if (frontendFramework === 'nextjs' && backendFramework === 'nextjs-api') {
    return 'nextjs-only';
  }
  
  // If React/Vue/Angular/Svelte with no backend, suggest react-spa
  if (frontendFramework !== 'nextjs' && backendFramework === 'none') {
    return 'react-spa';
  }
  
  // If Next.js with Express/Fastify/NestJS, suggest fullstack-monorepo
  if (frontendFramework === 'nextjs' && backendFramework !== 'none' && backendFramework !== 'nextjs-api') {
    return 'fullstack-monorepo';
  }
  
  // If no frontend but has backend, suggest express-api-only
  if (backendFramework !== 'none' && backendFramework !== 'nextjs-api') {
    // Check if current structure makes sense, otherwise suggest express-api-only
    if (currentStructure === 'nextjs-only' || currentStructure === 'react-spa') {
      return 'express-api-only';
    }
  }
  
  return currentStructure;
}

/**
 * Auto-adjust build tool based on frontend framework
 */
function autoAdjustBuildTool(
  _frontendFramework: ScaffoldConfig['frontendFramework'],
  currentBuildTool: ScaffoldConfig['buildTool']
): ScaffoldConfig['buildTool'] {
  // If build tool is set to auto, keep it auto
  if (currentBuildTool === 'auto') {
    return 'auto';
  }
  
  // Otherwise, keep the user's explicit choice
  return currentBuildTool;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      config: defaultConfig,
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state
        });
      },
      updateConfig: (updates) =>
        set((state) => {
          // Only update if values actually changed
          const hasChanges = Object.keys(updates).some(
            key => state.config[key as keyof ScaffoldConfig] !== updates[key as keyof ScaffoldConfig]
          );
          
          if (!hasChanges) return state;
          
          // Apply updates
          let newConfig = { ...state.config, ...updates };
          
          // Auto-adjust backend framework if frontend framework changed
          if (updates.frontendFramework !== undefined) {
            newConfig.backendFramework = autoAdjustBackendFramework(
              newConfig.frontendFramework,
              newConfig.backendFramework
            );
          }
          
          // Auto-adjust project structure if frontend or backend changed
          if (updates.frontendFramework !== undefined || updates.backendFramework !== undefined) {
            newConfig.projectStructure = autoAdjustProjectStructure(
              newConfig.frontendFramework,
              newConfig.backendFramework,
              newConfig.projectStructure
            );
          }
          
          // Auto-adjust build tool if frontend framework changed
          if (updates.frontendFramework !== undefined) {
            newConfig.buildTool = autoAdjustBuildTool(
              newConfig.frontendFramework,
              newConfig.buildTool
            );
          }
          
          return {
            config: newConfig,
          };
        }),
      resetConfig: () => set({ config: defaultConfig }),
    }),
    {
      name: 'stackforge-config',
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
