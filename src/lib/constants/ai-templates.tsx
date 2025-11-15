import {
  MessageSquare,
  FileText,
  Search,
  Code,
  Image,
  type LucideIcon,
} from 'lucide-react';

/**
 * AI Provider Configuration
 */
export type AIProvider = 'anthropic' | 'openai' | 'aws-bedrock' | 'gemini';

export interface AIProviderMetadata {
  id: AIProvider;
  name: string;
  displayName: string;
  apiKeyName: string;
  description: string;
  models?: string[];
  setupUrl: string;
}

/**
 * AI Template Metadata Interface
 * Defines the structure for each AI template configuration
 */
export interface AITemplateMetadata {
  id: 'chatbot' | 'document-analyzer' | 'semantic-search' | 'code-assistant' | 'image-generator';
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  generatedFiles: {
    apiRoutes: string[];
    pages: string[];
    components?: string[];
  };
  requiresFramework: ('next' | 'monorepo')[];
  supportedProviders: AIProvider[];
}

/**
 * AI Provider Configurations
 * Contains metadata for all supported AI providers
 */
export const AI_PROVIDERS: Record<AIProvider, AIProviderMetadata> = {
  anthropic: {
    id: 'anthropic',
    name: 'anthropic',
    displayName: 'Anthropic Claude',
    apiKeyName: 'ANTHROPIC_API_KEY',
    description: 'Claude 3.5 Sonnet and other Claude models',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    setupUrl: 'https://console.anthropic.com/',
  },
  openai: {
    id: 'openai',
    name: 'openai',
    displayName: 'OpenAI',
    apiKeyName: 'OPENAI_API_KEY',
    description: 'GPT-4, GPT-4 Turbo, and GPT-3.5 models',
    models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    setupUrl: 'https://platform.openai.com/',
  },
  'aws-bedrock': {
    id: 'aws-bedrock',
    name: 'aws-bedrock',
    displayName: 'AWS Bedrock',
    apiKeyName: 'AWS_BEDROCK_CREDENTIALS',
    description: 'Access to multiple models including Claude, Llama, Titan, and more',
    models: [
      'anthropic.claude-3-5-sonnet-20241022-v2:0',
      'anthropic.claude-3-opus-20240229-v1:0',
      'meta.llama3-70b-instruct-v1:0',
      'amazon.titan-text-premier-v1:0',
      'mistral.mistral-large-2402-v1:0',
    ],
    setupUrl: 'https://aws.amazon.com/bedrock/',
  },
  gemini: {
    id: 'gemini',
    name: 'gemini',
    displayName: 'Google Gemini',
    apiKeyName: 'GEMINI_API_KEY',
    description: 'Gemini Pro and Gemini Ultra models',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
    setupUrl: 'https://ai.google.dev/',
  },
};

/**
 * AI Templates Constant
 * Contains all available AI template configurations with metadata
 * 
 * Requirements:
 * - 1.1: Display AI Features section in configuration wizard
 * - 2.1: Display card for each available AI template
 * - 2.2: Include title, icon, and description for each template
 * - 2.3: Indicate AI provider support (multiple providers)
 */
