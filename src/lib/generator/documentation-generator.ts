import { ScaffoldConfigWithFramework, DocumentationSection } from '@/types';

/**
 * Documentation Generator
 * Generates comprehensive documentation based on scaffold configuration
 */
export class DocumentationGenerator {
  private config: ScaffoldConfigWithFramework;

  constructor(config: ScaffoldConfigWithFramework) {
    this.config = config;
  }

  /**
   * Generate README.md content
   * @param isGitHubRepo - Whether this scaffold is being pushed to GitHub
   * @param repoUrl - The GitHub repository URL (if applicable)
   */
  generateREADME(isGitHubRepo: boolean = false, repoUrl?: string): string {
    const sections = [
      this.getProjectOverview(isGitHubRepo, repoUrl),
      this.getGettingStarted(),
      this.getProjectStructure(),
      this.getAvailableScripts(),
      this.getDeploymentSection(isGitHubRepo, repoUrl),
      this.getSecuritySection(),
      this.getTroubleshooting(),
    ];

    return this.buildDocument(sections);
  }

  /**
   * Generate SETUP.md content
   */
  generateSETUP(): string {
    const sections = [
      this.getPrerequisites(),
      this.getDatabaseSetup(),
      this.getAuthSetup(),
      this.getAISetup(),
      this.getExternalServicesSetup(),
      this.getEnvironmentVariables(),
    ];

    return this.buildDocument(sections.filter((s) => s !== null));
  }

  /**
   * Generate DEPLOYMENT.md content
   */
  generateDEPLOYMENT(): string {
    const sections = [
      this.getDeploymentOverview(),
      ...this.getDeploymentGuides(),
      this.getOAuthCallbackUpdates(),
    ];

    return this.buildDocument(sections.filter((s) => s !== null));
  }

  /**
   * Generate .env.example content
   */
  generateEnvExample(): string {
    const sections: string[] = [];

    // Security warning header
    sections.push('# ⚠️ SECURITY WARNING ⚠️');
    sections.push('# This is an example file. DO NOT commit actual API keys or secrets!');
    sections.push('# Copy this file to .env.local and fill in your actual values.');
    sections.push('# The .env.local file is already in .gitignore and will not be committed.');
    sections.push('');

    // Application basics
    sections.push('# Application');
    sections.push('NODE_ENV=development');

    if (this.isNextJs()) {
      sections.push('NEXT_PUBLIC_APP_URL=http://localhost:3000');
    } else if (this.config.framework === 'express') {
      sections.push('PORT=4000');
    }

    // Database
    if (this.hasDatabase()) {
      sections.push('');
      sections.push('# Database');
      sections.push('# ⚠️ Keep database credentials secure! Never commit real connection strings.');
      sections.push(this.getDatabaseEnvVars());
    }

    // Authentication
    if (this.hasAuth()) {
      sections.push('');
      sections.push('# Authentication');
      sections.push('# ⚠️ Keep auth secrets secure! Generate new secrets for production.');
      sections.push(this.getAuthEnvVars());
    }

    // AI Integration
    if (this.hasAI()) {
      const provider = this.config.aiProvider || 'anthropic';
      const providerInfo = this.getAIProviderInfo(provider);
      
      sections.push('');
      sections.push('# AI Integration');
      sections.push('# ⚠️ Keep API keys secure! Never commit real keys to version control.');
      sections.push(`# Get your API key from: ${providerInfo.setupUrl}`);
      sections.push(`${providerInfo.envVarName}=your-api-key-here`);
    }

    // Redis
    if (this.config.extras.redis) {
      sections.push('');
      sections.push('# Redis');
      sections.push('# Local: redis://localhost:6379');
      sections.push('# Production: Get from Upstash or Redis Cloud');
      sections.push('REDIS_URL=redis://localhost:6379');
    }

    return sections.join('\n');
  }

  /**
   * Generate monorepo communication documentation
   */
  generateMonorepoDocs(): string | null {
    if (this.config.framework !== 'monorepo') {
      return null;
    }

    return `# Monorepo Architecture

This project uses Turborepo to manage multiple applications and shared packages.

## Structure

- \`apps/web\`: Next.js frontend application
- \`apps/api\`: Express backend API
- \`packages/shared-types\`: TypeScript types shared between apps
- \`packages/config\`: Shared configuration files

## Running the Monorepo

**Development (all apps):**
\`\`\`bash
npm run dev
\`\`\`

**Development (specific app):**
\`\`\`bash
npm --filter=web run dev
npm --filter=api run dev
\`\`\`

**Build all apps:**
\`\`\`bash
npm run build
\`\`\`

## Communication Between Apps

### Frontend → Backend API

The web app communicates with the API using ${this.getApiLayerDescription()}:

\`\`\`typescript
// apps/web/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchUser(id: string) {
  const response = await fetch(\`\${API_URL}/api/users/\${id}\`);
  return response.json();
}
\`\`\`

### Shared Types

Both apps import types from the shared package:

\`\`\`typescript
// packages/shared-types/src/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
}

// apps/api/src/routes/users.ts
import { User } from '@repo/shared-types';

// apps/web/app/users/page.tsx
import { User } from '@repo/shared-types';
\`\`\`

## Environment Variables for Monorepo

**apps/web/.env.local:**
\`\`\`bash
NEXT_PUBLIC_API_URL=http://localhost:4000
${this.hasAuth() ? this.getAuthEnvVars() : ''}
\`\`\`

**apps/api/.env:**
\`\`\`bash
PORT=4000
${this.hasDatabase() ? this.getDatabaseEnvVars() : ''}
\`\`\`

## Development Workflow

1. **Install dependencies**: \`npm install\` (from root)
2. **Start all apps**: \`npm run dev\`
3. **Access apps**:
   - Web: http://localhost:3000
   - API: http://localhost:4000

## Adding New Shared Packages

1. Create new package in \`packages/\` directory
2. Add \`package.json\` with package name
3. Reference in app's \`package.json\` dependencies
4. Run \`npm install\` from root
`;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private buildDocument(sections: (DocumentationSection | string | null)[]): string {
    return sections
      .filter((s) => s !== null)
      .map((section) => {
        if (typeof section === 'string') {
          return section;
        }
        return section.content;
      })
      .join('\n\n');
  }

  private isNextJs(): boolean {
    return this.config.framework === 'next' || this.config.framework === 'monorepo';
  }

  private hasDatabase(): boolean {
    return this.config.database !== 'none';
  }

  private hasAuth(): boolean {
    return this.config.auth !== 'none';
  }

  private hasAI(): boolean {
    return this.config.aiTemplate !== undefined && this.config.aiTemplate !== 'none';
  }

  private getApiLayerDescription(): string {
    const descriptions: Record<string, string> = {
      'rest-fetch': 'REST API with fetch',
      'rest-axios': 'REST API with axios',
      trpc: 'tRPC for type-safe API calls',
      graphql: 'GraphQL',
    };
    return descriptions[this.config.api] || 'REST API';
  }

  // ============================================================================
  // README Sections
  // ============================================================================

  private getProjectOverview(isGitHubRepo: boolean = false, _repoUrl?: string): DocumentationSection {
    const aiFeature = this.hasAI()
      ? ` with ${this.getAITemplateDescription()}`
      : '';

    // Generate tech stack badge
    const techStackBadge = this.generateTechStackBadge();
    
    // GitHub-specific header
    const githubHeader = isGitHubRepo ? `
> 🚀 **Generated by [StackForge](https://stackforge.dev)** - Your AI-powered full-stack scaffold generator

${techStackBadge}

---
` : '';

    const aiProviderInfo = this.hasAI() && this.config.aiProvider
      ? ` (${this.getAIProviderInfo(this.config.aiProvider).displayName})`
      : '';

    return {
      title: 'Project Overview',
      order: 1,
      content: `# ${this.config.projectName}

${githubHeader}
${this.config.description}${aiFeature}

## Tech Stack

- **Framework**: ${this.getFrameworkDescription()}
- **Authentication**: ${this.getAuthDescription()}
- **Database**: ${this.getDatabaseDescription()}
- **API**: ${this.getApiLayerDescription()}
- **Styling**: ${this.getStylingDescription()}
- **Color Scheme**: ${this.config.colorScheme}${this.hasAI() ? `\n- **AI Template**: ${this.getAITemplateDescription()}${aiProviderInfo}` : ''}
${this.config.deployment.length > 0 ? `- **Deployment**: ${this.config.deployment.join(', ')}` : ''}`,
      applicableWhen: () => true,
    };
  }

  private getGettingStarted(): DocumentationSection {
    const setupInstructions = this.hasAuth() || this.hasDatabase() || this.hasAI()
      ? '\n\nFor detailed setup instructions for authentication, database, and AI features, see [SETUP.md](./SETUP.md).'
      : '';

    const aiPrerequisite = this.hasAI() && this.config.aiProvider
      ? `\n- ${this.getAIProviderInfo(this.config.aiProvider).displayName} API key (for AI features)`
      : '';

    const aiEnvVarName = this.hasAI() && this.config.aiProvider
      ? this.getAIProviderInfo(this.config.aiProvider).envVarName
      : 'ANTHROPIC_API_KEY';

    return {
      title: 'Getting Started',
      order: 2,
      content: `## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm, yarn, or pnpm${aiPrerequisite}${this.hasDatabase() && this.config.database.includes('postgres') ? '\n- PostgreSQL database (local or cloud)' : ''}

### Installation

1. **Clone the repository** (if applicable)

2. **Install dependencies**

\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**

Copy the \`.env.example\` file to \`.env.local\`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Then fill in the required values. ${this.hasAI() ? `You must add your \`${aiEnvVarName}\` to use AI features.` : ''}${setupInstructions}

4. **Start the development server**

\`\`\`bash
npm run dev
\`\`\`

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see your application.${this.getKeyRoutesInfo()}`,
      applicableWhen: () => true,
    };
  }

