import { DocumentationGenerator } from './documentation-generator';
import { ScaffoldConfig } from '@/types';

const config: ScaffoldConfig = {
  projectName: 'test',
  description: 'test',
  framework: 'next',
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

const gen = new DocumentationGenerator(config);
const setup = gen.generateSETUP();
const start = setup.indexOf('## AI Integration Setup');
const end = setup.indexOf('## External Services Summary');
console.log(setup.substring(start, end !== -1 ? end : start + 3000));
