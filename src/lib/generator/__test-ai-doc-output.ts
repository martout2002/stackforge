/**
 * Generate sample AI documentation output for manual review
 */

import { DocumentationGenerator } from './documentation-generator';
import type { ScaffoldConfig } from '../../types';

const config: ScaffoldConfig = {
  projectName: 'my-ai-app',
  description: 'An AI-powered application with chatbot functionality',
  framework: 'next',
  nextjsRouter: 'app',
  auth: 'nextauth',
  database: 'prisma-postgres',
  api: 'rest-fetch',
  styling: 'tailwind',
  shadcn: true,
  colorScheme: 'purple',
  deployment: ['vercel'],
  aiTemplate: 'chatbot',
  aiProvider: 'anthropic',
  extras: {
    docker: false,
    githubActions: true,
    redis: false,
    prettier: true,
    husky: false,
  },
};

const docGen = new DocumentationGenerator(config);

console.log('='.repeat(80));
console.log('README.md PREVIEW');
console.log('='.repeat(80));
console.log(docGen.generateREADME().substring(0, 2000));
console.log('\n... (truncated)\n');

console.log('='.repeat(80));
console.log('SETUP.md AI SECTION PREVIEW');
console.log('='.repeat(80));
const setup = docGen.generateSETUP();
const aiSectionStart = setup.indexOf('## AI Integration Setup');
const aiSectionEnd = setup.indexOf('##', aiSectionStart + 10);
console.log(setup.substring(aiSectionStart, aiSectionEnd !== -1 ? aiSectionEnd : aiSectionStart + 2000));

console.log('='.repeat(80));
console.log('.env.example AI SECTION PREVIEW');
console.log('='.repeat(80));
const env = docGen.generateEnvExample();
const envAiStart = env.indexOf('# AI Integration');
const envAiEnd = env.indexOf('\n\n#', envAiStart);
console.log(env.substring(envAiStart, envAiEnd !== -1 ? envAiEnd : env.length));