  private getProjectStructure(): DocumentationSection {
    const additionalInfo = this.getProjectStructureDetails();
    
    return {
      title: 'Project Structure',
      order: 3,
      content: `## Project Structure

\`\`\`
${this.generateProjectStructureTree()}
\`\`\`${additionalInfo ? `\n\n${additionalInfo}` : ''}`,
      applicableWhen: () => true,
    };
  }

  private generateProjectStructureTree(): string {
    if (this.config.framework === 'monorepo') {
      return `${this.config.projectName}/
├── apps/
│   ├── web/              # Next.js application
│   │   ├── src/
│   │   │   ├── app/      # App router pages
│   │   │   ├── components/
│   │   │   └── lib/
│   │   └── package.json
│   └── api/              # Express API
│       ├── src/
│       │   ├── routes/
│       │   └── middleware/
│       └── package.json
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   └── config/           # Shared configurations
├── .env.example
├── README.md
└── package.json`;
    } else if (this.config.framework === 'next') {
      return `${this.config.projectName}/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/       # React components
│   └── lib/              # Utility functions
├── public/               # Static assets
├── .env.example
├── README.md
└── package.json`;
    } else {
      return `${this.config.projectName}/
├── src/
│   ├── index.ts          # Server entry point
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── lib/              # Utility functions
├── .env.example
├── README.md
└── package.json`;
    }
  }

  /**
   * Generate detailed information about key routes and pages
   */
  private getProjectStructureDetails(): string {
    const sections: string[] = [];

    // API Routes section
    const apiRoutes = this.getApiRoutesList();
    if (apiRoutes.length > 0) {
      sections.push('### API Routes\n');
      sections.push(apiRoutes.join('\n'));
    }

    // Pages section
    const pages = this.getPagesList();
    if (pages.length > 0) {
      sections.push('\n### Pages\n');
      sections.push(pages.join('\n'));
    }

    // Auth pages section
    if (this.hasAuth()) {
      const authPages = this.getAuthPagesList();
      if (authPages.length > 0) {
        sections.push('\n### Authentication Pages\n');
        sections.push(authPages.join('\n'));
      }
    }

    return sections.length > 0 ? sections.join('\n') : '';
  }

  /**
   * Get list of API routes based on configuration
   */
  private getApiRoutesList(): string[] {
    const routes: string[] = [];

    if (this.config.framework === 'next' || this.config.framework === 'monorepo') {
      // AI Template API routes
      if (this.hasAI()) {
        const aiTemplate = this.config.aiTemplate;
        if (aiTemplate === 'chatbot') {
          routes.push('- `POST /api/chat` - AI chatbot conversation endpoint');
        } else if (aiTemplate === 'document-analyzer') {
          routes.push('- `POST /api/analyze` - Document analysis endpoint');
        } else if (aiTemplate === 'semantic-search') {
          routes.push('- `POST /api/search` - Semantic search endpoint');
          routes.push('- `POST /api/embed` - Generate embeddings for documents');
        } else if (aiTemplate === 'code-assistant') {
          routes.push('- `POST /api/code-assistant` - Code generation and explanation');
        } else if (aiTemplate === 'image-generator') {
          routes.push('- `POST /api/generate-image` - AI image generation');
        }
      }

      // Auth API routes
      if (this.hasAuth()) {
        if (this.config.auth === 'nextauth') {
          routes.push('- `GET/POST /api/auth/[...nextauth]` - NextAuth.js authentication endpoints');
        }
      }

      // Database API routes (if applicable)
      if (this.hasDatabase()) {
        routes.push('- `GET /api/users` - User management endpoints (example)');
      }
    } else if (this.config.framework === 'express') {
      routes.push('- `GET /api/health` - Health check endpoint');
      routes.push('- `GET /api/*` - Your API routes');
    }

    return routes;
  }

  /**
   * Get list of pages based on configuration
   */
  private getPagesList(): string[] {
    const pages: string[] = [];

    if (this.config.framework === 'next' || this.config.framework === 'monorepo') {
      pages.push('- `/` - Home page');

      // AI Template pages
      if (this.hasAI()) {
        const aiTemplate = this.config.aiTemplate;
        if (aiTemplate === 'chatbot') {
          pages.push('- `/chat` - AI chatbot interface');
        } else if (aiTemplate === 'document-analyzer') {
          pages.push('- `/analyze` - Document analyzer interface');
        } else if (aiTemplate === 'semantic-search') {
          pages.push('- `/search` - Semantic search interface');
        } else if (aiTemplate === 'code-assistant') {
          pages.push('- `/code-assistant` - Code assistant interface');
        } else if (aiTemplate === 'image-generator') {
          pages.push('- `/generate-image` - Image generation interface');
        }
      }

      // Dashboard page (if auth is enabled)
      if (this.hasAuth()) {
        pages.push('- `/dashboard` - User dashboard (protected)');
      }
    }

    return pages;
  }

  /**
   * Get list of authentication pages
   */
  private getAuthPagesList(): string[] {
    const pages: string[] = [];

    if (this.config.auth === 'nextauth') {
      pages.push('- `/api/auth/signin` - Sign in page');
      pages.push('- `/api/auth/signout` - Sign out endpoint');
      pages.push('- `/api/auth/error` - Authentication error page');
    } else if (this.config.auth === 'clerk') {
      pages.push('- `/sign-in` - Clerk sign in page');
      pages.push('- `/sign-up` - Clerk sign up page');
      pages.push('- `/user-profile` - User profile management');
    } else if (this.config.auth === 'supabase') {
      pages.push('- `/auth/login` - Login page');
      pages.push('- `/auth/signup` - Sign up page');
      pages.push('- `/auth/callback` - OAuth callback handler');
    }

    return pages;
  }

