/**
 * Test AI Documentation Generation
 * 
 * This test verifies that the documentation generator correctly includes
 * AI setup information when an AI template is selected.
 * 
 * Requirements tested:
 * - 5.3: README includes AI setup when template selected
 * - 5.4: SETUP.md includes Anthropic configuration
 */

import { DocumentationGenerator } from './documentation-generator';
import type { ScaffoldConfig } from '../../types';

// Test configuration with AI template
const testConfig: ScaffoldConfig = {
  projectName: 'test-ai-project',
  description: 'A test project with AI features',
  framework: 'next',
  nextjsRouter: 'app',
  auth: 'none',
  database: 'none',
  api: 'rest-fetch',
  styling: 'tailwind',
  shadcn: true,
  colorScheme: 'purple',
  deployment: ['vercel'],
  aiTemplate: 'chatbot',
  aiProvider: 'anthropic',
  extras: {
    docker: false,
    githubActions: false,
    redis: false,
    prettier: true,
    husky: false,
  },
};

console.log('🧪 Testing AI Documentation Generation\n');

// Test 1: README includes AI information
console.log('Test 1: README includes AI template information');
const docGen = new DocumentationGenerator(testConfig);
const readme = docGen.generateREADME();

const readmeChecks = [
  { name: 'AI template mentioned', check: readme.includes('AI Chatbot') },
  { name: 'Anthropic provider mentioned', check: readme.includes('Anthropic') },
  { name: 'AI features route mentioned', check: readme.includes('/chat') },
  { name: 'AI prerequisite mentioned', check: readme.includes('API key') },
];

readmeChecks.forEach(({ name, check }) => {
  console.log(`  ${check ? '✓' : '✗'} ${name}`);
});

// Test 2: SETUP.md includes AI configuration
console.log('\nTest 2: SETUP.md includes AI configuration');
const setup = docGen.generateSETUP();

const setupChecks = [
  { name: 'AI Integration Setup section', check: setup.includes('AI Integration Setup') },
  { name: 'Anthropic Console link', check: setup.includes('console.anthropic.com') },
  { name: 'API key instructions', check: setup.includes('ANTHROPIC_API_KEY') },
  { name: 'Template features listed', check: setup.includes('Real-time streaming') },
  { name: 'Generated files listed', check: setup.includes('src/app/api/chat/route.ts') },
  { name: 'Troubleshooting section', check: setup.includes('Troubleshooting') },
];

setupChecks.forEach(({ name, check }) => {
  console.log(`  ${check ? '✓' : '✗'} ${name}`);
});

// Test 3: .env.example includes AI variables
console.log('\nTest 3: .env.example includes AI variables');
const envExample = docGen.generateEnvExample();

const envChecks = [
  { name: 'AI Integration section', check: envExample.includes('# AI Integration') },
  { name: 'ANTHROPIC_API_KEY variable', check: envExample.includes('ANTHROPIC_API_KEY=') },
  { name: 'Security warning', check: envExample.includes('Keep API keys secure') },
  { name: 'Setup URL reference', check: envExample.includes('console.anthropic.com') },
];

envChecks.forEach(({ name, check }) => {
  console.log(`  ${check ? '✓' : '✗'} ${name}`);
});

// Test 4: Multiple AI providers
console.log('\nTest 4: Support for multiple AI providers');

const providers = ['anthropic', 'openai', 'aws-bedrock', 'gemini'] as const;
const providerResults: Record<string, boolean> = {};

providers.forEach((provider) => {
  const config = { ...testConfig, aiProvider: provider };
  const gen = new DocumentationGenerator(config);
  const setupDoc = gen.generateSETUP();
  const envDoc = gen.generateEnvExample();
  
  const providerNames: Record<string, string> = {
    anthropic: 'Anthropic Claude',
    openai: 'OpenAI',
    'aws-bedrock': 'AWS Bedrock',
    gemini: 'Google Gemini',
  };
  
  const envVarNames: Record<string, string> = {
    anthropic: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    'aws-bedrock': 'AWS_BEDROCK_CREDENTIALS',
    gemini: 'GEMINI_API_KEY',
  };
  
  const hasProviderName = setupDoc.includes(providerNames[provider]);
  const hasEnvVar = envDoc.includes(envVarNames[provider]);
  
  providerResults[provider] = hasProviderName && hasEnvVar;
  console.log(`  ${providerResults[provider] ? '✓' : '✗'} ${providerNames[provider]} support`);
});

// Summary
console.log('\n📊 Test Summary');
const allChecks = [...readmeChecks, ...setupChecks, ...envChecks];
const passed = allChecks.filter(c => c.check).length;
const total = allChecks.length;
const providersPassed = Object.values(providerResults).filter(Boolean).length;

console.log(`  README: ${readmeChecks.filter(c => c.check).length}/${readmeChecks.length} checks passed`);
console.log(`  SETUP: ${setupChecks.filter(c => c.check).length}/${setupChecks.length} checks passed`);
console.log(`  ENV: ${envChecks.filter(c => c.check).length}/${envChecks.length} checks passed`);
console.log(`  Providers: ${providersPassed}/${providers.length} providers supported`);
console.log(`\n  Total: ${passed}/${total} checks passed`);

if (passed === total && providersPassed === providers.length) {
  console.log('\n✅ All tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed');
  process.exit(1);
}
