'use client';

import { FileText, Package, Clock, Folder, File, Key } from 'lucide-react';
import type { ScaffoldConfig } from '@/types';
import { getAITemplateById, getAIProviderById } from '@/lib/constants/ai-templates';

interface PreviewPanelProps {
  config: ScaffoldConfig;
  className?: string;
}

export function PreviewPanel({ config, className = '' }: PreviewPanelProps) {
  const estimatedBundleSize = calculateBundleSize(config);
  const estimatedGenerationTime = calculateGenerationTime(config);
  const fileList = generateFileList(config);
  const techSummary = generateTechSummary(config);
  const envVars = generateEnvVars(config);

  return (
    <div className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow fade-in ${className}`}>
      <div className="border-b p-4 md:p-5 bg-gradient-to-r from-purple-50 to-white">
        <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
          <FileText size={18} className="md:w-5 md:h-5 text-purple-600" />
          Preview
        </h3>
        <p className="text-xs md:text-sm text-gray-600 mt-1">
          Summary of your project configuration
        </p>
      </div>

      <div className="p-4 md:p-5 space-y-4 md:space-y-6">
        {/* Estimates */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <EstimateCard
            icon={<Package size={18} className="md:w-5 md:h-5" />}
            label="Bundle Size"
            value={estimatedBundleSize}
            color="blue"
          />
          <EstimateCard
            icon={<Clock size={18} className="md:w-5 md:h-5" />}
            label="Generation Time"
            value={estimatedGenerationTime}
            color="green"
          />
        </div>

        {/* Technology Summary */}
        <div>
          <h4 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 flex items-center gap-2">
            <Package size={14} className="md:w-4 md:h-4" />
            Selected Technologies
          </h4>
          <div className="space-y-1.5 md:space-y-2">
            {techSummary.map((tech) => (
              <TechSummaryItem key={tech.category} {...tech} />
            ))}
          </div>
        </div>

        {/* Environment Variables */}
        {envVars.length > 0 && (
          <div>
            <h4 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 flex items-center gap-2">
              <Key size={14} className="md:w-4 md:h-4" />
              Environment Variables
            </h4>
            <div className="bg-gray-50 rounded-lg p-2 md:p-3 space-y-2">
              {envVars.map((envVar) => (
                <EnvVarItem key={envVar.envKey} {...envVar} />
              ))}
            </div>
          </div>
        )}

        {/* File Structure Preview */}
        <div>
          <h4 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 flex items-center gap-2">
            <Folder size={14} className="md:w-4 md:h-4" />
            Files to be Generated
          </h4>
          <div className="bg-gray-50 rounded-lg p-2 md:p-3 max-h-48 md:max-h-64 overflow-y-auto">
            <FileTree files={fileList} />
          </div>
          <p className="text-xs text-gray-500 mt-1.5 md:mt-2">
            {fileList.length} files will be generated
          </p>
        </div>
      </div>
    </div>
  );
}

interface EstimateCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple';
}

function EstimateCard({ icon, label, value, color }: EstimateCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className={`border rounded-lg p-2.5 md:p-3 ${colorClasses[color]}`}>
      <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">{icon}</div>
      <div className="text-[10px] md:text-xs opacity-80 mb-0.5 md:mb-1">{label}</div>
      <div className="text-base md:text-lg font-bold">{value}</div>
    </div>
  );
}

interface TechSummaryItemProps {
  category: string;
  value: string;
}

function TechSummaryItem({ category, value }: TechSummaryItemProps) {
  return (
    <div className="flex items-center justify-between py-1.5 md:py-2 border-b last:border-b-0">
      <span className="text-xs md:text-sm text-gray-600">{category}</span>
      <span className="text-xs md:text-sm font-medium truncate ml-2">{value}</span>
    </div>
  );
}

interface EnvVarItemProps {
  envKey: string;
  description: string;
  setupUrl?: string;
}

function EnvVarItem({ envKey, description, setupUrl }: EnvVarItemProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <code className="text-xs md:text-sm font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
          {envKey}
        </code>
      </div>
      <p className="text-[10px] md:text-xs text-gray-600">{description}</p>
      {setupUrl && (
        <a
          href={setupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] md:text-xs text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
        >
          Get API key →
        </a>
      )}
    </div>
  );
}

interface FileTreeProps {
  files: string[];
}

function FileTree({ files }: FileTreeProps) {
  // Group files by directory
  const tree = buildFileTree(files);

  return (
    <div className="font-mono text-xs space-y-1">
      {tree.map((item, index) => (
        <FileTreeItem key={index} item={item} depth={0} />
      ))}
    </div>
  );
}

interface TreeItem {
  name: string;
  type: 'file' | 'directory';
  children?: TreeItem[];
}

interface FileTreeItemProps {
  item: TreeItem;
  depth: number;
}

function FileTreeItem({ item, depth }: FileTreeItemProps) {
  const indent = depth * 12;

  return (
    <>
      <div
        className="flex items-center gap-1.5 md:gap-2 py-0.5 hover:bg-gray-100 rounded px-1"
        style={{ paddingLeft: `${indent + 4}px` }}
      >
        {item.type === 'directory' ? (
          <Folder size={12} className="md:w-3.5 md:h-3.5 text-blue-500 shrink-0" />
        ) : (
          <File size={12} className="md:w-3.5 md:h-3.5 text-gray-400 shrink-0" />
        )}
        <span className="text-gray-700 text-[11px] md:text-xs truncate">{item.name}</span>
      </div>
      {item.children?.map((child, index) => (
        <FileTreeItem key={index} item={child} depth={depth + 1} />
      ))}
    </>
  );
}

// Helper functions

function calculateBundleSize(config: ScaffoldConfig): string {
  let size = 2.5; // Base Next.js size in MB

  if (config.shadcn) size += 0.3;
  if (config.auth !== 'none') size += 0.5;
  if (config.database !== 'none') size += 0.4;
  if (config.api === 'trpc') size += 0.3;
  if (config.api === 'graphql') size += 0.6;
  if (config.aiTemplate && config.aiTemplate !== 'none') size += 0.8;
  if (config.extras.redis) size += 0.2;

  return `~${size.toFixed(1)} MB`;
}

function calculateGenerationTime(config: ScaffoldConfig): string {
  let time = 5; // Base time in seconds

  if (config.projectStructure === 'fullstack-monorepo') time += 8; // Monorepo
  if (config.auth !== 'none') time += 3;
  if (config.database !== 'none') time += 4;
  if (config.aiTemplate && config.aiTemplate !== 'none') time += 5;
  if (config.deployment.length > 1) time += config.deployment.length * 2;
  if (config.extras.docker) time += 3;
  if (config.extras.githubActions) time += 2;

  return `~${time}s`;
}

function generateTechSummary(config: ScaffoldConfig): TechSummaryItemProps[] {
  const summary: TechSummaryItemProps[] = [
    { 
      category: 'Frontend Framework', 
      value: config.frontendFramework === 'nextjs' ? 'Next.js' : config.frontendFramework 
    },
    { 
      category: 'Backend Framework', 
      value: config.backendFramework === 'nextjs-api' ? 'Next.js API' : config.backendFramework 
    },
    { 
      category: 'Build Tool', 
      value: config.buildTool 
    },
    { 
      category: 'Project Structure', 
      value: config.projectStructure.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    },
    { category: 'Authentication', value: config.auth },
    { category: 'Database', value: config.database },
    { category: 'API Layer', value: config.api },
    { category: 'Styling', value: config.styling },
    { category: 'Color Scheme', value: config.colorScheme },
  ];

  if (config.nextjsRouter && config.frontendFramework === 'nextjs') {
    summary.splice(1, 0, {
      category: 'Next.js Router',
      value: config.nextjsRouter,
    });
  }

  if (config.aiTemplate && config.aiTemplate !== 'none') {
    summary.push({ category: 'AI Template', value: config.aiTemplate });
  }

  if (config.deployment.length > 0) {
    summary.push({
      category: 'Deployment',
      value: config.deployment.join(', '),
    });
  }

  return summary;
}

function generateFileList(config: ScaffoldConfig): string[] {
  const files: string[] = [
    'package.json',
    'tsconfig.json',
    '.gitignore',
    'README.md',
    '.env.example',
  ];

  // Project structure-specific files
  if (config.projectStructure === 'nextjs-only') {
    files.push(
      'next.config.ts',
      'app/layout.tsx',
      'app/page.tsx',
      'app/globals.css',
      'app/api/hello/route.ts',
      'app/api/users/route.ts',
      'app/dashboard/page.tsx'
    );
  } else if (config.projectStructure === 'react-spa') {
    files.push(
      'src/App.tsx',
      'src/main.tsx',
      'src/components/index.ts',
      'index.html',
      'src/app/dashboard/page.tsx'
    );
    if (config.buildTool === 'vite' || config.buildTool === 'auto') {
      files.push('vite.config.ts');
    } else if (config.buildTool === 'webpack') {
      files.push('webpack.config.js');
    }
  } else if (config.projectStructure === 'fullstack-monorepo') {
    files.push(
      'turbo.json',
      'apps/web/package.json',
      'apps/web/next.config.ts',
      'apps/web/src/app/layout.tsx',
      'apps/web/src/app/page.tsx',
      'apps/web/src/app/dashboard/page.tsx',
      'apps/api/package.json',
      'apps/api/src/server.ts',
      'apps/api/src/routes/index.ts',
      'packages/shared-types/package.json'
    );
  } else if (config.projectStructure === 'express-api-only') {
    files.push(
      'src/server.ts',
      'src/routes/index.ts',
      'src/controllers/index.ts',
      'src/middleware/index.ts'
    );
  }

  // Add auth pages if auth is enabled
  if (config.auth !== 'none' && config.projectStructure !== 'express-api-only') {
    const basePath = config.projectStructure === 'fullstack-monorepo' ? 'apps/web/src' : 'src';
    files.push(
      `${basePath}/app/signin/page.tsx`,
      `${basePath}/app/signup/page.tsx`,
      `${basePath}/app/forgot-password/page.tsx`
    );
  }

  // Frontend framework-specific files (for non-Next.js)
  if (config.frontendFramework === 'vue' && config.projectStructure === 'react-spa') {
    files.push('src/App.vue', 'src/main.ts');
  } else if (config.frontendFramework === 'angular' && config.projectStructure === 'react-spa') {
    files.push('src/app/app.component.ts', 'src/main.ts', 'angular.json');
  } else if (config.frontendFramework === 'svelte' && config.projectStructure === 'react-spa') {
    files.push('src/App.svelte', 'src/main.ts');
  }

  // Styling files
  if (config.styling === 'tailwind') {
    files.push('tailwind.config.ts', 'postcss.config.mjs');
  }

  if (config.shadcn) {
    files.push('components.json', 'components/ui/button.tsx');
  }

  // Auth files
  if (config.auth === 'nextauth') {
    files.push('app/api/auth/[...nextauth]/route.ts', 'lib/auth.ts');
  }

  if (config.auth === 'clerk') {
    files.push('middleware.ts', 'app/sign-in/page.tsx');
  }

  // Database files
  if (config.database === 'prisma-postgres') {
    files.push('prisma/schema.prisma', 'lib/prisma.ts');
  }

  if (config.database === 'drizzle-postgres') {
    files.push('drizzle.config.ts', 'db/schema.ts');
  }

  if (config.database === 'supabase') {
    files.push('lib/supabase.ts', 'supabase/migrations/001_initial.sql');
  }

  // AI template files
  if (config.aiTemplate && config.aiTemplate !== 'none') {
    const aiTemplate = getAITemplateById(config.aiTemplate);
    if (aiTemplate) {
      // Add API routes (remove 'src/' prefix to match other file paths)
      aiTemplate.generatedFiles.apiRoutes.forEach((route) => {
        const normalizedPath = route.startsWith('src/') ? route.substring(4) : route;
        files.push(normalizedPath);
      });
      
      // Add pages (remove 'src/' prefix to match other file paths)
      aiTemplate.generatedFiles.pages.forEach((page) => {
        const normalizedPath = page.startsWith('src/') ? page.substring(4) : page;
        files.push(normalizedPath);
      });
      
      // Add components if any (remove 'src/' prefix to match other file paths)
      if (aiTemplate.generatedFiles.components) {
        aiTemplate.generatedFiles.components.forEach((component) => {
          const normalizedPath = component.startsWith('src/') ? component.substring(4) : component;
          files.push(normalizedPath);
        });
      }
    }
  }

  // Deployment files
  if (config.deployment.includes('vercel')) {
    files.push('vercel.json');
  }

  if (config.deployment.includes('railway')) {
    files.push('railway.json');
  }

  if (config.extras.docker) {
    files.push('Dockerfile', 'docker-compose.yml', '.dockerignore');
  }

  if (config.extras.githubActions) {
    files.push('.github/workflows/ci.yml');
  }

  if (config.extras.prettier) {
    files.push('.prettierrc', '.prettierignore');
  }

  if (config.extras.husky) {
    files.push('.husky/pre-commit');
  }

  files.push('SETUP.md');

  return files.sort();
}

function generateEnvVars(config: ScaffoldConfig): EnvVarItemProps[] {
  const envVars: EnvVarItemProps[] = [];

  // Add AI provider API key if AI template is selected
  if (config.aiTemplate && config.aiTemplate !== 'none' && config.aiProvider) {
    const provider = getAIProviderById(config.aiProvider);
    if (provider) {
      envVars.push({
        envKey: provider.apiKeyName,
        description: `API key for ${provider.displayName}. Required for AI features.`,
        setupUrl: provider.setupUrl,
      });
    }
  }

  // Add database connection strings
  if (config.database === 'prisma-postgres' || config.database === 'drizzle-postgres') {
    envVars.push({
      envKey: 'DATABASE_URL',
      description: 'PostgreSQL connection string',
    });
  }

  if (config.database === 'supabase') {
    envVars.push({
      envKey: 'NEXT_PUBLIC_SUPABASE_URL',
      description: 'Supabase project URL',
      setupUrl: 'https://supabase.com',
    });
    envVars.push({
      envKey: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      description: 'Supabase anonymous key',
    });
  }

  // Add auth-related env vars
  if (config.auth === 'nextauth') {
    envVars.push({
      envKey: 'NEXTAUTH_SECRET',
      description: 'Secret for NextAuth.js session encryption',
    });
    envVars.push({
      envKey: 'NEXTAUTH_URL',
      description: 'Canonical URL of your site',
    });
  }

  if (config.auth === 'clerk') {
    envVars.push({
      envKey: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      description: 'Clerk publishable key',
      setupUrl: 'https://clerk.com',
    });
    envVars.push({
      envKey: 'CLERK_SECRET_KEY',
      description: 'Clerk secret key',
    });
  }

  // Add Redis if selected
  if (config.extras.redis) {
    envVars.push({
      envKey: 'REDIS_URL',
      description: 'Redis connection string',
    });
  }

  return envVars;
}

function buildFileTree(files: string[]): TreeItem[] {
  const root: TreeItem[] = [];
  const dirMap = new Map<string, TreeItem>();

  files.forEach((file) => {
    const parts = file.split('/');
    let currentLevel = root;
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = index === parts.length - 1;

      if (isFile) {
        currentLevel.push({ name: part, type: 'file' });
      } else {
        let dir = dirMap.get(currentPath);
        if (!dir) {
          dir = { name: part, type: 'directory', children: [] };
          dirMap.set(currentPath, dir);
          currentLevel.push(dir);
        }
        currentLevel = dir.children!;
      }
    });
  });

  return root;
}