  /**
   * Get key routes information for Getting Started section
   */
  private getKeyRoutesInfo(): string {
    const info: string[] = [];

    if (this.hasAI()) {
      info.push(`\n\n6. **Try the AI features**\n\nVisit ${this.getAIFeatureRoute()} to test your AI integration.`);
    }

    if (this.hasAuth()) {
      const authRoute = this.config.auth === 'nextauth' 
        ? 'http://localhost:3000/api/auth/signin'
        : this.config.auth === 'clerk'
        ? 'http://localhost:3000/sign-in'
        : 'http://localhost:3000/auth/login';
      
      const stepNum = this.hasAI() ? 7 : 6;
      info.push(`\n\n${stepNum}. **Test authentication**\n\nVisit ${authRoute} to sign in and access the dashboard at http://localhost:3000/dashboard`);
    }

    return info.join('');
  }

  private getAvailableScripts(): DocumentationSection {
    const scripts: string[] = [
      '- `npm run dev` - Start development server',
      '- `npm run build` - Build for production',
      '- `npm run start` - Start production server',
      '- `npm run lint` - Run ESLint',
    ];

    if (this.config.extras.prettier) {
      scripts.push('- `npm run format` - Format code with Prettier');
    }

    if (this.config.framework === 'monorepo') {
      scripts.push('- `npm run dev --filter=web` - Start only web app');
      scripts.push('- `npm run dev --filter=api` - Start only API app');
    }

    return {
      title: 'Available Scripts',
      order: 4,
      content: `## Available Scripts

${scripts.join('\n')}`,
      applicableWhen: () => true,
    };
  }

  private getDeploymentSection(isGitHubRepo: boolean = false, _repoUrl?: string): DocumentationSection {
    if (this.config.deployment.length === 0) {
      const githubNote = isGitHubRepo && _repoUrl ? `

### GitHub Integration

This repository was automatically created and populated by StackForge. To deploy:

1. Connect this repository to your preferred deployment platform
2. Configure environment variables in the platform dashboard
3. Deploy with a single click

Most platforms (Vercel, Railway, Render) can auto-detect and deploy Next.js projects directly from GitHub.` : '';

      return {
        title: 'Deployment',
        order: 5,
        content: `## Deployment

This project can be deployed to various platforms. See the deployment platform documentation for specific instructions.${githubNote}`,
        applicableWhen: () => true,
      };
    }

    const githubIntegrationNote = isGitHubRepo && _repoUrl ? `

### GitHub-Connected Deployment

This repository is already on GitHub, making deployment even easier:

${this.config.deployment.map((platform) => {
  if (platform === 'vercel') {
    return `- **Vercel**: Visit [vercel.com/new](https://vercel.com/new), import this repository, and deploy in minutes`;
  } else if (platform === 'railway') {
    return `- **Railway**: Visit [railway.app](https://railway.app), select "Deploy from GitHub repo", and choose this repository`;
  } else if (platform === 'render') {
    return `- **Render**: Visit [render.com](https://render.com), create a new Web Service, and connect this repository`;
  }
  return `- **${this.capitalizeFirst(platform)}**: Connect this repository to deploy`;
}).join('\n')}

All these platforms offer automatic deployments on every push to your main branch.
` : '';

    return {
      title: 'Deployment',
      order: 5,
      content: `## Deployment

This project is configured for deployment to: ${this.config.deployment.join(', ')}.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).
${githubIntegrationNote}
### Quick Links

${this.config.deployment.map((platform) => `- [${this.capitalizeFirst(platform)} Deployment](#${platform}-deployment)`).join('\n')}`,
      applicableWhen: () => true,
    };
  }

  private getTroubleshooting(): DocumentationSection {
    const issues: string[] = [];

    if (this.hasAI()) {
      const provider = this.config.aiProvider || 'anthropic';
      const providerInfo = this.getAIProviderInfo(provider);
      
      issues.push(`### AI Features Not Working

**API Key Issues:**
- Verify the key is correctly copied from [${providerInfo.displayName} Console](${providerInfo.setupUrl})
- Check that there are no extra spaces in the \`.env.local\` file${providerInfo.keyPrefix ? `\n- Ensure the key starts with \`${providerInfo.keyPrefix}\`` : ''}
- Verify you're using the correct environment variable: \`${providerInfo.envVarName}\`
- Restart the development server after adding the key

**Rate Limiting:**
- Check your usage limits in the ${providerInfo.displayName} Console
- Wait a few minutes before retrying if you hit rate limits
- Consider upgrading your plan for higher limits

**Response Issues:**
- Check the browser console for error messages
- Verify your account has sufficient credits/quota
- Ensure the API endpoint is accessible (check network tab)
- Try a simpler prompt to test basic functionality`);
    }

    if (this.hasAuth()) {
      issues.push(`### Authentication Issues

- Verify all auth environment variables are set correctly
- Check that OAuth callback URLs match your configuration
- Ensure the auth secret is properly generated
- Clear browser cookies and try again`);
    }

    if (this.hasDatabase()) {
      issues.push(`### Database Connection Issues

- Verify the DATABASE_URL is correctly formatted
- Check that the database server is running
- Ensure network connectivity to the database
- Verify database credentials are correct`);
    }

    issues.push(`### Environment Variables Not Loading

