import { ScaffoldConfigWithFramework } from '@/types';
import { TemplateEngine } from './template-engine';
import { DocumentationGenerator } from './documentation-generator';
import { getDirectoryStructure } from './file-structure';
import {
  generatePackageJson,
  generateWebAppPackageJson,
  generateApiAppPackageJson,
} from './templates/package-json';
import {
  generateNextJsLayout,
  generateNextJsHomePage,
  generateNextConfig,
  generateTurboConfig,
  generateSharedTypesPackageJson,
  generateSharedTypesIndex,
  generateConfigPackageJson,
  generateHelloApiRoute,
  generateUsersApiRoute,
} from './templates/nextjs-templates';
import {
  generateTemplateDashboardPage,
  generateTemplateSignInPage,
  generateTemplateSignUpPage,
  generateTemplateForgotPasswordPage,
} from './templates/template-pages';
import {
  generateExpressIndex,
  generateExpressRoutes,
  generateExpressMiddleware,
  generateMonorepoExpressIndex,
} from './templates/express-templates';
import {
  generateGlobalsCss,
  generateTailwindConfig,
  generatePostCssConfig,
  generateComponentsJson,
  generateStyledComponentsTheme,
  generateStyledComponentsGlobalStyles,
  generateCssModulesExample,
  generateTailwindUtils,
  generateShadcnButton,
  generateShadcnCard,
  generateShadcnInput,
  generateShadcnUsageExample,
  generateCssModulesButton,
  generateCssModulesButtonComponent,
  generateCssModulesCard,
  generateCssModulesCardComponent,
  generateCssModulesUsageExample,
  generateCssModulesUsageExampleStyles,
  generateStyledComponentsProvider,
  generateStyledComponentsButton,
  generateStyledComponentsCard,
  generateStyledComponentsUsageExample,
  generateStyledComponentsRegistry,
} from './templates/styling-templates';
import {
  generateEslintConfig,
  generateExpressTsConfig,
  generateVercelConfig,
  generateDockerfile,
  generateDockerCompose,
  generateRailwayConfig,
  generateGithubActionsWorkflow,
  generateDockerignore,
  generateEnhancedGitignore,
  generateEC2DeployScript,
  generateSystemdService,
  generateNginxConfig,
  generateEC2SetupScript,
  generateHuskyPreCommit,
  generateHuskyCommitMsg,
  generateCommitlintConfig,
} from './templates/config-templates';
import {
  generateChatbotApiRoute,
  generateChatbotPage,
  generateDocumentAnalyzerApiRoute,
  generateDocumentAnalyzerPage,
  generateSemanticSearchApiRoute,
  generateSemanticSearchPage,
  generateCodeAssistantApiRoute,
  generateCodeAssistantPage,
  generateImageGeneratorApiRoute,
  generateImageGeneratorPage,
} from './templates/ai-templates';
import {
  generateNextAuthConfig,
  generateNextAuthRoute,
  generateNextAuthMiddleware,
  generateNextAuthSessionProvider,
  generateNextAuthSignInPage,
  generateNextAuthErrorPage,
  generateSupabaseClient,
  generateSupabaseServerClient,
  generateSupabaseAuthHelpers,
  generateSupabaseDatabaseExamples,
  generateSupabaseMigration,
  generateClerkMiddleware,
  generateClerkUserButton,
  generateClerkSignInPage,
  generateClerkSignUpPage,
  generatePrismaSchema,
  generatePrismaClient,
  generatePrismaExamples,
  generatePrismaMigrationScript,
  generateDrizzleSchema,
  generateDrizzleClient,
  generateDrizzleExamples,
  generateDrizzleConfig,
  generateDrizzleMigrationScript,
  generateRedisClient,
  generateRedisCacheHelpers,
  generateRedisExamples,
} from './templates/auth-database-templates';
import {
  generateFetchApiClient,
  generateAxiosApiClient,
  generateRestApiRouteExamples,
  generateRestApiSingleResourceRoute,
  generateTrpcRouter,
  generateTrpcApiRoute,
  generateTrpcClient,
  generateTrpcProvider,
  generateTrpcUsageExample,
  generateGraphQLSchema,
  generateGraphQLApiRoute,
  generateApolloClient,
  generateApolloProvider,
  generateGraphQLQueries,
  generateGraphQLUsageExample,
} from './templates/api-templates';

/**
 * Generated file representation
 */
export interface GeneratedFile {
  path: string;
  content: string;
}

/**
 * Generation result
 */
export interface GenerationResult {
  files: GeneratedFile[];
  directories: string[];
  metadata: {
    projectName: string;
    framework: string;
    totalFiles: number;
    totalDirectories: number;
  };
}

/**
 * Template cache for common templates
 * Caches generated content to avoid redundant generation
 */
class TemplateCache {
  private cache = new Map<string, string>();
  private static instance: TemplateCache;

