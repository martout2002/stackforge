/**
 * Git Operations Service
 * Handles low-level git operations via GitHub API
 */

import { ScaffoldConfig } from '@/types';

export interface GeneratedFile {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
}

export interface GitAuthor {
  name: string;
  email: string;
}

export interface GitTree {
  sha: string;
  url: string;
}

export interface GitBlob {
  sha: string;
  url: string;
}

export interface GitCommit {
  sha: string;
  url: string;
  message: string;
  author: GitAuthor;
}

export interface GitReference {
  ref: string;
  url: string;
  object: {
    sha: string;
    type: string;
  };
}

export class GitOperationsService {
  private accessToken: string;
  private owner: string;
  private repo: string;

  constructor(accessToken: string, owner: string, repo: string) {
    this.accessToken = accessToken;
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Generate a descriptive initial commit message based on the scaffold configuration
   */
  static generateCommitMessage(config: ScaffoldConfig): string {
    const technologies: string[] = [];
    const features: string[] = [];

    // Framework
    if (config.frontendFramework === 'nextjs') {
      technologies.push('Next.js 15');
    } else if (config.frontendFramework === 'react') {
      technologies.push('React');
    } else if (config.frontendFramework === 'vue') {
      technologies.push('Vue');
    } else if (config.frontendFramework === 'angular') {
      technologies.push('Angular');
    } else if (config.frontendFramework === 'svelte') {
      technologies.push('Svelte');
    }
    
    if (config.backendFramework === 'express') {
      technologies.push('Express.js');
    } else if (config.backendFramework === 'fastify') {
      technologies.push('Fastify');
    } else if (config.backendFramework === 'nestjs') {
      technologies.push('NestJS');
    }
    
    if (config.projectStructure === 'fullstack-monorepo') {
      features.push('Turborepo monorepo structure');
    }

    // Styling
    if (config.styling === 'tailwind') {
      technologies.push('Tailwind CSS');
      if (config.shadcn) {
        technologies.push('shadcn/ui');
      }
    } else if (config.styling === 'styled-components') {
      technologies.push('Styled Components');
    } else if (config.styling === 'css-modules') {
      technologies.push('CSS Modules');
    }

    // Authentication
    if (config.auth !== 'none') {
      if (config.auth === 'nextauth') {
        technologies.push('NextAuth.js');
        features.push('OAuth authentication');
      } else if (config.auth === 'clerk') {
        technologies.push('Clerk');
        features.push('User authentication');
      } else if (config.auth === 'supabase') {
        technologies.push('Supabase Auth');
        features.push('User authentication');
      }
    }

    // Database
    if (config.database !== 'none') {
      if (config.database === 'prisma-postgres') {
        technologies.push('Prisma');
        technologies.push('PostgreSQL');
        features.push('Database integration');
      } else if (config.database === 'drizzle-postgres') {
        technologies.push('Drizzle ORM');
        technologies.push('PostgreSQL');
        features.push('Database integration');
      } else if (config.database === 'supabase') {
        technologies.push('Supabase');
        features.push('Database integration');
      } else if (config.database === 'mongodb') {
        technologies.push('MongoDB');
        features.push('Database integration');
      }
    }

    // API Layer
    if (config.api) {
      if (config.api === 'trpc') {
        technologies.push('tRPC');
        features.push('Type-safe API');
      } else if (config.api === 'graphql') {
        technologies.push('GraphQL');
        features.push('GraphQL API');
      } else if (config.api === 'rest-axios') {
        technologies.push('Axios');
        features.push('REST API');
      } else if (config.api === 'rest-fetch') {
        features.push('REST API');
      }
    }

    // AI Template
    if (config.aiTemplate && config.aiTemplate !== 'none') {
      technologies.push('Anthropic Claude');
      if (config.aiTemplate === 'chatbot') {
        features.push('AI chatbot');
      } else if (config.aiTemplate === 'document-analyzer') {
        features.push('AI document analyzer');
      } else if (config.aiTemplate === 'semantic-search') {
        features.push('AI semantic search');
      } else if (config.aiTemplate === 'code-assistant') {
        features.push('AI code assistant');
      } else if (config.aiTemplate === 'image-generator') {
        features.push('AI image generator');
      }
    }

    // Extras
    if (config.extras.docker) {
      features.push('Docker configuration');
    }
    if (config.extras.githubActions) {
      features.push('CI/CD pipeline');
    }
    if (config.extras.redis) {
      technologies.push('Redis');
      features.push('Caching layer');
    }

    // Deployment
    if (config.deployment.length > 0) {
      const platforms = config.deployment.map(p => {
        if (p === 'vercel') return 'Vercel';
        if (p === 'railway') return 'Railway';
        if (p === 'render') return 'Render';
        if (p === 'ec2') return 'AWS EC2';
        return p;
      });
      features.push(`Deployment configs for ${platforms.join(', ')}`);
    }

    // Build commit message
    const title = `🚀 Initial commit - Generated by StackForge`;
    
    const techStack = technologies.length > 0 
      ? `\n\n## Tech Stack\n${technologies.map(t => `- ${t}`).join('\n')}`
      : '';
    
    const keyFeatures = features.length > 0
      ? `\n\n## Key Features\n${features.map(f => `- ${f}`).join('\n')}`
      : '';

    const footer = `\n\n---\n\nThis project was scaffolded using [StackForge](https://stackforge.dev), an AI-powered full-stack generator.\n\nColor scheme: ${config.colorScheme}\nProject: ${config.projectName}`;

    return `${title}${techStack}${keyFeatures}${footer}`;
  }

  /**
   * Create initial commit with all files
   * This is the main method that orchestrates the entire push process
   * Uses GitHub Contents API for empty repositories
   */
  async createInitialCommit(
    files: GeneratedFile[],
    author: GitAuthor,
    commitMessage: string = 'Initial commit from StackForge'
  ): Promise<string> {
    try {
      // For empty repositories, we need to create at least one file using the Contents API
      // Then we can use the Git API for the rest
      
      if (files.length === 0) {
        throw new Error('No files to commit');
      }

      // Step 1: Create the first file using Contents API (works on empty repos)
      const firstFile = files[0]!;
      await this.createFileViaContentsAPI(
        firstFile.path,
        firstFile.content,
        'Initial commit',
        author
      );

      // Step 2: If there are more files, add them using the Git API
      if (files.length > 1) {
        const remainingFiles = files.slice(1);
        
        // Get the current main branch reference
        const mainRef = await this.getReference('heads/main');
        if (!mainRef) {
          throw new Error('Main branch not found after initial file creation');
        }

        // Get the current commit
        const currentCommit = await this.getCommit(mainRef.object.sha);
        
        // Create blobs for remaining files
        const treeItems = await this.createBlobsForFiles(remainingFiles);
        
        // Create a new tree based on the current tree
        const newTree = await this.createTree(treeItems, currentCommit.tree.sha);
        
        // Create a new commit
        const newCommit = await this.createCommit(
          newTree.sha,
          commitMessage,
          author,
          [mainRef.object.sha]
        );
        
        // Update the main branch
        await this.updateReference('heads/main', newCommit.sha);
        
        return newCommit.sha;
      }

      // If only one file, get its commit SHA
      const mainRef = await this.getReference('heads/main');
      return mainRef?.object.sha || '';
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create initial commit: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Create a file using GitHub Contents API (works on empty repositories)
   */
  private async createFileViaContentsAPI(
    path: string,
    content: string,
    message: string,
    author: GitAuthor
  ): Promise<void> {
    const response = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          content: Buffer.from(content).toString('base64'),
          author: {
            name: author.name,
            email: author.email,
          },
          committer: {
            name: author.name,
            email: author.email,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Failed to create file via Contents API: ${error.message || response.statusText}`);
    }
  }

  /**
   * Get a commit by SHA
   */
  private async getCommit(sha: string): Promise<{ tree: { sha: string } }> {
    const response = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/commits/${sha}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Failed to get commit: ${error.message || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Create blobs for all files and return tree items
   */
  private async createBlobsForFiles(
    files: GeneratedFile[]
  ): Promise<Array<{ path: string; mode: string; type: string; sha: string }>> {
    const treeItems = [];

    for (const file of files) {
      const blob = await this.createBlob(file.content, file.encoding || 'utf-8');
      treeItems.push({
        path: file.path,
        mode: '100644', // Regular file
        type: 'blob',
        sha: blob.sha,
      });
    }

    return treeItems;
  }



  /**
   * Create a blob (file content) in the repository
   */
  async createBlob(content: string, encoding: 'utf-8' | 'base64' = 'utf-8'): Promise<GitBlob> {
    const response = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/blobs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          encoding: encoding,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      // GitHub returns "Git Repository is empty" for new repos - this is expected
      // We'll handle this by using inline content in the tree instead
      throw new Error(`Failed to create blob: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      sha: data.sha,
      url: data.url,
    };
  }

  /**
   * Create a tree (directory structure) in the repository
   * Supports both blob references (sha) and inline content
   */
  async createTree(
    tree: Array<{ path: string; mode: string; type: string; sha?: string; content?: string }>,
    baseTree?: string
  ): Promise<GitTree> {
    const response = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/trees`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tree: tree,
          base_tree: baseTree,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Failed to create tree: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      sha: data.sha,
      url: data.url,
    };
  }

  /**
   * Create a commit in the repository
   */
  async createCommit(
    treeSha: string,
    message: string,
    author: GitAuthor,
    parents: string[] = []
  ): Promise<GitCommit> {
    const response = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/commits`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          tree: treeSha,
          parents: parents,
          author: {
            name: author.name,
            email: author.email,
            date: new Date().toISOString(),
          },
          committer: {
            name: author.name,
            email: author.email,
            date: new Date().toISOString(),
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Failed to create commit: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      sha: data.sha,
      url: data.url,
      message: data.message,
      author: {
        name: data.author.name,
        email: data.author.email,
      },
    };
  }

  /**
   * Update a reference (branch) to point to a new commit
   */
  async updateReference(ref: string, sha: string, force: boolean = false): Promise<GitReference> {
    const response = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs/${ref}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sha: sha,
          force: force,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Failed to update reference: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      ref: data.ref,
      url: data.url,
      object: {
        sha: data.object.sha,
        type: data.object.type,
      },
    };
  }

  /**
   * Create a new reference (branch)
   */
  async createReference(ref: string, sha: string): Promise<GitReference> {
    // Ensure ref has proper format
    const formattedRef = ref.startsWith('refs/') ? ref : `refs/${ref}`;

    const response = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: formattedRef,
          sha: sha,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Failed to create reference: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      ref: data.ref,
      url: data.url,
      object: {
        sha: data.object.sha,
        type: data.object.type,
      },
    };
  }

  /**
   * Get a reference (branch) information
   */
  async getReference(ref: string): Promise<GitReference | null> {
    const response = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs/${ref}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Failed to get reference: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      ref: data.ref,
      url: data.url,
      object: {
        sha: data.object.sha,
        type: data.object.type,
      },
    };
  }

  /**
   * Create a branch from an existing commit
   */
  async createBranch(branchName: string, fromSha: string): Promise<GitReference> {
    return await this.createReference(`heads/${branchName}`, fromSha);
  }

  /**
   * Push files to an existing branch
   * This creates a new commit on top of the existing branch
   */
  async pushToExistingBranch(
    files: GeneratedFile[],
    author: GitAuthor,
    commitMessage: string,
    branchName: string = 'main'
  ): Promise<string> {
    try {
      // Get current branch reference
      const ref = await this.getReference(`heads/${branchName}`);
      if (!ref) {
        throw new Error(`Branch ${branchName} does not exist`);
      }

      // Create blobs for all files
      const treeItems = await this.createBlobsForFiles(files);

      // Create a tree with all files
      const tree = await this.createTree(treeItems);

      // Create a commit with the current branch as parent
      const commit = await this.createCommit(
        tree.sha,
        commitMessage,
        author,
        [ref.object.sha]
      );

      // Update the branch reference
      await this.updateReference(`heads/${branchName}`, commit.sha);

      return commit.sha;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to push to branch: ${error.message}`);
      }
      throw error;
    }
  }
}
