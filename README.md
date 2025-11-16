# StackForge

> **Your AI-powered full-stack scaffold generator**

StackForge is a modern web application that generates production-ready full-stack project scaffolds with best practices baked in. Configure your tech stack through an intuitive UI, and get a complete, working codebase in seconds.

## 🎯 What is StackForge?

StackForge eliminates the tedious setup phase of starting new projects. Instead of spending hours configuring build tools, setting up authentication, connecting databases, and wiring up APIs, you can:

1. **Configure** your stack through a visual interface
2. **Generate** a complete, production-ready scaffold
3. **Deploy** directly to GitHub or download as a ZIP
4. **Start building** your actual features immediately

## ✨ Features

### Current Capabilities

- **Framework Support**: Next.js 15, Express, or Full-stack Monorepo
- **Authentication**: NextAuth.js, Clerk, or Supabase Auth
- **Databases**: PostgreSQL (Prisma/Drizzle), MongoDB, or Supabase
- **API Layers**: REST (fetch/axios), tRPC, or GraphQL
- **Styling**: Tailwind CSS, CSS Modules, or Styled Components
- **AI Templates**: 5 production-ready AI features with full implementations:
  - **AI Chatbot**: Real-time streaming conversations with markdown support
  - **Document Analyzer**: Upload and analyze documents with AI
  - **Semantic Search**: Vector embeddings and intelligent search
  - **Code Assistant**: AI-powered code generation and explanation
  - **Image Generator**: Text-to-image generation
- **AI Providers**: Support for Anthropic Claude, OpenAI, AWS Bedrock, and Google Gemini
- **GitHub Integration**: Create and push repositories directly from the UI
- **Deployment Configs**: Vercel, Railway, Render, or AWS EC2
- **Extras**: Docker, Redis, Prettier, shadcn/ui components

### What Makes It Special

- **Real-time Validation**: Instant feedback on configuration conflicts
- **Smart Defaults**: Opinionated choices that work well together
- **Complete Documentation**: Every generated project includes comprehensive README, SETUP, and DEPLOYMENT guides
- **Security First**: Environment variable templates, .gitignore, and security best practices included
- **Production Ready**: Not just boilerplate - actual working code with proper error handling

## 🚀 Vision

StackForge aims to become the **go-to tool for developers starting new projects**. The vision includes:

### Short-term Goals
- [ ] More framework options (SvelteKit, Remix, Astro)
- [ ] Additional database support (Supabase Realtime, Firebase)
- [ ] More AI templates (RAG systems, AI agents, voice interfaces)
- [ ] Testing setup (Jest, Vitest, Playwright)
- [ ] CI/CD pipeline generation (GitHub Actions, GitLab CI)
- [ ] API documentation generation (OpenAPI/Swagger)

### Long-term Vision
- [ ] **Team Collaboration**: Share and reuse custom templates within teams
- [ ] **Plugin System**: Community-contributed templates and integrations
- [ ] **AI-Powered Customization**: Describe your project in natural language, get a tailored scaffold
- [ ] **Live Preview**: See your generated app running before downloading
- [ ] **Migration Tools**: Upgrade existing projects with new features
- [ ] **Marketplace**: Browse and install pre-built feature modules
- [ ] **Version Control**: Track scaffold versions and update existing projects

## 🛠️ Tech Stack

StackForge is built with the same modern stack it generates:

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **State Management**: Zustand
- **Validation**: Custom validation engine
- **GitHub API**: Octokit for repository operations
- **Deployment**: Vercel

## 🏃 Getting Started

### Prerequisites

- Node.js 20 or higher
- Bun (recommended) or npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/stackforge.git
cd stackforge

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Add your GitHub OAuth credentials (see SETUP.md)

# Run the development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to start configuring your first scaffold.

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup instructions for GitHub OAuth
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guidelines for contributing
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and architecture decisions

## 🤝 Contributing

StackForge is open to contributions! Whether you want to:

- Add support for a new framework or library
- Create new AI templates
- Improve documentation
- Fix bugs or add features
- Share feedback and ideas

Check out [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 🎨 Project Structure

```
stackforge/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   ├── configure/         # Main configuration page
│   │   └── demos/             # Demo pages
│   ├── components/            # React components
│   ├── lib/
│   │   ├── generator/         # Scaffold generation engine
│   │   ├── github/            # GitHub API integration
│   │   ├── validation/        # Configuration validation
│   │   └── store/             # State management
│   └── types/                 # TypeScript types
├── .kiro/                     # Kiro AI specs and steering
└── public/                    # Static assets
```

## 🔒 Security

- Never commit `.env.local` files
- GitHub OAuth tokens are stored securely in HTTP-only cookies
- Rate limiting on repository creation (5 per hour per user)
- Input validation on all user-provided data
- Generated projects include security best practices

## 📝 License

[MIT License](./LICENSE) - feel free to use StackForge for personal or commercial projects.

## 🙏 Acknowledgments

Built with inspiration from:
- [create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app)
- [create-t3-app](https://create.t3.gg/)
- [Vercel's templates](https://vercel.com/templates)

## 💬 Community & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/stackforge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/stackforge/discussions)
- **Twitter**: [@stackforge](https://twitter.com/stackforge) (coming soon)

---

**Made with ❤️ by developers, for developers**

*Stop configuring, start building.*
