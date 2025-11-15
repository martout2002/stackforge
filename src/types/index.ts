import { z } from 'zod';

// ============================================================================
// Core Configuration Types
// ============================================================================

export interface ScaffoldConfig {
  // Project basics
  projectName: string;
  description: string;

  // Framework choices
  framework: 'next' | 'express' | 'monorepo';
  nextjsRouter?: 'app' | 'pages';

  // Authentication
  auth: 'none' | 'nextauth' | 'supabase' | 'clerk';

  // Database & ORM
  database:
    | 'none'
    | 'prisma-postgres'
    | 'drizzle-postgres'
    | 'supabase'
    | 'mongodb';

  // API Layer
  api: 'rest-fetch' | 'rest-axios' | 'trpc' | 'graphql';

  // Styling
  styling: 'tailwind' | 'css-modules' | 'styled-components';
  shadcn: boolean;

  // Color Scheme
  colorScheme: 'purple' | 'gold' | 'white' | 'futuristic';

  // Deployment
  deployment: ('vercel' | 'render' | 'ec2' | 'railway')[];

  // AI Templates
  aiTemplate?:
    | 'chatbot'
    | 'document-analyzer'
    | 'semantic-search'
    | 'code-assistant'
    | 'image-generator'
    | 'none';
  aiProvider?: 'anthropic' | 'openai' | 'aws-bedrock' | 'gemini';

  // Tooling extras
  extras: {
    docker: boolean;
    githubActions: boolean;
    redis: boolean;
    prettier: boolean;
    husky: boolean;
  };
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationRule {
  id: string;
  message: string;
  severity: 'error' | 'warning';
  check: (config: ScaffoldConfig) => boolean;
}

// ============================================================================
// Color Scheme Types
// ============================================================================

export interface ColorSchemeConfig {
  name: string;
  displayName: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  cssVariables: Record<string, string>;
  tailwindExtend?: Record<string, any>;
}

// ============================================================================
// Documentation Types
// ============================================================================

export interface DocumentationSection {
  title: string;
  order: number;
  content: string;
  applicableWhen: (config: ScaffoldConfig) => boolean;
  subsections?: DocumentationSection[];
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

export const scaffoldConfigSchema = z.object({
  // Project basics
  projectName: z
    .string()
    .min(1, 'Project name is required')
    .max(50, 'Project name must be 50 characters or less')
    .regex(
      /^[a-z0-9-]+$/,
      'Project name must be lowercase alphanumeric with hyphens only'
    ),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be 200 characters or less'),

  // Framework choices
  framework: z.enum(['next', 'express', 'monorepo'], {
    message: 'Invalid framework selection',
  }),
  nextjsRouter: z.enum(['app', 'pages']).optional(),

  // Authentication
  auth: z.enum(['none', 'nextauth', 'supabase', 'clerk'], {
    message: 'Invalid authentication option',
  }),

  // Database & ORM
  database: z.enum(
    ['none', 'prisma-postgres', 'drizzle-postgres', 'supabase', 'mongodb'],
    {
      message: 'Invalid database option',
    }
  ),

  // API Layer
  api: z.enum(['rest-fetch', 'rest-axios', 'trpc', 'graphql'], {
    message: 'Invalid API layer option',
  }),

  // Styling
  styling: z.enum(['tailwind', 'css-modules', 'styled-components'], {
    message: 'Invalid styling option',
  }),
  shadcn: z.boolean(),

  // Color Scheme
  colorScheme: z.enum(['purple', 'gold', 'white', 'futuristic'], {
    message: 'Invalid color scheme',
  }),

  // Deployment
  deployment: z
    .array(z.enum(['vercel', 'render', 'ec2', 'railway']))
    .min(1, 'At least one deployment target is required')
    .max(4, 'Maximum 4 deployment targets allowed'),

  // AI Templates
  aiTemplate: z
    .enum([
      'chatbot',
      'document-analyzer',
      'semantic-search',
      'code-assistant',
      'image-generator',
      'none',
    ])
    .optional(),
  aiProvider: z
    .enum(['anthropic', 'openai', 'aws-bedrock', 'gemini'])
    .optional(),

  // Tooling extras
  extras: z.object({
    docker: z.boolean(),
    githubActions: z.boolean(),
    redis: z.boolean(),
    prettier: z.boolean(),
    husky: z.boolean(),
  }),
});

// ============================================================================
// Type inference from Zod schema
// ============================================================================

export type ScaffoldConfigInput = z.infer<typeof scaffoldConfigSchema>;

// ============================================================================
// Validation Result Types
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  ruleId: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  ruleId: string;
}
