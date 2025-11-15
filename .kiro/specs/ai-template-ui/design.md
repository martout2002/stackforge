# Design Document

## Overview

This feature adds a comprehensive AI template selection interface to the StackForge configuration wizard. The design focuses on discoverability, clarity, and ease of use while maintaining consistency with the existing wizard UI.

## Architecture

### Component Structure

```
ConfigurationWizard
├── AI Features Section (new)
│   ├── Enable AI Toggle
│   ├── AI Provider Notice
│   ├── Template Grid
│   │   ├── ChatbotCard
│   │   ├── DocumentAnalyzerCard
│   │   ├── SemanticSearchCard
│   │   ├── CodeAssistantCard
│   │   └── ImageGeneratorCard
│   └── Setup Instructions Link
└── (existing sections)
```

### Data Flow

1. User toggles AI features on/off
2. State updates in Zustand store (`config.aiTemplate`)
3. Preview panel reacts to state change
4. Validation runs to ensure framework compatibility
5. Generation includes AI template files

## Components and Interfaces

### AI Template Card Component

```typescript
interface AITemplateCardProps {
  id: 'chatbot' | 'document-analyzer' | 'semantic-search' | 'code-assistant' | 'image-generator';
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  generatedFiles: {
    apiRoutes: string[];
    pages: string[];
    components?: string[];
  };
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}
```

### AI Template Metadata

```typescript
const AI_TEMPLATES = {
  chatbot: {
    title: 'AI Chatbot',
    description: 'Conversational AI interface with streaming responses',
    icon: <MessageSquare />,
    features: [
      'Real-time streaming responses',
      'Conversation history',
      'Markdown rendering',
      'Copy code blocks'
    ],
    generatedFiles: {
      apiRoutes: ['src/app/api/chat/route.ts'],
      pages: ['src/app/chat/page.tsx'],
    },
    requiresFramework: ['next', 'monorepo'],
  },
  'document-analyzer': {
    title: 'Document Analyzer',
    description: 'Upload and analyze documents with AI',
    icon: <FileText />,
    features: [
      'File upload support',
      'Text extraction',
      'AI-powered analysis',
      'Summary generation'
    ],
    generatedFiles: {
      apiRoutes: ['src/app/api/analyze/route.ts'],
      pages: ['src/app/analyze/page.tsx'],
    },
    requiresFramework: ['next', 'monorepo'],
  },
  'semantic-search': {
    title: 'Semantic Search',
    description: 'AI-powered search with embeddings',
    icon: <Search />,
    features: [
      'Vector embeddings',
      'Semantic similarity',
      'Intelligent ranking',
      'Context-aware results'
    ],
    generatedFiles: {
      apiRoutes: ['src/app/api/search/route.ts'],
      pages: ['src/app/search/page.tsx'],
    },
    requiresFramework: ['next', 'monorepo'],
  },
  'code-assistant': {
    title: 'Code Assistant',
    description: 'AI-powered code generation and explanation',
    icon: <Code />,
    features: [
      'Code generation',
      'Code explanation',
      'Syntax highlighting',
      'Multiple languages'
    ],
    generatedFiles: {
      apiRoutes: ['src/app/api/code-assistant/route.ts'],
      pages: ['src/app/code-assistant/page.tsx'],
    },
    requiresFramework: ['next', 'monorepo'],
  },
  'image-generator': {
    title: 'Image Generator',
    description: 'Generate images from text descriptions',
    icon: <Image />,
    features: [
      'Text-to-image generation',
      'Style customization',
      'Image preview',
      'Download support'
    ],
    generatedFiles: {
      apiRoutes: ['src/app/api/generate-image/route.ts'],
      pages: ['src/app/generate-image/page.tsx'],
    },
    requiresFramework: ['next', 'monorepo'],
  },
};
```

## UI Design

### AI Features Section Layout

```
┌─────────────────────────────────────────────────────────┐
│ AI Features (Optional)                                  │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ [Toggle] Enable AI Features                     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ℹ️ Powered by Anthropic Claude                         │
│ Requires ANTHROPIC_API_KEY (get yours at anthropic.com)│
│                                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│ │ 💬       │ │ 📄       │ │ 🔍       │               │
│ │ Chatbot  │ │ Document │ │ Semantic │               │
│ │          │ │ Analyzer │ │ Search   │               │
│ │ [Select] │ │ [Select] │ │ [Select] │               │
│ └──────────┘ └──────────┘ └──────────┘               │
│                                                         │
│ ┌──────────┐ ┌──────────┐                             │
│ │ 💻       │ │ 🎨       │                             │
│ │ Code     │ │ Image    │                             │
│ │ Assistant│ │ Generator│                             │
│ │ [Select] │ │ [Select] │                             │
│ └──────────┘ └──────────┘                             │
└─────────────────────────────────────────────────────────┘
```

### Template Card States

1. **Unselected**: Gray border, white background
2. **Selected**: Purple border, purple background tint
3. **Hover**: Shadow elevation, slight scale
4. **Disabled**: Grayed out, cursor not-allowed

## Validation Rules

1. AI templates require Next.js or Monorepo framework
2. Only one AI template can be selected at a time
3. If Express is selected, AI templates are disabled
4. Switching from Next.js to Express clears AI template selection

## Error Handling

### Framework Incompatibility

```typescript
if (config.framework === 'express' && config.aiTemplate) {
  return {
    field: 'aiTemplate',
    message: 'AI templates require Next.js framework. Please select Next.js or Monorepo.',
  };
}
```

### Missing API Key Warning

Display a warning banner when AI template is selected:
```
⚠️ Don't forget to add your ANTHROPIC_API_KEY to .env.local after generation
```

## Testing Strategy

### Unit Tests

- AI template card rendering
- Selection state management
- Framework compatibility validation
- Responsive grid layout

### Integration Tests

- AI template selection updates preview panel
- Framework change clears incompatible AI selection
- Generated files include AI template code
- Environment variables include ANTHROPIC_API_KEY

### Accessibility Tests

- Keyboard navigation works for all templates
- Screen readers announce template selection
- Focus indicators are visible
- ARIA labels are present and accurate

## Performance Considerations

- Template metadata is static and can be memoized
- Card components use React.memo to prevent unnecessary re-renders
- Icons are lazy-loaded from lucide-react
- Grid layout uses CSS Grid for optimal performance

## Future Enhancements

1. **Custom Prompts**: Allow users to customize AI prompts in the wizard
2. **Multiple Templates**: Support selecting multiple AI templates
3. **Template Preview**: Show code preview for selected template
4. **AI Provider Options**: Support for OpenAI, Google AI, etc.
5. **Template Marketplace**: Community-contributed AI templates