- Restart the development server after changing \`.env.local\`
- Verify the file is named exactly \`.env.local\` (not \`.env\`)
- Check that the file is in the project root directory
- Ensure variables are not commented out`);

    return {
      title: 'Troubleshooting',
      order: 6,
      content: `## Troubleshooting

${issues.join('\n\n')}

### Getting Help

If you encounter issues not covered here:

1. Check the documentation for the specific technology
2. Search for similar issues on GitHub
3. Review the error messages carefully for clues`,
      applicableWhen: () => true,
    };
  }

  /**
   * Generate security best practices section
   */
  private getSecuritySection(): DocumentationSection {
    return {
      title: 'Security',
      order: 7,
      content: `## Security Best Practices

### Dependency Management

This project uses exact dependency versions in \`package.json\` for security and reproducibility.

**Regular Security Audits:**

\`\`\`bash
# Check for known vulnerabilities
npm audit

# Fix vulnerabilities automatically (when possible)
npm audit fix

# For more detailed analysis
npm audit --json
\`\`\`

**Updating Dependencies:**

\`\`\`bash
# Check for outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all packages (be careful, test thoroughly)
npm update
\`\`\`

**Recommended Schedule:**
- Run \`npm audit\` weekly
- Review and update dependencies monthly
- Always test after updates

### Environment Variables

- **Never commit** \`.env.local\` or \`.env\` files
- Use different secrets for development and production
- Rotate API keys regularly, especially if exposed
- Use secret management services in production (AWS Secrets Manager, etc.)

### Authentication Security

${this.hasAuth() ? `
- Keep auth secrets secure and rotate them regularly
- Use strong, randomly generated secrets (minimum 32 characters)
- Enable 2FA on all service accounts (GitHub, Google, etc.)
- Review OAuth scopes - only request what you need
- Monitor authentication logs for suspicious activity
` : '- If you add authentication later, follow security best practices'}

### API Security

- Rate limit API endpoints to prevent abuse
- Validate all user input
- Use HTTPS in production (enforced by default)
- Implement proper error handling (don't leak sensitive info)
- Keep API keys secure and monitor usage

### Database Security

${this.hasDatabase() ? `
- Use connection pooling to prevent exhaustion
- Implement proper access controls and permissions
- Regularly backup your database
- Use parameterized queries to prevent SQL injection
- Encrypt sensitive data at rest
` : '- If you add a database later, follow security best practices'}

### Docker Security

${this.config.extras.docker ? `
- Images use non-root users by default
- Multi-stage builds minimize attack surface
- No secrets are baked into images
- Regular base image updates recommended
- Scan images for vulnerabilities: \`docker scan your-image\`
` : '- If you use Docker, follow container security best practices'}

### Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public issue
2. Email security concerns privately
3. Include detailed reproduction steps
4. Allow time for fixes before public disclosure`,
      applicableWhen: () => true,
    };
  }

  // ============================================================================
  // SETUP.md Sections
  // ============================================================================

  private getPrerequisites(): DocumentationSection {
    return {
      title: 'Prerequisites',
      order: 1,
      content: `# Setup Guide

This guide will help you set up all the services and integrations for this project.

## Prerequisites

- Node.js 20 or higher installed
- A code editor (VS Code recommended)
- Git installed${this.hasDatabase() && this.config.database.includes('postgres') ? '\n- PostgreSQL (local or cloud account)' : ''}${this.hasAI() ? '\n- Anthropic account for AI features' : ''}`,
      applicableWhen: () => true,
    };
  }

  private getAISetup(): DocumentationSection | null {
    if (!this.hasAI()) {
      return null;
    }

    const provider = this.config.aiProvider || 'anthropic';
    const providerInfo = this.getAIProviderInfo(provider);

    return {
      title: 'AI Integration Setup',
      order: 2,
      content: `## AI Integration Setup

This project uses ${providerInfo.displayName} for ${this.getAITemplateDescription()}.

### Step 1: Get Your ${providerInfo.displayName} API Key

1. Go to [${providerInfo.displayName} Console](${providerInfo.setupUrl})
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy your API key${providerInfo.keyPrefix ? ` (it starts with \`${providerInfo.keyPrefix}\`)` : ''}

### Step 2: Add API Key to Environment

Open your \`.env.local\` file and add:

\`\`\`bash
${providerInfo.envVarName}=your-api-key-here
\`\`\`

**Important**: Never commit your \`.env.local\` file to version control!

### Step 3: Test the Integration

1. Start the development server: \`npm run dev\`
2. Navigate to the AI feature page: ${this.getAIFeatureRoute()}
3. Try the AI functionality to ensure it's working

### AI Template Features

Your selected template (${this.getAITemplateDescription()}) includes:

${this.getAITemplateFeatures()}

### Generated Files

The following files have been generated for your AI template:

${this.getAITemplateFiles()}

### Rate Limits and Costs

- Check the [${providerInfo.displayName} Pricing](${providerInfo.pricingUrl}) for current rates
- Monitor your usage in the ${providerInfo.displayName} Console
- Set up usage alerts to avoid unexpected charges

### Troubleshooting

**Error: "Invalid API key"**
- Double-check that you copied the entire key
- Ensure there are no spaces before or after the key
- Verify the key hasn't been revoked in the console
- Confirm you're using the correct environment variable name

**Error: "Rate limit exceeded"**
- Wait a few minutes before retrying
- Check your usage in the ${providerInfo.displayName} Console
- Consider upgrading your plan if needed

**AI responses not working**
- Verify the API key is set in \`.env.local\`
- Restart the development server after adding the key
- Check the browser console and server logs for errors
- Ensure your account has sufficient credits/quota`,
      applicableWhen: () => this.hasAI(),
    };
  }

  private getDatabaseSetup(): DocumentationSection | null {
    if (!this.hasDatabase()) {
      return null;
    }

    let content = `## Database Setup\n\n`;

    if (this.config.database === 'supabase') {
      content += `This project uses Supabase for the database.

### Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose a name and database password
4. Select a region close to your users
5. Wait for provisioning (2-3 minutes)

### Step 2: Get Your Connection Details

1. Navigate to **Project Settings** > **API**
2. Copy the "Project URL" (starts with https://)
3. Copy the "anon public" key
4. Copy the "service_role" key (keep this secret!)

### Step 3: Configure Environment Variables

Add to \`.env.local\`:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

### Step 4: Set Up Database Tables

1. Navigate to the SQL Editor in your Supabase dashboard
2. Create your tables using the SQL editor or Table Editor
3. Set up Row Level Security (RLS) policies for data protection

### Step 5: Test the Connection

\`\`\`bash
npm run dev
# Visit http://localhost:3000
# Try database operations to verify connection
\`\`\``;
    } else if (
      this.config.database === 'prisma-postgres' ||
      this.config.database === 'drizzle-postgres'
    ) {
      const orm = this.config.database === 'prisma-postgres' ? 'Prisma' : 'Drizzle';

      content += `This project uses PostgreSQL with ${orm}.

### Step 1: Set Up PostgreSQL

**Option A: Local PostgreSQL**

\`\`\`bash
# Install PostgreSQL (macOS)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb ${this.config.projectName}
\`\`\`

**Option B: Cloud PostgreSQL (Recommended for Production)**

Choose one of these providers:
- [Supabase](https://supabase.com/) - Free tier available, includes auth
- [Railway](https://railway.app/) - Free tier available, easy deployment
- [Neon](https://neon.tech/) - Serverless Postgres, free tier available
- [Render](https://render.com/) - Free tier available

### Step 2: Configure Database URL

Add to \`.env.local\`:

\`\`\`bash
# Local PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/${this.config.projectName}

# Or use your cloud provider's connection string
DATABASE_URL=postgresql://user:password@host:5432/database
\`\`\`

### Step 3: Run Migrations

${
  this.config.database === 'prisma-postgres'
    ? `\`\`\`bash
npx prisma migrate dev --name init
npx prisma generate
\`\`\``
    : `\`\`\`bash
npm run db:generate
npm run db:migrate
\`\`\``
}

### Step 4: Test the Connection

\`\`\`bash
npm run dev
# Database should connect automatically
\`\`\``;
    } else if (this.config.database === 'mongodb') {
      content += `This project uses MongoDB.

### Step 1: Set Up MongoDB

**Option A: MongoDB Atlas (Recommended)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string

**Option B: Local MongoDB**

\`\`\`bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
\`\`\`

### Step 2: Configure Database URL

Add to \`.env.local\`:

\`\`\`bash
# MongoDB Atlas
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database

# Local MongoDB
DATABASE_URL=mongodb://localhost:27017/${this.config.projectName}
\`\`\`

### Step 3: Test the Connection

\`\`\`bash
npm run dev
# Database should connect automatically
\`\`\``;
    }

    return {
      title: 'Database Setup',
      order: 3,
      content,
      applicableWhen: () => this.hasDatabase(),
    };
  }

  private getAuthSetup(): DocumentationSection | null {
    if (!this.hasAuth()) {
      return null;
    }

    let content = `## Authentication Setup\n\n`;

    if (this.config.auth === 'nextauth') {
      content += `This project uses NextAuth.js for authentication.

### Step 1: Generate Auth Secret

\`\`\`bash
openssl rand -base64 32
\`\`\`

Add to \`.env.local\`:

\`\`\`bash
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
\`\`\`

### Step 2: Configure OAuth Providers

#### GitHub OAuth

1. Go to [GitHub Settings](https://github.com/settings/developers) > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Your app name
   - **Homepage URL**: \`http://localhost:3000\`
   - **Authorization callback URL**: \`http://localhost:3000/api/auth/callback/github\`
4. Click "Register application"
5. Copy the Client ID
6. Generate a new Client Secret and copy it

Add to \`.env.local\`:

\`\`\`bash
GITHUB_ID=your-client-id
GITHUB_SECRET=your-client-secret
\`\`\`

#### Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth client ID
5. Configure consent screen if prompted
6. Choose "Web application"
7. Add authorized redirect URI: \`http://localhost:3000/api/auth/callback/google\`
8. Copy Client ID and Client Secret

Add to \`.env.local\`:

\`\`\`bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
\`\`\`

### Step 3: Test Authentication

1. Start the dev server: \`npm run dev\`
2. Visit: \`http://localhost:3000/api/auth/signin\`
3. Sign in with your configured provider
4. You should be redirected back to the home page

### Production Setup

When deploying to production:

1. Update \`NEXTAUTH_URL\` to your production domain
2. Update OAuth callback URLs in provider settings
3. Generate a new \`NEXTAUTH_SECRET\` for production`;
    } else if (this.config.auth === 'supabase') {
      content += `This project uses Supabase for authentication.

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose a name and database password
4. Wait for provisioning (2-3 minutes)

### Step 2: Get API Keys

1. Navigate to **Project Settings** > **API**
2. Copy the "Project URL"
3. Copy the "anon public" key

Add to \`.env.local\`:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### Step 3: Configure Authentication Providers

1. Go to **Authentication** > **Providers** in Supabase dashboard
2. Enable the providers you want (Email, Google, GitHub, etc.)
3. For OAuth providers, add their credentials

#### GitHub OAuth with Supabase

1. Create GitHub OAuth app (see GitHub OAuth section above)
2. In Supabase, go to Authentication > Providers > GitHub
3. Enable GitHub provider
4. Add your GitHub Client ID and Secret
5. Copy the Callback URL from Supabase
6. Add it to your GitHub OAuth app settings

### Step 4: Test Authentication

\`\`\`bash
npm run dev
# Visit http://localhost:3000
# Try signing up/in with configured providers
\`\`\``;
    } else if (this.config.auth === 'clerk') {
      content += `This project uses Clerk for authentication.

### Step 1: Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Click "Add Application"
3. Choose a name for your application
4. Select your authentication methods (Email, Google, GitHub, etc.)
5. Click "Create Application"

### Step 2: Get API Keys

1. In your Clerk dashboard, go to **API Keys**
2. Copy the "Publishable Key"
3. Copy the "Secret Key"

Add to \`.env.local\`:

\`\`\`bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key
CLERK_SECRET_KEY=sk_test_your-key
\`\`\`

### Step 3: Configure Authentication Methods

1. In Clerk dashboard, go to **User & Authentication** > **Social Connections**
2. Enable the OAuth providers you want (Google, GitHub, etc.)
3. Follow the setup instructions for each provider

### Step 4: Test Authentication

\`\`\`bash
npm run dev
# Visit http://localhost:3000
# Click sign in to test authentication
\`\`\`

### Customization

Clerk provides extensive customization options:
- Custom branding in **Customization** section
- Email templates in **Emails** section
- User profile fields in **User & Authentication** > **Email, Phone, Username**`;
    }

    return {
      title: 'Authentication Setup',
      order: 4,
      content,
      applicableWhen: () => this.hasAuth(),
    };
  }

  private getExternalServicesSetup(): DocumentationSection | null {
    if (!this.hasAuth() && !this.hasDatabase() && !this.hasAI()) {
      return null;
    }

    return {
      title: 'External Services',
      order: 5,
      content: `## External Services Summary

This project integrates with the following external services:

${this.hasAI() ? '- **Anthropic Claude**: AI functionality' : ''}
${this.hasAuth() ? `- **${this.getAuthDescription()}**: User authentication` : ''}
${this.hasDatabase() ? `- **${this.getDatabaseDescription()}**: Data storage` : ''}
${this.config.extras.redis ? '- **Redis**: Caching and session storage' : ''}

Make sure all required API keys and connection strings are added to your \`.env.local\` file.

### Security Best Practices

1. **Never commit** \`.env.local\` or \`.env\` files to version control
2. **Use different keys** for development and production
3. **Rotate keys regularly**, especially if they may have been exposed
4. **Limit API key permissions** to only what's needed
5. **Monitor usage** in service dashboards to detect unusual activity`,
      applicableWhen: () => this.hasAuth() || this.hasDatabase() || this.hasAI(),
    };
  }

  private getEnvironmentVariables(): DocumentationSection {
    return {
      title: 'Environment Variables',
      order: 6,
      content: `## Environment Variables Reference

All required environment variables are documented in \`.env.example\`.

### Required Variables

${this.getRequiredEnvVarsList()}

### Optional Variables

${this.getOptionalEnvVarsList()}

### Loading Environment Variables

- **Development**: Variables are loaded from \`.env.local\`
- **Production**: Set variables in your deployment platform's dashboard
- **Testing**: Use \`.env.test\` for test-specific variables

### Troubleshooting

If environment variables aren't loading:

1. Verify file name is exactly \`.env.local\` (not \`.env\`)
2. Restart the development server after changes
3. Check for syntax errors (no spaces around \`=\`)
4. Ensure file is in the project root directory`,
      applicableWhen: () => true,
    };
  }

  // ============================================================================
  // DEPLOYMENT.md Sections
  // ============================================================================

  private getDeploymentOverview(): DocumentationSection {
    return {
      title: 'Deployment Overview',
      order: 1,
      content: `# Deployment Guide

This guide covers deploying your application to: ${this.config.deployment.join(', ')}.

## Pre-Deployment Checklist

- [ ] All environment variables are documented
- [ ] Database is set up and accessible
- [ ] Authentication providers are configured
- [ ] API keys are ready for production
- [ ] Code is committed to a Git repository
- [ ] Build succeeds locally (\`npm run build\`)

## Environment Variables

Make sure to set all required environment variables in your deployment platform. See \`.env.example\` for the complete list.`,
      applicableWhen: () => true,
    };
  }

  private getDeploymentGuides(): DocumentationSection[] {
    const guides: DocumentationSection[] = [];

    if (this.config.deployment.includes('vercel')) {
      guides.push(this.getVercelDeploymentGuide());
    }

    if (this.config.deployment.includes('railway')) {
      guides.push(this.getRailwayDeploymentGuide());
    }

    if (this.config.deployment.includes('render')) {
      guides.push(this.getRenderDeploymentGuide());
    }

    if (this.config.deployment.includes('ec2')) {
      guides.push(this.getEC2DeploymentGuide());
    }

    return guides;
  }

  private getVercelDeploymentGuide(): DocumentationSection {
    return {
      title: 'Vercel Deployment',
      order: 2,
      content: `## Vercel Deployment

Vercel is the recommended platform for Next.js applications.

### Step 1: Prepare Your Repository

1. Push your code to GitHub, GitLab, or Bitbucket
2. Ensure \`.env.example\` is committed (but not \`.env.local\`)

### Step 2: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Select your Git provider and repository
4. Vercel will auto-detect Next.js configuration

### Step 3: Configure Environment Variables

1. In the import screen, click "Environment Variables"
2. Add all variables from your \`.env.local\`:
${this.getVercelEnvVarsList()}

### Step 4: Configure Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset**: Next.js
- **Build Command**: \`npm run build\`
- **Output Directory**: \`.next\`
- **Install Command**: \`npm install\`

${this.config.framework === 'monorepo' ? `
For monorepo:
- **Root Directory**: \`apps/web\`
- Enable "Include source files outside of the Root Directory"
` : ''}

### Step 5: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Visit your production URL

### Step 6: Update OAuth Callback URLs

${this.hasAuth() ? this.getOAuthCallbackInstructions('vercel') : 'If using OAuth, update callback URLs in your provider settings.'}

### Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to main/master branch
- **Preview**: Pull requests and other branches

### Custom Domain

1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update \`NEXTAUTH_URL\` if using NextAuth`,
      applicableWhen: () => this.config.deployment.includes('vercel'),
    };
  }

  private getRailwayDeploymentGuide(): DocumentationSection {
    return {
      title: 'Railway Deployment',
      order: 3,
      content: `## Railway Deployment

Railway provides easy deployment with built-in database support.

### Step 1: Create Railway Account

1. Go to [Railway](https://railway.app/)
2. Sign up with GitHub

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway will detect your framework

### Step 3: Add Database (if needed)

${this.hasDatabase() && this.config.database.includes('postgres') ? `
1. Click "New" > "Database" > "PostgreSQL"
2. Railway will create a database and set \`DATABASE_URL\`
3. The variable is automatically available to your app
` : 'If you need a database, Railway offers PostgreSQL, MySQL, MongoDB, and Redis.'}

### Step 4: Configure Environment Variables

1. Go to your service > Variables
2. Add all required variables:
${this.getRailwayEnvVarsList()}

### Step 5: Configure Build

Railway uses Nixpacks for automatic builds. If you need custom configuration, create \`railway.json\`:

\`\`\`json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
\`\`\`

### Step 6: Deploy

1. Railway automatically deploys on push
2. Monitor build logs in the dashboard
3. Once deployed, click "Open App" to view

### Step 7: Update OAuth Callbacks

${this.hasAuth() ? this.getOAuthCallbackInstructions('railway') : 'If using OAuth, update callback URLs with your Railway domain.'}

### Custom Domain

1. Go to Settings > Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Update environment variables with new domain`,
      applicableWhen: () => this.config.deployment.includes('railway'),
    };
  }

  private getRenderDeploymentGuide(): DocumentationSection {
    return {
      title: 'Render Deployment',
      order: 4,
      content: `## Render Deployment

Render offers free tier hosting for web services and databases.

### Step 1: Create Render Account

1. Go to [Render](https://render.com/)
2. Sign up with GitHub

### Step 2: Create Web Service

1. Click "New" > "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: Your app name
   - **Environment**: Node
   - **Build Command**: \`npm install && npm run build\`
   - **Start Command**: \`npm start\`

### Step 3: Add Database (if needed)

${this.hasDatabase() && this.config.database.includes('postgres') ? `
1. Click "New" > "PostgreSQL"
2. Choose a name and plan (free tier available)
3. Once created, copy the "Internal Database URL"
4. Add it as \`DATABASE_URL\` in your web service
` : 'Render offers PostgreSQL and Redis databases.'}

### Step 4: Configure Environment Variables

1. In your web service, go to "Environment"
2. Add all required variables:
${this.getRenderEnvVarsList()}

### Step 5: Deploy

1. Click "Create Web Service"
2. Render will build and deploy automatically
3. Monitor build logs for any errors
4. Once deployed, visit your app URL

### Step 6: Update OAuth Callbacks

${this.hasAuth() ? this.getOAuthCallbackInstructions('render') : 'If using OAuth, update callback URLs with your Render domain.'}

### Auto-Deploy

Render automatically deploys when you push to your main branch.

### Custom Domain

1. Go to Settings > Custom Domain
2. Add your domain
3. Configure DNS records
4. Update environment variables`,
      applicableWhen: () => this.config.deployment.includes('render'),
    };
  }

  private getEC2DeploymentGuide(): DocumentationSection {
    return {
      title: 'EC2 Deployment',
      order: 5,
      content: `## EC2 Deployment

Deploy to AWS EC2 for full control over your infrastructure.

**Note**: This project includes automated deployment scripts in the \`deploy/\` directory to simplify the setup process.

### Quick Start (Using Deployment Scripts)

1. **Launch EC2 Instance** (see detailed steps below)
2. **Connect to your instance**:
   \`\`\`bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   \`\`\`

3. **Copy deployment scripts to your instance**:
   \`\`\`bash
   # On your local machine
   scp -i your-key.pem -r deploy ubuntu@your-instance-ip:~/
   \`\`\`

4. **Run the setup script**:
   \`\`\`bash
   cd ~/deploy
   chmod +x setup.sh
   ./setup.sh
   \`\`\`

5. **Clone your repository** to \`/var/www/${this.config.projectName}\`

6. **Configure environment variables**:
   \`\`\`bash
   cd /var/www/${this.config.projectName}
   nano .env
   # Add all your environment variables
   \`\`\`

7. **Run the deployment script**:
   \`\`\`bash
   cd ~/deploy
   chmod +x deploy.sh
   ./deploy.sh
   \`\`\`

8. **Configure Nginx**:
   \`\`\`bash
   sudo cp nginx.conf /etc/nginx/sites-available/${this.config.projectName}
   sudo ln -s /etc/nginx/sites-available/${this.config.projectName} /etc/nginx/sites-enabled/
   # Edit the config to add your domain
   sudo nano /etc/nginx/sites-available/${this.config.projectName}
   sudo nginx -t
   sudo systemctl restart nginx
   \`\`\`

9. **Set up SSL** (recommended):
   \`\`\`bash
   sudo certbot --nginx -d your-domain.com
   \`\`\`

### Detailed Manual Setup

#### Step 1: Launch EC2 Instance

1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click "Launch Instance"
3. Choose Ubuntu Server 22.04 LTS
4. Select instance type (t2.micro for free tier, t2.small or larger recommended for production)
5. Configure security group:
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 80) from anywhere (0.0.0.0/0)
   - Allow HTTPS (port 443) from anywhere (0.0.0.0/0)
6. Create or select a key pair
7. Launch instance

#### Step 2: Connect to Instance

\`\`\`bash
ssh -i your-key.pem ubuntu@your-instance-ip
\`\`\`

#### Step 3: Install Dependencies

\`\`\`bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
\`\`\`

#### Step 4: Set Up Application Directory

\`\`\`bash
# Create application directory
sudo mkdir -p /var/www/${this.config.projectName}
sudo chown -R $USER:$USER /var/www/${this.config.projectName}

# Clone your repository
cd /var/www/${this.config.projectName}
git clone your-repo-url .

# Install dependencies
npm install

# Create .env file
nano .env
# Add all your environment variables (see .env.example)

# Build application
npm run build
\`\`\`

#### Step 5: Configure PM2

\`\`\`bash
# Start application with PM2
pm2 start npm --name "${this.config.projectName}" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs
\`\`\`

#### Step 6: Configure Nginx

The project includes a pre-configured nginx file at \`deploy/nginx.conf\`. Copy and customize it:

\`\`\`bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/${this.config.projectName}
sudo nano /etc/nginx/sites-available/${this.config.projectName}
# Update 'your-domain.com' with your actual domain
\`\`\`

Enable the site:

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/${this.config.projectName} /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

#### Step 7: Set Up SSL with Let's Encrypt

\`\`\`bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
\`\`\`

Follow the prompts to:
- Enter your email
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: yes)

#### Step 8: Configure Systemd Service (Alternative to PM2)

If you prefer systemd over PM2, use the included service file:

\`\`\`bash
sudo cp deploy/${this.config.projectName}.service /etc/systemd/system/
sudo nano /etc/systemd/system/${this.config.projectName}.service
# Update paths and environment variables as needed

sudo systemctl daemon-reload
sudo systemctl enable ${this.config.projectName}
sudo systemctl start ${this.config.projectName}
sudo systemctl status ${this.config.projectName}
\`\`\`

#### Step 9: Update OAuth Callbacks

${this.hasAuth() ? this.getOAuthCallbackInstructions('ec2') : 'If using OAuth, update callback URLs with your domain.'}

### Environment Variables for Production

Make sure to set production values for:

${this.getEC2EnvVarsList()}

### Deployment Updates

To deploy updates, use the included deployment script:

\`\`\`bash
cd ~/deploy
./deploy.sh
\`\`\`

Or manually:

\`\`\`bash
cd /var/www/${this.config.projectName}
git pull origin main
npm install
npm run build
pm2 restart ${this.config.projectName}
\`\`\`

### Monitoring and Logs

**PM2 Logs:**
\`\`\`bash
pm2 logs ${this.config.projectName}
pm2 monit
\`\`\`

**Nginx Logs:**
\`\`\`bash
sudo tail -f /var/log/nginx/${this.config.projectName}_access.log
sudo tail -f /var/log/nginx/${this.config.projectName}_error.log
\`\`\`

**Systemd Logs (if using systemd):**
\`\`\`bash
sudo journalctl -u ${this.config.projectName} -f
\`\`\`

### Troubleshooting

**Application won't start:**
- Check PM2 logs: \`pm2 logs ${this.config.projectName}\`
- Verify environment variables are set correctly
- Ensure the build completed successfully

**Nginx 502 Bad Gateway:**
- Check if the application is running: \`pm2 status\`
- Verify the port in nginx config matches your app
- Check nginx error logs

**SSL Certificate Issues:**
- Ensure your domain DNS points to the EC2 instance
- Verify ports 80 and 443 are open in security group
- Try running certbot again with \`--dry-run\` flag first`,
      applicableWhen: () => this.config.deployment.includes('ec2'),
    };
  }

  private getOAuthCallbackUpdates(): DocumentationSection | null {
    if (!this.hasAuth() || this.config.auth === 'none') {
      return null;
    }

    return {
      title: 'OAuth Callback URLs',
      order: 10,
      content: `## Updating OAuth Callback URLs

After deploying, you must update OAuth callback URLs in your provider settings.

${this.getOAuthCallbackInstructions('production')}

### Testing

After updating callback URLs:

1. Visit your production site
2. Try signing in with each OAuth provider
3. Verify you're redirected back correctly
4. Check that user data is saved properly`,
      applicableWhen: () => this.hasAuth(),
    };
  }

  // ============================================================================
  // Helper Methods for Content Generation
  // ============================================================================

  private getFrameworkDescription(): string {
    const descriptions: Record<string, string> = {
      next: 'Next.js 15 (App Router)',
      express: 'Express.js',
      monorepo: 'Monorepo (Next.js + Express)',
    };
    return descriptions[this.config.framework] || this.config.framework;
  }

  private getAuthDescription(): string {
    const descriptions: Record<string, string> = {
      none: 'None',
      nextauth: 'NextAuth.js',
      supabase: 'Supabase Auth',
      clerk: 'Clerk',
    };
    return descriptions[this.config.auth] || this.config.auth;
  }

  private getDatabaseDescription(): string {
    const descriptions: Record<string, string> = {
      none: 'None',
      'prisma-postgres': 'PostgreSQL with Prisma',
      'drizzle-postgres': 'PostgreSQL with Drizzle',
      supabase: 'Supabase (PostgreSQL)',
      mongodb: 'MongoDB',
    };
    return descriptions[this.config.database] || this.config.database;
  }

  private getStylingDescription(): string {
    const descriptions: Record<string, string> = {
      tailwind: `Tailwind CSS${this.config.shadcn ? ' + shadcn/ui' : ''}`,
      'css-modules': 'CSS Modules',
      'styled-components': 'Styled Components',
    };
    return descriptions[this.config.styling] || this.config.styling;
  }

  private getAITemplateDescription(): string {
    const descriptions: Record<string, string> = {
      chatbot: 'AI Chatbot',
      'document-analyzer': 'Document Analyzer',
      'semantic-search': 'Semantic Search',
      'code-assistant': 'Code Assistant',
      'image-generator': 'Image Generator',
    };
    return descriptions[this.config.aiTemplate || 'none'] || 'AI Features';
  }

  private getAIFeatureRoute(): string {
    const routes: Record<string, string> = {
      chatbot: 'http://localhost:3000/chat',
      'document-analyzer': 'http://localhost:3000/analyze',
      'semantic-search': 'http://localhost:3000/search',
      'code-assistant': 'http://localhost:3000/code-assistant',
      'image-generator': 'http://localhost:3000/generate-image',
    };
    return routes[this.config.aiTemplate || 'none'] || 'http://localhost:3000';
  }

  private getAIProviderInfo(provider: string): {
    displayName: string;
    setupUrl: string;
    pricingUrl: string;
    envVarName: string;
    keyPrefix?: string;
  } {
    const providers: Record<string, any> = {
      anthropic: {
        displayName: 'Anthropic Claude',
        setupUrl: 'https://console.anthropic.com/',
        pricingUrl: 'https://www.anthropic.com/pricing',
        envVarName: 'ANTHROPIC_API_KEY',
        keyPrefix: 'sk-ant-',
      },
      openai: {
        displayName: 'OpenAI',
        setupUrl: 'https://platform.openai.com/',
        pricingUrl: 'https://openai.com/pricing',
        envVarName: 'OPENAI_API_KEY',
        keyPrefix: 'sk-',
      },
      'aws-bedrock': {
        displayName: 'AWS Bedrock',
        setupUrl: 'https://aws.amazon.com/bedrock/',
        pricingUrl: 'https://aws.amazon.com/bedrock/pricing/',
        envVarName: 'AWS_BEDROCK_CREDENTIALS',
      },
      gemini: {
        displayName: 'Google Gemini',
        setupUrl: 'https://ai.google.dev/',
        pricingUrl: 'https://ai.google.dev/pricing',
        envVarName: 'GEMINI_API_KEY',
      },
    };
    return providers[provider] || providers.anthropic;
  }

  private getAITemplateFeatures(): string {
    const features: Record<string, string[]> = {
      chatbot: [
        'Real-time streaming responses',
        'Conversation history',
        'Markdown rendering',
        'Copy code blocks',
      ],
      'document-analyzer': [
        'File upload support',
        'Text extraction',
        'AI-powered analysis',
        'Summary generation',
      ],
      'semantic-search': [
        'Vector embeddings',
        'Semantic similarity',
        'Intelligent ranking',
        'Context-aware results',
      ],
      'code-assistant': [
        'Code generation',
        'Code explanation',
        'Syntax highlighting',
        'Multiple languages',
      ],
      'image-generator': [
        'Text-to-image generation',
        'Style customization',
        'Image preview',
        'Download support',
      ],
    };
    const templateFeatures = features[this.config.aiTemplate || 'none'] || [];
    return templateFeatures.map((f) => `- ${f}`).join('\n');
  }

  private getAITemplateFiles(): string {
    const files: Record<string, { apiRoutes: string[]; pages: string[] }> = {
      chatbot: {
        apiRoutes: ['src/app/api/chat/route.ts'],
        pages: ['src/app/chat/page.tsx'],
      },
      'document-analyzer': {
        apiRoutes: ['src/app/api/analyze/route.ts'],
        pages: ['src/app/analyze/page.tsx'],
      },
      'semantic-search': {
        apiRoutes: ['src/app/api/search/route.ts'],
        pages: ['src/app/search/page.tsx'],
      },
      'code-assistant': {
        apiRoutes: ['src/app/api/code-assistant/route.ts'],
        pages: ['src/app/code-assistant/page.tsx'],
      },
      'image-generator': {
        apiRoutes: ['src/app/api/generate-image/route.ts'],
        pages: ['src/app/generate-image/page.tsx'],
      },
    };
    const templateFiles = files[this.config.aiTemplate || 'none'];
    if (!templateFiles) return '- No files generated';

    const sections: string[] = [];
    sections.push('**API Routes:**');
    templateFiles.apiRoutes.forEach((route) => sections.push(`- \`${route}\``));
    sections.push('');
    sections.push('**Pages:**');
    templateFiles.pages.forEach((page) => sections.push(`- \`${page}\``));

    return sections.join('\n');
  }

  private getDatabaseEnvVars(): string {
    if (this.config.database === 'supabase') {
      return `# Get from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`;
    } else if (
      this.config.database === 'prisma-postgres' ||
      this.config.database === 'drizzle-postgres'
    ) {
      return `# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
# Local: postgresql://postgres:postgres@localhost:5432/${this.config.projectName}
# Production: Get from your hosting provider
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${this.config.projectName}`;
    } else if (this.config.database === 'mongodb') {
      return `# MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database
# Local: mongodb://localhost:27017/${this.config.projectName}
DATABASE_URL=mongodb://localhost:27017/${this.config.projectName}`;
    }
    return '';
  }

  private getAuthEnvVars(): string {
    if (this.config.auth === 'nextauth') {
      return `# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
# GitHub: https://github.com/settings/developers
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Google: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret`;
    } else if (this.config.auth === 'supabase') {
      return `# Get from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`;
    } else if (this.config.auth === 'clerk') {
      return `# Get from: https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key
CLERK_SECRET_KEY=sk_test_your-key`;
    }
    return '';
  }

  private getRequiredEnvVarsList(): string {
    const vars: string[] = [];

    if (this.hasDatabase()) {
      vars.push('- `DATABASE_URL` or Supabase keys - Database connection');
    }

    if (this.hasAuth()) {
      if (this.config.auth === 'nextauth') {
        vars.push('- `NEXTAUTH_SECRET` - Authentication secret');
        vars.push('- `NEXTAUTH_URL` - Application URL');
      } else if (this.config.auth === 'clerk') {
        vars.push('- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key');
        vars.push('- `CLERK_SECRET_KEY` - Clerk secret key');
      }
    }

    if (this.hasAI()) {
      vars.push('- `ANTHROPIC_API_KEY` - AI functionality');
    }

    return vars.length > 0 ? vars.join('\n') : '- None';
  }

  private getOptionalEnvVarsList(): string {
    const vars: string[] = [];

    if (this.config.extras.redis) {
      vars.push('- `REDIS_URL` - Redis connection for caching');
    }

    if (this.hasAuth() && this.config.auth === 'nextauth') {
      vars.push('- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth');
    }

    return vars.length > 0 ? vars.join('\n') : '- None';
  }

  private getVercelEnvVarsList(): string {
    const vars: string[] = [];

    if (this.hasDatabase()) {
      vars.push('   - `DATABASE_URL`');
    }

    if (this.hasAuth()) {
      if (this.config.auth === 'nextauth') {
        vars.push('   - `NEXTAUTH_SECRET`');
        vars.push('   - `NEXTAUTH_URL` (set to your Vercel domain)');
        vars.push('   - `GITHUB_ID` / `GITHUB_SECRET`');
      } else if (this.config.auth === 'clerk') {
        vars.push('   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`');
        vars.push('   - `CLERK_SECRET_KEY`');
      } else if (this.config.auth === 'supabase') {
        vars.push('   - `NEXT_PUBLIC_SUPABASE_URL`');
        vars.push('   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`');
      }
    }

    if (this.hasAI()) {
      vars.push('   - `ANTHROPIC_API_KEY`');
    }

    return vars.join('\n');
  }

  private getRailwayEnvVarsList(): string {
    return this.getVercelEnvVarsList();
  }

  private getRenderEnvVarsList(): string {
    return this.getVercelEnvVarsList();
  }

  private getOAuthCallbackInstructions(platform: string): string {
    if (this.config.auth === 'nextauth') {
      const domain =
        platform === 'vercel'
          ? 'your-app.vercel.app'
          : platform === 'railway'
            ? 'your-app.up.railway.app'
            : platform === 'render'
              ? 'your-app.onrender.com'
              : 'your-domain.com';

      return `For NextAuth with GitHub:

1. Go to your GitHub OAuth App settings
2. Update the callback URL to: \`https://${domain}/api/auth/callback/github\`
3. Update \`NEXTAUTH_URL\` environment variable to: \`https://${domain}\`

For Google OAuth:

1. Go to Google Cloud Console > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add authorized redirect URI: \`https://${domain}/api/auth/callback/google\``;
    } else if (this.config.auth === 'clerk') {
      return `Clerk automatically handles callback URLs. Just update your environment variables with the production domain.`;
    } else if (this.config.auth === 'supabase') {
      return `For Supabase Auth:

1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add your production URL to "Site URL"
3. Add redirect URLs if using OAuth providers`;
    }

    return '';
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Generate a badge showing the technology stack
   */
  private generateTechStackBadge(): string {
    const technologies: string[] = [];

    // Framework
    if (this.config.framework === 'next' || this.config.framework === 'monorepo') {
      technologies.push('Next.js');
    }
    if (this.config.framework === 'express' || this.config.framework === 'monorepo') {
      technologies.push('Express');
    }

    // Styling
    if (this.config.styling === 'tailwind') {
      technologies.push('Tailwind');
    }
    if (this.config.shadcn) {
      technologies.push('shadcn/ui');
    }

    // Auth
    if (this.config.auth !== 'none') {
      if (this.config.auth === 'nextauth') {
        technologies.push('NextAuth');
      } else if (this.config.auth === 'clerk') {
        technologies.push('Clerk');
      } else if (this.config.auth === 'supabase') {
        technologies.push('Supabase Auth');
      }
    }

    // Database
    if (this.config.database !== 'none') {
      if (this.config.database === 'prisma-postgres') {
        technologies.push('Prisma');
      } else if (this.config.database === 'drizzle-postgres') {
        technologies.push('Drizzle');
      } else if (this.config.database === 'supabase') {
        technologies.push('Supabase');
      } else if (this.config.database === 'mongodb') {
        technologies.push('MongoDB');
      }
    }

    // AI
    if (this.hasAI()) {
      technologies.push('AI-Powered');
    }

    // Create badge markdown
    const badges = technologies.map(tech => {
      const label = tech.replace(/\s+/g, '%20');
      const color = this.getBadgeColor(tech);
      return `![${tech}](https://img.shields.io/badge/${label}-${color}?style=flat-square)`;
    });

    return badges.join(' ');
  }

  /**
   * Get badge color based on technology
   */
  private getBadgeColor(tech: string): string {
    const colorMap: Record<string, string> = {
      'Next.js': '000000',
      'Express': '000000',
      'Tailwind': '06B6D4',
      'shadcn/ui': '000000',
      'NextAuth': '000000',
      'Clerk': '6C47FF',
      'Supabase Auth': '3ECF8E',
      'Supabase': '3ECF8E',
      'Prisma': '2D3748',
      'Drizzle': 'C5F74F',
      'MongoDB': '47A248',
      'AI-Powered': '8B5CF6',
    };
    return colorMap[tech] || 'gray';
  }

  private getEC2EnvVarsList(): string {
    const vars: string[] = [];

    vars.push('- `NODE_ENV=production`');

    if (this.hasDatabase()) {
      if (this.config.database === 'supabase') {
        vars.push('- `NEXT_PUBLIC_SUPABASE_URL`');
        vars.push('- `NEXT_PUBLIC_SUPABASE_ANON_KEY`');
        vars.push('- `SUPABASE_SERVICE_ROLE_KEY`');
      } else {
        vars.push('- `DATABASE_URL` (your production database connection string)');
      }
    }

    if (this.hasAuth()) {
      if (this.config.auth === 'nextauth') {
        vars.push('- `NEXTAUTH_SECRET` (generate a new one for production)');
        vars.push('- `NEXTAUTH_URL=https://your-domain.com`');
        vars.push('- OAuth provider credentials (GITHUB_ID, GITHUB_SECRET, etc.)');
      } else if (this.config.auth === 'clerk') {
        vars.push('- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`');
        vars.push('- `CLERK_SECRET_KEY`');
      } else if (this.config.auth === 'supabase') {
        vars.push('- `NEXT_PUBLIC_SUPABASE_URL`');
        vars.push('- `NEXT_PUBLIC_SUPABASE_ANON_KEY`');
      }
    }

    if (this.hasAI()) {
      vars.push('- `ANTHROPIC_API_KEY`');
    }

    if (this.config.extras.redis) {
      vars.push('- `REDIS_URL`');
    }

    return vars.join('\n');
  }
}