export const AI_TEMPLATES: Record<string, AITemplateMetadata> = {
  chatbot: {
    id: 'chatbot',
    title: 'AI Chatbot',
    description: 'Conversational AI interface with streaming responses',
    icon: MessageSquare,
    features: [
      'Real-time streaming responses',
      'Conversation history',
      'Markdown rendering',
      'Copy code blocks',
    ],
    generatedFiles: {
      apiRoutes: ['src/app/api/chat/route.ts'],
      pages: ['src/app/chat/page.tsx'],
    },
    requiresFramework: ['next', 'monorepo'],
    supportedProviders: ['anthropic', 'openai', 'aws-bedrock', 'gemini'],
  },
  'document-analyzer': {
    id: 'document-analyzer',
    title: 'Document Analyzer',
    description: 'Upload and analyze documents with AI',
    icon: FileText,
    features: [
      'File upload support',
      'Text extraction',
      'AI-powered analysis',
      'Summary generation',
    ],
    generatedFiles: {
      apiRoutes: ['src/app/api/analyze/route.ts'],
      pages: ['src/app/analyze/page.tsx'],
    },
    requiresFramework: ['next', 'monorepo'],
    supportedProviders: ['anthropic', 'openai', 'aws-bedrock', 'gemini'],
  },
  'semantic-search': {
    id: 'semantic-search',
    title: 'Semantic Search',
    description: 'AI-powered search with embeddings',
    icon: Search,
    features: [
      'Vector embeddings',
      'Semantic similarity',
      'Intelligent ranking',
      'Context-aware results',
    ],
    generatedFiles: {
      apiRoutes: ['src/app/api/search/route.ts'],
      pages: ['src/app/search/page.tsx'],
    },
    requiresFramework: ['next', 'monorepo'],
    supportedProviders: ['anthropic', 'openai', 'aws-bedrock', 'gemini'],
  },
  'code-assistant': {
    id: 'code-assistant',
    title: 'Code Assistant',
    description: 'AI-powered code generation and explanation',
    icon: Code,
    features: [
      'Code generation',
      'Code explanation',
      'Syntax highlighting',
      'Multiple languages',
    ],
    generatedFiles: {
      apiRoutes: ['src/app/api/code-assistant/route.ts'],
      pages: ['src/app/code-assistant/page.tsx'],
    },
    requiresFramework: ['next', 'monorepo'],
    supportedProviders: ['anthropic', 'openai', 'aws-bedrock', 'gemini'],
  },
  'image-generator': {
    id: 'image-generator',
    title: 'Image Generator',
    description: 'Generate images from text descriptions',
    icon: Image,
    features: [
      'Text-to-image generation',
      'Style customization',
      'Image preview',
      'Download support',
    ],
    generatedFiles: {
      apiRoutes: ['src/app/api/generate-image/route.ts'],
      pages: ['src/app/generate-image/page.tsx'],
    },
    requiresFramework: ['next', 'monorepo'],
    supportedProviders: ['anthropic', 'openai', 'aws-bedrock', 'gemini'],
  },
};

/**
 * Get all available AI templates as an array
 */
export const getAITemplates = (): AITemplateMetadata[] => {
  return Object.values(AI_TEMPLATES);
};

/**
 * Get a specific AI template by ID
 */
export const getAITemplateById = (
  id: string
): AITemplateMetadata | undefined => {
  return AI_TEMPLATES[id];
};

/**
 * Get all available AI providers as an array
 */
export const getAIProviders = (): AIProviderMetadata[] => {
  return Object.values(AI_PROVIDERS);
};

/**
 * Get a specific AI provider by ID
 */
export const getAIProviderById = (
  id: AIProvider
): AIProviderMetadata | undefined => {
  return AI_PROVIDERS[id];
};

/**
 * Check if a framework is compatible with AI templates
 */
export const isFrameworkCompatibleWithAI = (
  framework: 'next' | 'express' | 'monorepo'
): boolean => {
  return framework === 'next' || framework === 'monorepo';
};

/**
 * Get compatible AI templates for a given framework
 */
export const getCompatibleAITemplates = (
  framework: 'next' | 'express' | 'monorepo'
): AITemplateMetadata[] => {
  if (framework === 'express') {
    return [];
  }
  return getAITemplates().filter((template) =>
    template.requiresFramework.includes(framework)
  );
};

/**
 * Check if a template supports a specific provider
 */
export const isProviderSupportedByTemplate = (
  templateId: string,
  providerId: AIProvider
): boolean => {
  const template = getAITemplateById(templateId);
  return template?.supportedProviders.includes(providerId) ?? false;
};

/**
 * Get supported providers for a template
 */
export const getSupportedProviders = (
  templateId: string
): AIProviderMetadata[] => {
  const template = getAITemplateById(templateId);
  if (!template) return [];
  
  return template.supportedProviders
    .map((providerId) => AI_PROVIDERS[providerId])
    .filter(Boolean);
};
