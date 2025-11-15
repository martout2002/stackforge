import { ValidationRule } from '@/types';

/**
 * Validation rules for scaffold configuration
 * Based on design document requirements and known technology conflicts
 */
export const VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'auth-database',
    message:
      'Authentication requires a database. Please select a database option.',
    severity: 'error',
    check: (config) => config.auth !== 'none' && config.database === 'none',
  },
  {
    id: 'vercel-express',
    message:
      'Express apps cannot deploy to Vercel. Consider Render, Railway, or EC2.',
    severity: 'error',
    check: (config) =>
      config.framework === 'express' && config.deployment.includes('vercel'),
  },
  {
    id: 'trpc-monorepo',
    message:
      'tRPC works best with monorepo or Next.js. Consider using REST for Express-only.',
    severity: 'warning',
    check: (config) => config.api === 'trpc' && config.framework === 'express',
  },
  {
    id: 'ai-framework-compatibility',
    message:
      'AI templates require Next.js or Monorepo framework. Please select Next.js or Monorepo to use AI features.',
    severity: 'error',
    check: (config) =>
      config.aiTemplate !== 'none' &&
      config.aiTemplate !== undefined &&
      config.framework === 'express',
  },
  {
    id: 'ai-api-key',
    message:
      "AI templates require an API key from your chosen AI provider. You'll need to add it to your environment after generation.",
    severity: 'warning',
    check: (config) =>
      config.aiTemplate !== 'none' && config.aiTemplate !== undefined,
  },
  {
    id: 'supabase-auth-db',
    message:
      'When using Supabase auth, Supabase database is recommended for seamless integration.',
    severity: 'warning',
    check: (config) =>
      config.auth === 'supabase' && config.database !== 'supabase',
  },
  {
    id: 'nextjs-router-required',
    message:
      'Next.js framework requires a router selection (App Router or Pages Router).',
    severity: 'error',
    check: (config) =>
      (config.framework === 'next' || config.framework === 'monorepo') &&
      !config.nextjsRouter,
  },
  {
    id: 'project-name-required',
    message: 'Project name is required and must be valid.',
    severity: 'error',
    check: (config) =>
      !config.projectName ||
      config.projectName.length === 0 ||
      !/^[a-z0-9-]+$/.test(config.projectName),
  },
  {
    id: 'description-required',
    message: 'Project description is required.',
    severity: 'error',
    check: (config) => !config.description || config.description.length === 0,
  },
  {
    id: 'deployment-target-required',
    message: 'At least one deployment target must be selected.',
    severity: 'error',
    check: (config) => config.deployment.length === 0,
  },
  {
    id: 'graphql-complexity',
    message:
      'GraphQL setup requires additional configuration. Ensure you understand the setup requirements.',
    severity: 'warning',
    check: (config) => config.api === 'graphql',
  },
  {
    id: 'mongodb-auth-compatibility',
    message:
      'MongoDB works best with Clerk or custom auth. NextAuth with MongoDB requires additional adapter configuration.',
    severity: 'warning',
    check: (config) =>
      config.database === 'mongodb' && config.auth === 'nextauth',
  },
  {
    id: 'docker-deployment-recommendation',
    message:
      'Docker is recommended when deploying to EC2 or Railway for consistent environments.',
    severity: 'warning',
    check: (config) =>
      (config.deployment.includes('ec2') ||
        config.deployment.includes('railway')) &&
      !config.extras.docker,
  },
];

/**
 * Get validation rules by severity
 */
export function getRulesBySeverity(
  severity: 'error' | 'warning'
): ValidationRule[] {
  return VALIDATION_RULES.filter((rule) => rule.severity === severity);
}

/**
 * Get validation rule by ID
 */
export function getRuleById(id: string): ValidationRule | undefined {
  return VALIDATION_RULES.find((rule) => rule.id === id);
}