  static getInstance(): TemplateCache {
    if (!TemplateCache.instance) {
      TemplateCache.instance = new TemplateCache();
    }
    return TemplateCache.instance;
  }

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: string): void {
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Main scaffold generator class
 */
export class ScaffoldGenerator {
  private templateEngine: TemplateEngine;
  private documentationGenerator: DocumentationGenerator;
  private config: ScaffoldConfigWithFramework;
  private templateCache: TemplateCache;

  constructor(config: ScaffoldConfigWithFramework) {
    this.config = config;
    this.templateEngine = new TemplateEngine();
    this.documentationGenerator = new DocumentationGenerator(config);
    this.templateCache = TemplateCache.getInstance();
  }

  /**
   * Generate complete scaffold structure
   * @param isGitHubRepo - Whether this scaffold is being pushed to GitHub
   * @param repoUrl - The GitHub repository URL (if applicable)
   */
  async generate(isGitHubRepo: boolean = false, repoUrl?: string): Promise<GenerationResult> {
    const directories = this.generateDirectories();
    const files = await this.generateFiles(isGitHubRepo, repoUrl);

    return {
      files,
      directories,
      metadata: {
        projectName: this.config.projectName,
        framework: this.config.framework,
        totalFiles: files.length,
        totalDirectories: directories.length,
      },
    };
  }

  /**
   * Generate directory structure
   */
  private generateDirectories(): string[] {
    const structure = getDirectoryStructure(this.config);
    return structure
      .filter((dir) => !dir.condition || dir.condition(this.config))
      .map((dir) => dir.path);
  }

  /**
   * Generate all files with parallel processing for better performance
   * @param isGitHubRepo - Whether this scaffold is being pushed to GitHub
   * @param repoUrl - The GitHub repository URL (if applicable)
   */
  private async generateFiles(isGitHubRepo: boolean = false, repoUrl?: string): Promise<GeneratedFile[]> {
    const context = this.templateEngine.createContext(this.config);

    // Generate all file groups in parallel for optimal performance
    const fileGenerationPromises: Promise<GeneratedFile[]>[] = [
      Promise.resolve(this.generateBaseFiles(context, isGitHubRepo, repoUrl)),
      Promise.resolve(this.generateConfigFiles(context)),
      Promise.resolve(this.generateProjectFiles(context)),
      Promise.resolve(this.generateTemplatePages()), // Always generate template pages
    ];

    // Conditionally add optional file generation
    if (this.config.aiTemplate && this.config.aiTemplate !== 'none') {
      fileGenerationPromises.push(Promise.resolve(this.generateAITemplateFiles()));
    }

    if (this.config.auth !== 'none') {
      fileGenerationPromises.push(Promise.resolve(this.generateAuthFiles()));
    }

    if (this.config.database !== 'none') {
      fileGenerationPromises.push(Promise.resolve(this.generateDatabaseFiles()));
    }

    if (this.config.api) {
      fileGenerationPromises.push(Promise.resolve(this.generateApiLayerFiles()));
    }

    // Wait for all file generation to complete in parallel
    const fileGroups = await Promise.all(fileGenerationPromises);

    // Flatten all file groups into single array
    return fileGroups.flat();
  }

  /**
   * Generate base project files
   * @param context - Template context
   * @param isGitHubRepo - Whether this scaffold is being pushed to GitHub
   * @param repoUrl - The GitHub repository URL (if applicable)
   */
  private generateBaseFiles(context: any, isGitHubRepo: boolean = false, repoUrl?: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // README.md
    files.push({
      path: 'README.md',
      content: this.generateReadme(context, isGitHubRepo, repoUrl),
    });

    // .gitignore
    files.push({
      path: '.gitignore',
      content: this.generateGitignore(),
    });

    // .env.example
    files.push({
      path: '.env.example',
      content: this.generateEnvExample(context),
    });

    // SETUP.md (if AI or auth/database features are used)
    if (context.hasAI || context.hasAuth || context.hasDatabase) {
      files.push({
        path: 'SETUP.md',
        content: this.documentationGenerator.generateSETUP(),
      });
    }

    // DEPLOYMENT.md (if deployment targets are configured)
    if (this.config.deployment.length > 0) {
      files.push({
        path: 'DEPLOYMENT.md',
        content: this.documentationGenerator.generateDEPLOYMENT(),
      });
    }

    // MONOREPO.md (if monorepo framework is selected)
    const monorepoDocs = this.documentationGenerator.generateMonorepoDocs();
    if (monorepoDocs) {
      files.push({
        path: 'MONOREPO.md',
        content: monorepoDocs,
      });
    }

    return files;
  }



  /**
   * Generate configuration files
   */
  private generateConfigFiles(_context: any): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // TypeScript config
    if (this.config.framework === 'express') {
      files.push({
        path: 'tsconfig.json',
        content: generateExpressTsConfig(),
      });
    } else {
      files.push({
        path: 'tsconfig.json',
        content: this.generateTsConfig(_context),
      });
    }

    // ESLint config
    files.push({
      path: 'eslint.config.mjs',
      content: generateEslintConfig(this.config),
    });

    // Prettier config
    if (this.config.extras.prettier) {
      files.push({
        path: '.prettierrc',
        content: this.generatePrettierConfig(),
      });
      files.push({
        path: '.prettierignore',
        content: this.generatePrettierIgnore(),
      });
    }

    // Husky pre-commit hooks
    if (this.config.extras.husky) {
      files.push({
        path: '.husky/pre-commit',
        content: generateHuskyPreCommit(),
      });
      files.push({
        path: '.husky/commit-msg',
        content: generateHuskyCommitMsg(),
      });
      files.push({
        path: 'commitlint.config.js',
        content: generateCommitlintConfig(),
      });
    }

    // Deployment configs
    if (this.config.deployment.includes('vercel')) {
      files.push({
        path: 'vercel.json',
        content: generateVercelConfig(this.config),
      });
    }

    if (this.config.deployment.includes('railway')) {
      files.push({
        path: 'railway.json',
        content: generateRailwayConfig(this.config),
      });
    }

    // Docker configs
    if (this.config.extras.docker) {
      files.push({
        path: 'Dockerfile',
        content: generateDockerfile(this.config),
      });

      files.push({
        path: 'docker-compose.yml',
        content: generateDockerCompose(this.config),
      });

      files.push({
        path: '.dockerignore',
        content: generateDockerignore(),
      });
    }

    // GitHub Actions
    if (this.config.extras.githubActions) {
      files.push({
        path: '.github/workflows/ci.yml',
        content: generateGithubActionsWorkflow(this.config),
      });
    }

    // EC2 deployment scripts
    if (this.config.deployment.includes('ec2')) {
      files.push({
        path: 'deploy/setup.sh',
        content: generateEC2SetupScript(this.config),
      });

      files.push({
        path: 'deploy/deploy.sh',
        content: generateEC2DeployScript(this.config),
      });

      files.push({
        path: `deploy/${this.config.projectName}.service`,
        content: generateSystemdService(this.config),
      });

      files.push({
        path: 'deploy/nginx.conf',
        content: generateNginxConfig(this.config),
      });
    }

    return files;
  }

  /**
   * Generate README.md content with caching
   * @param isGitHubRepo - Whether this scaffold is being pushed to GitHub
   * @param repoUrl - The GitHub repository URL (if applicable)
   */
  private generateReadme(_context: any, isGitHubRepo: boolean = false, repoUrl?: string): string {
    // Don't cache GitHub-specific READMEs since they contain unique URLs
    if (isGitHubRepo) {
      return this.documentationGenerator.generateREADME(isGitHubRepo, repoUrl);
    }
    
    const cacheKey = `readme-${this.config.framework}-${this.config.auth}-${this.config.database}`;
    
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }
    
    const content = this.documentationGenerator.generateREADME();
    this.templateCache.set(cacheKey, content);
    return content;
  }



  /**
   * Generate .gitignore content with caching
   */
  private generateGitignore(): string {
    const cacheKey = 'gitignore-enhanced';
    
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }
    
    const content = generateEnhancedGitignore();
    this.templateCache.set(cacheKey, content);
    return content;
  }

  /**
   * Generate .env.example content with caching
   */
  private generateEnvExample(_context: any): string {
    const cacheKey = `env-${this.config.auth}-${this.config.database}-${this.config.aiTemplate}`;
    
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }
    
    const content = this.documentationGenerator.generateEnvExample();
    this.templateCache.set(cacheKey, content);
    return content;
  }

  /**
   * Generate tsconfig.json content with caching
   */
  private generateTsConfig(context: any): string {
    const cacheKey = `tsconfig-${context.isNextJs}`;
    
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }
    
    const config = {
      compilerOptions: {
        target: 'ES2020',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        jsx: context.isNextJs ? 'preserve' : undefined,
        module: 'ESNext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        allowJs: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        incremental: true,
        isolatedModules: true,
        paths: {
          '@/*': ['./src/*'],
        },
        plugins: context.isNextJs
          ? [
              {
                name: 'next',
              },
            ]
          : undefined,
      },
      include: ['src/**/*', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    };

    const content = JSON.stringify(config, null, 2);
    this.templateCache.set(cacheKey, content);
    return content;
  }

  /**
   * Generate .prettierrc content with caching
   */
  private generatePrettierConfig(): string {
    const cacheKey = 'prettier-config';
    
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }
    
    const config = {
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
    };

    const content = JSON.stringify(config, null, 2);
    this.templateCache.set(cacheKey, content);
    return content;
  }

  /**
   * Generate .prettierignore content with caching
   */
  private generatePrettierIgnore(): string {
    const cacheKey = 'prettier-ignore';
    
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }
    
    const content = `# Dependencies
node_modules

# Build outputs
.next
out
dist
build
.turbo

# Misc
.DS_Store
*.log
coverage

# Lock files
package-lock.json
yarn.lock
pnpm-lock.yaml
bun.lock
`;
    
    this.templateCache.set(cacheKey, content);
    return content;
  }

  /**
   * Generate project-specific files based on project structure
   */
  private generateProjectFiles(_context: any): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Use projectStructure to determine which files to generate
    const projectStructure = this.config.projectStructure;

    if (projectStructure === 'fullstack-monorepo') {
      files.push(...this.generateMonorepoFiles());
    } else if (projectStructure === 'nextjs-only') {
      files.push(...this.generateNextJsFiles());
    } else if (projectStructure === 'react-spa') {
      files.push(...this.generateReactSpaFiles());
    } else if (projectStructure === 'express-api-only') {
      files.push(...this.generateExpressFiles());
    } else {
      // Fallback to legacy framework field for backward compatibility
      if (this.config.framework === 'monorepo') {
        files.push(...this.generateMonorepoFiles());
      } else if (this.config.framework === 'next') {
        files.push(...this.generateNextJsFiles());
      } else if (this.config.framework === 'express') {
        files.push(...this.generateExpressFiles());
      }
    }

    return files;
  }

  /**
   * Generate monorepo-specific files
   */
  private generateMonorepoFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Root package.json
    files.push({
      path: 'package.json',
      content: generatePackageJson(this.config),
    });

    // Turbo config
    files.push({
      path: 'turbo.json',
      content: generateTurboConfig(this.config),
    });

    // Web app files
    files.push({
      path: 'apps/web/package.json',
      content: generateWebAppPackageJson(this.config),
    });

    files.push({
      path: 'apps/web/next.config.ts',
      content: generateNextConfig(this.config),
    });

    files.push({
      path: 'apps/web/src/app/layout.tsx',
      content: generateNextJsLayout(this.config),
    });

    files.push({
      path: 'apps/web/src/app/page.tsx',
      content: generateNextJsHomePage(this.config),
    });

    // Styling files
    files.push({
      path: 'apps/web/src/app/globals.css',
      content: generateGlobalsCss(this.config),
    });

    if (this.config.styling === 'tailwind') {
      files.push({
        path: 'apps/web/tailwind.config.ts',
        content: generateTailwindConfig(this.config),
      });

      files.push({
        path: 'apps/web/postcss.config.mjs',
        content: generatePostCssConfig(),
      });

      if (this.config.shadcn) {
        files.push({
          path: 'apps/web/components.json',
          content: generateComponentsJson(this.config),
        });

        files.push({
          path: 'apps/web/src/lib/utils.ts',
          content: generateTailwindUtils(),
        });

        // Add shadcn UI components
        files.push({
          path: 'apps/web/src/components/ui/button.tsx',
          content: generateShadcnButton(),
        });

        files.push({
          path: 'apps/web/src/components/ui/card.tsx',
          content: generateShadcnCard(),
        });

        files.push({
          path: 'apps/web/src/components/ui/input.tsx',
          content: generateShadcnInput(),
        });

        // Add component usage example
        files.push({
          path: 'apps/web/src/app/components/page.tsx',
          content: generateShadcnUsageExample(this.config),
        });
      }
    } else if (this.config.styling === 'css-modules') {
      files.push({
        path: 'apps/web/src/app/page.module.css',
        content: generateCssModulesExample(),
      });

      // Add CSS Modules components
      files.push({
        path: 'apps/web/src/components/Button.tsx',
        content: generateCssModulesButtonComponent(),
      });

      files.push({
        path: 'apps/web/src/components/Button.module.css',
        content: generateCssModulesButton(),
      });

      files.push({
        path: 'apps/web/src/components/Card.tsx',
        content: generateCssModulesCardComponent(),
      });

      files.push({
        path: 'apps/web/src/components/Card.module.css',
        content: generateCssModulesCard(),
      });

      // Add component usage example
      files.push({
        path: 'apps/web/src/app/components/page.tsx',
        content: generateCssModulesUsageExample(),
      });

      files.push({
        path: 'apps/web/src/app/components/page.module.css',
        content: generateCssModulesUsageExampleStyles(),
      });
    } else if (this.config.styling === 'styled-components') {
      files.push({
        path: 'apps/web/src/lib/theme.ts',
        content: generateStyledComponentsTheme(this.config),
      });

      files.push({
        path: 'apps/web/src/lib/global-styles.ts',
        content: generateStyledComponentsGlobalStyles(this.config),
      });

      files.push({
        path: 'apps/web/src/lib/styled-components-provider.tsx',
        content: generateStyledComponentsProvider(),
      });

      files.push({
        path: 'apps/web/src/lib/registry.tsx',
        content: generateStyledComponentsRegistry(),
      });

      // Add styled-components components
      files.push({
        path: 'apps/web/src/components/Button.tsx',
        content: generateStyledComponentsButton(),
      });

      files.push({
        path: 'apps/web/src/components/Card.tsx',
        content: generateStyledComponentsCard(),
      });

      // Add component usage example
      files.push({
        path: 'apps/web/src/app/components/page.tsx',
        content: generateStyledComponentsUsageExample(),
      });
    }

    // API app files
    files.push({
      path: 'apps/api/package.json',
      content: generateApiAppPackageJson(this.config),
    });

    files.push({
      path: 'apps/api/src/index.ts',
      content: generateMonorepoExpressIndex(this.config),
    });

    files.push({
      path: 'apps/api/src/routes/index.ts',
      content: generateExpressRoutes(),
    });

    // Shared packages
    files.push({
      path: 'packages/shared-types/package.json',
      content: generateSharedTypesPackageJson(),
    });

    files.push({
      path: 'packages/shared-types/src/index.ts',
      content: generateSharedTypesIndex(),
    });

    files.push({
      path: 'packages/config/package.json',
      content: generateConfigPackageJson(),
    });

    return files;
  }

  /**
   * Generate Next.js standalone files
   */
  private generateNextJsFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // package.json
    files.push({
      path: 'package.json',
      content: generatePackageJson(this.config),
    });

    // next.config.ts
    files.push({
      path: 'next.config.ts',
      content: generateNextConfig(this.config),
    });

    // App files
    files.push({
      path: 'src/app/layout.tsx',
      content: generateNextJsLayout(this.config),
    });

    files.push({
      path: 'src/app/page.tsx',
      content: generateNextJsHomePage(this.config),
    });

    // API route examples (only for nextjs-only structure)
    if (this.config.projectStructure === 'nextjs-only') {
      files.push({
        path: 'src/app/api/hello/route.ts',
        content: generateHelloApiRoute(),
      });

      files.push({
        path: 'src/app/api/users/route.ts',
        content: generateUsersApiRoute(),
      });
    }

    // Styling files
    files.push({
      path: 'src/app/globals.css',
      content: generateGlobalsCss(this.config),
    });

    if (this.config.styling === 'tailwind') {
      files.push({
        path: 'tailwind.config.ts',
        content: generateTailwindConfig(this.config),
      });

      files.push({
        path: 'postcss.config.mjs',
        content: generatePostCssConfig(),
      });

      if (this.config.shadcn) {
        files.push({
          path: 'components.json',
          content: generateComponentsJson(this.config),
        });

        files.push({
          path: 'src/lib/utils.ts',
          content: generateTailwindUtils(),
        });

        // Add shadcn UI components
        files.push({
          path: 'src/components/ui/button.tsx',
          content: generateShadcnButton(),
        });

        files.push({
          path: 'src/components/ui/card.tsx',
          content: generateShadcnCard(),
        });

        files.push({
          path: 'src/components/ui/input.tsx',
          content: generateShadcnInput(),
        });

        // Add component usage example
        files.push({
          path: 'src/app/components/page.tsx',
          content: generateShadcnUsageExample(this.config),
        });
      }
    } else if (this.config.styling === 'styled-components') {
      files.push({
        path: 'src/lib/theme.ts',
        content: generateStyledComponentsTheme(this.config),
      });

      files.push({
        path: 'src/lib/global-styles.ts',
        content: generateStyledComponentsGlobalStyles(this.config),
      });

      files.push({
        path: 'src/lib/styled-components-provider.tsx',
        content: generateStyledComponentsProvider(),
      });

      files.push({
        path: 'src/lib/registry.tsx',
        content: generateStyledComponentsRegistry(),
      });

      // Add styled-components components
      files.push({
        path: 'src/components/Button.tsx',
        content: generateStyledComponentsButton(),
      });

      files.push({
        path: 'src/components/Card.tsx',
        content: generateStyledComponentsCard(),
      });

      // Add component usage example
      files.push({
        path: 'src/app/components/page.tsx',
        content: generateStyledComponentsUsageExample(),
      });
    } else if (this.config.styling === 'css-modules') {
      files.push({
        path: 'src/app/page.module.css',
        content: generateCssModulesExample(),
      });

      // Add CSS Modules components
      files.push({
        path: 'src/components/Button.tsx',
        content: generateCssModulesButtonComponent(),
      });

      files.push({
        path: 'src/components/Button.module.css',
        content: generateCssModulesButton(),
      });

      files.push({
        path: 'src/components/Card.tsx',
        content: generateCssModulesCardComponent(),
      });

      files.push({
        path: 'src/components/Card.module.css',
        content: generateCssModulesCard(),
      });

      // Add component usage example
      files.push({
        path: 'src/app/components/page.tsx',
        content: generateCssModulesUsageExample(),
      });

      files.push({
        path: 'src/app/components/page.module.css',
        content: generateCssModulesUsageExampleStyles(),
      });
    }

    return files;
  }

  /**
   * Generate Express standalone files
   */
  private generateExpressFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // package.json
    files.push({
      path: 'package.json',
      content: generatePackageJson(this.config),
    });

    // Server entry point
    files.push({
      path: 'src/index.ts',
      content: generateExpressIndex(this.config),
    });

    // Routes
    files.push({
      path: 'src/routes/index.ts',
      content: generateExpressRoutes(),
    });

    // Middleware
    files.push({
      path: 'src/middleware/index.ts',
      content: generateExpressMiddleware(),
    });

    return files;
  }

  /**
   * Generate React SPA files (frontend only)
   */
  private generateReactSpaFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // package.json
    files.push({
      path: 'package.json',
      content: generatePackageJson(this.config),
    });

    // Vite config (if Vite is selected or auto)
    const buildTool = this.config.buildTool === 'auto' ? 'vite' : this.config.buildTool;
    if (buildTool === 'vite') {
      files.push({
        path: 'vite.config.ts',
        content: this.generateViteConfig(),
      });
    }

    // Main entry files
    files.push({
      path: 'src/main.tsx',
      content: this.generateReactMain(),
    });

    files.push({
      path: 'src/App.tsx',
      content: this.generateReactApp(),
    });

    // Index HTML
    files.push({
      path: 'index.html',
      content: this.generateIndexHtml(),
    });

    // Styling files
    if (this.config.styling === 'tailwind') {
      files.push({
        path: 'src/index.css',
        content: generateGlobalsCss(this.config),
      });

      files.push({
        path: 'tailwind.config.ts',
        content: generateTailwindConfig(this.config),
      });

      files.push({
        path: 'postcss.config.mjs',
        content: generatePostCssConfig(),
      });
    }

    return files;
  }

  /**
   * Generate Vite config for React SPA
   */
  private generateViteConfig(): string {
    return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
`;
  }

  /**
   * Generate React main.tsx entry file
   */
  private generateReactMain(): string {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
${this.config.styling === 'tailwind' ? "import './index.css';" : ''}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
  }

  /**
   * Generate React App.tsx component
   */
  private generateReactApp(): string {
    return `import React from 'react';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to ${this.config.projectName}
        </h1>
        <p className="text-lg mb-8">
          ${this.config.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Frontend Framework</h2>
            <p>${this.config.frontendFramework}</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Build Tool</h2>
            <p>${this.config.buildTool}</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Styling</h2>
            <p>${this.config.styling}</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Project Structure</h2>
            <p>${this.config.projectStructure}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
`;
  }

  /**
   * Generate index.html for React SPA
   */
  private generateIndexHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${this.config.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
  }

  /**
   * Generate AI template files based on selected template
   * Skip for Express API only and React SPA (no backend/frontend respectively)
   */
  private generateAITemplateFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    
    // Skip AI templates for Express API only (no frontend) and React SPA (no backend)
    const projectStructure = this.config.projectStructure;
    if (projectStructure === 'express-api-only' || projectStructure === 'react-spa') {
      return files;
    }

    const isMonorepo = projectStructure === 'fullstack-monorepo';
    const basePath = isMonorepo ? 'apps/web/src' : 'src';

    switch (this.config.aiTemplate) {
      case 'chatbot':
        files.push({
          path: `${basePath}/app/api/chat/route.ts`,
          content: generateChatbotApiRoute(this.config),
        });
        files.push({
          path: `${basePath}/app/chat/page.tsx`,
          content: generateChatbotPage(this.config),
        });
        break;

      case 'document-analyzer':
        files.push({
          path: `${basePath}/app/api/analyze/route.ts`,
          content: generateDocumentAnalyzerApiRoute(this.config),
        });
        files.push({
          path: `${basePath}/app/analyze/page.tsx`,
          content: generateDocumentAnalyzerPage(this.config),
        });
        break;

      case 'semantic-search':
        files.push({
          path: `${basePath}/app/api/search/route.ts`,
          content: generateSemanticSearchApiRoute(this.config),
        });
        files.push({
          path: `${basePath}/app/search/page.tsx`,
          content: generateSemanticSearchPage(this.config),
        });
        break;

      case 'code-assistant':
        files.push({
          path: `${basePath}/app/api/code-assistant/route.ts`,
          content: generateCodeAssistantApiRoute(this.config),
        });
        files.push({
          path: `${basePath}/app/code-assistant/page.tsx`,
          content: generateCodeAssistantPage(this.config),
        });
        break;

      case 'image-generator':
        files.push({
          path: `${basePath}/app/api/generate-image/route.ts`,
          content: generateImageGeneratorApiRoute(this.config),
        });
        files.push({
          path: `${basePath}/app/generate-image/page.tsx`,
          content: generateImageGeneratorPage(this.config),
        });
        break;
    }

    return files;
  }

  /**
   * Generate authentication files based on selected auth provider
   * Skip for Express API only (no frontend)
   */
  private generateAuthFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    
    // Skip auth files for Express API only (no frontend)
    const projectStructure = this.config.projectStructure;
    if (projectStructure === 'express-api-only') {
      return files;
    }

    const isMonorepo = projectStructure === 'fullstack-monorepo';
    const basePath = isMonorepo ? 'apps/web/src' : 'src';

    switch (this.config.auth) {
      case 'nextauth':
        // NextAuth configuration
        files.push({
          path: `${basePath}/lib/auth.ts`,
          content: generateNextAuthConfig(this.config),
        });

        // NextAuth API route
        files.push({
          path: `${basePath}/app/api/auth/[...nextauth]/route.ts`,
          content: generateNextAuthRoute(),
        });

        // NextAuth middleware for protected routes and security headers
        files.push({
          path: 'middleware.ts',
          content: generateNextAuthMiddleware(),
        });

        // Session provider
        files.push({
          path: `${basePath}/components/auth-provider.tsx`,
          content: generateNextAuthSessionProvider(),
        });

        // Sign-in page
        files.push({
          path: `${basePath}/app/auth/signin/page.tsx`,
          content: generateNextAuthSignInPage(this.config),
        });

        // Error page
        files.push({
          path: `${basePath}/app/auth/error/page.tsx`,
          content: generateNextAuthErrorPage(this.config),
        });
        break;

      case 'supabase':
        // Supabase client
        files.push({
          path: `${basePath}/lib/supabase-client.ts`,
          content: generateSupabaseClient(),
        });

        // Supabase server client
        files.push({
          path: `${basePath}/lib/supabase-server.ts`,
          content: generateSupabaseServerClient(),
        });

        // Auth helpers
        files.push({
          path: `${basePath}/lib/auth-helpers.ts`,
          content: generateSupabaseAuthHelpers(),
        });

        // Migration file
        files.push({
          path: 'supabase/migrations/001_initial_schema.sql',
          content: generateSupabaseMigration(),
        });
        break;

      case 'clerk':
        // Clerk middleware
        files.push({
          path: 'middleware.ts',
          content: generateClerkMiddleware(),
        });

        // User button component
        files.push({
          path: `${basePath}/components/clerk-user-button.tsx`,
          content: generateClerkUserButton(this.config),
        });

        // Sign-in page
        files.push({
          path: `${basePath}/app/sign-in/[[...sign-in]]/page.tsx`,
          content: generateClerkSignInPage(),
        });

        // Sign-up page
        files.push({
          path: `${basePath}/app/sign-up/[[...sign-up]]/page.tsx`,
          content: generateClerkSignUpPage(),
        });
        break;
    }

    return files;
  }

  /**
   * Generate database files based on selected database
   */
  private generateDatabaseFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const projectStructure = this.config.projectStructure;
    const isMonorepo = projectStructure === 'fullstack-monorepo';
    const basePath = isMonorepo ? 'apps/web/src' : 'src';

    if (this.config.database === 'prisma-postgres') {
      // Prisma schema
      files.push({
        path: 'prisma/schema.prisma',
        content: generatePrismaSchema(this.config),
      });

      // Prisma client
      files.push({
        path: `${basePath}/lib/prisma.ts`,
        content: generatePrismaClient(),
      });

      // Query examples
      files.push({
        path: `${basePath}/lib/db-queries.ts`,
        content: generatePrismaExamples(),
      });

      // Migration script
      files.push({
        path: 'scripts/migrate.sh',
        content: generatePrismaMigrationScript(),
      });
    } else if (this.config.database === 'drizzle-postgres') {
      // Drizzle schema
      files.push({
        path: `${basePath}/lib/db/schema.ts`,
        content: generateDrizzleSchema(this.config),
      });

      // Drizzle client
      files.push({
        path: `${basePath}/lib/db/db.ts`,
        content: generateDrizzleClient(),
      });

      // Query examples
      files.push({
        path: `${basePath}/lib/db/queries.ts`,
        content: generateDrizzleExamples(),
      });

      // Drizzle config
      files.push({
        path: 'drizzle.config.ts',
        content: generateDrizzleConfig(),
      });

      // Migration script
      files.push({
        path: 'scripts/migrate.sh',
        content: generateDrizzleMigrationScript(),
      });
    } else if (this.config.database === 'supabase') {
      // Supabase database examples (if not already added by auth)
      if (this.config.auth !== 'supabase') {
        files.push({
          path: `${basePath}/lib/supabase-client.ts`,
          content: generateSupabaseClient(),
        });

        files.push({
          path: `${basePath}/lib/supabase-server.ts`,
          content: generateSupabaseServerClient(),
        });
      }

      // Database query examples
      files.push({
        path: `${basePath}/lib/db-queries.ts`,
        content: generateSupabaseDatabaseExamples(),
      });

      // Migration file (if not already added by auth)
      if (this.config.auth !== 'supabase') {
        files.push({
          path: 'supabase/migrations/001_initial_schema.sql',
          content: generateSupabaseMigration(),
        });
      }
    }

    // Redis integration (if enabled)
    if (this.config.extras.redis) {
      files.push({
        path: `${basePath}/lib/redis-client.ts`,
        content: generateRedisClient(),
      });

      files.push({
        path: `${basePath}/lib/cache-helpers.ts`,
        content: generateRedisCacheHelpers(),
      });

      files.push({
        path: `${basePath}/lib/cache-examples.ts`,
        content: generateRedisExamples(),
      });
    }

    return files;
  }

  /**
   * Generate API layer files based on selected API type
   * Skip for React SPA (no backend)
   */
  private generateApiLayerFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    
    // Skip API layer for React SPA (no backend)
    const projectStructure = this.config.projectStructure;
    if (projectStructure === 'react-spa') {
      return files;
    }

    const isMonorepo = projectStructure === 'fullstack-monorepo';
    const basePath = isMonorepo ? 'apps/web/src' : 'src';

    switch (this.config.api) {
      case 'rest-fetch':
        // Fetch-based API client
        files.push({
          path: `${basePath}/lib/api-client.ts`,
          content: generateFetchApiClient(this.config),
        });

        // Example API routes
        files.push({
          path: `${basePath}/app/api/users/route.ts`,
          content: generateRestApiRouteExamples(this.config),
        });

        files.push({
          path: `${basePath}/app/api/users/[id]/route.ts`,
          content: generateRestApiSingleResourceRoute(this.config),
        });
        break;

      case 'rest-axios':
        // Axios-based API client
        files.push({
          path: `${basePath}/lib/api-client.ts`,
          content: generateAxiosApiClient(this.config),
        });

        // Example API routes
        files.push({
          path: `${basePath}/app/api/users/route.ts`,
          content: generateRestApiRouteExamples(this.config),
        });

        files.push({
          path: `${basePath}/app/api/users/[id]/route.ts`,
          content: generateRestApiSingleResourceRoute(this.config),
        });
        break;

      case 'trpc':
        // tRPC router
        files.push({
          path: `${basePath}/lib/trpc/router.ts`,
          content: generateTrpcRouter(this.config),
        });

        // tRPC API route
        files.push({
          path: `${basePath}/app/api/trpc/[trpc]/route.ts`,
          content: generateTrpcApiRoute(),
        });

        // tRPC client
        files.push({
          path: `${basePath}/lib/trpc/client.ts`,
          content: generateTrpcClient(this.config),
        });

        // tRPC provider
        files.push({
          path: `${basePath}/lib/trpc/provider.tsx`,
          content: generateTrpcProvider(),
        });

        // tRPC usage example
        files.push({
          path: `${basePath}/app/users/page.tsx`,
          content: generateTrpcUsageExample(),
        });
        break;

      case 'graphql':
        // GraphQL schema
        files.push({
          path: `${basePath}/lib/graphql/schema.ts`,
          content: generateGraphQLSchema(this.config),
        });

        // GraphQL API route
        files.push({
          path: `${basePath}/app/api/graphql/route.ts`,
          content: generateGraphQLApiRoute(),
        });

        // Apollo client
        files.push({
          path: `${basePath}/lib/graphql/client.ts`,
          content: generateApolloClient(this.config),
        });

        // Apollo provider
        files.push({
          path: `${basePath}/lib/graphql/provider.tsx`,
          content: generateApolloProvider(),
        });

        // GraphQL queries
        files.push({
          path: `${basePath}/lib/graphql/queries.ts`,
          content: generateGraphQLQueries(),
        });

        // GraphQL usage example
        files.push({
          path: `${basePath}/app/users/page.tsx`,
          content: generateGraphQLUsageExample(),
        });
        break;
    }

    return files;
  }

  /**
   * Generate template pages (dashboard and auth pages if auth is enabled)
   * Always generated for frontend projects as boilerplate
   */
  private generateTemplatePages(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const projectStructure = this.config.projectStructure;
    const hasAuth = this.config.auth !== 'none';
    
    // Skip for Express API only (no frontend)
    if (projectStructure === 'express-api-only') {
      return files;
    }

    const isMonorepo = projectStructure === 'fullstack-monorepo';
    const basePath = isMonorepo ? 'apps/web/src' : 'src';

    // Always generate dashboard page
    files.push({
      path: `${basePath}/app/dashboard/page.tsx`,
      content: generateTemplateDashboardPage(this.config),
    });

    // Generate auth pages if auth is enabled
    if (hasAuth) {
      files.push({
        path: `${basePath}/app/signin/page.tsx`,
        content: generateTemplateSignInPage(this.config),
      });

      files.push({
        path: `${basePath}/app/signup/page.tsx`,
        content: generateTemplateSignUpPage(this.config),
      });

      files.push({
        path: `${basePath}/app/forgot-password/page.tsx`,
        content: generateTemplateForgotPasswordPage(this.config),
      });
    }

    return files;
  }
}
