'use client';

import { useState, useCallback, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useConfigStore } from '@/lib/store/config-store';
import { scaffoldConfigSchema, type ScaffoldConfig } from '@/types';
import { getAITemplates } from '@/lib/constants/ai-templates';
import { AITemplateCard } from '@/components/AITemplateCard';
import { Tooltip } from '@/components/Tooltip';

export function ConfigurationWizard() {
  const { config, updateConfig, _hasHydrated } = useConfigStore();
  const [aiEnabled, setAiEnabled] = useState(config.aiTemplate !== 'none' && config.aiTemplate !== undefined);
  const [, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ScaffoldConfig>({
    resolver: zodResolver(scaffoldConfigSchema),
    defaultValues: config,
    mode: 'onChange',
  });

  // Reset form with persisted values after hydration
  useEffect(() => {
    if (_hasHydrated) {
      reset(config);
      setAiEnabled(config.aiTemplate !== 'none' && config.aiTemplate !== undefined);
    }
  }, [_hasHydrated, config, reset]);

  // Use config from store directly instead of watching form
  const formValues = config;

  const onSubmit = (data: ScaffoldConfig) => {
    updateConfig(data);
  };

  // Memoize and optimize field change handler
  const handleFieldChange = useCallback(<K extends keyof ScaffoldConfig>(
    field: K,
    value: ScaffoldConfig[K],
  ) => {
    // Use transition to make updates non-blocking
    startTransition(() => {
      // If frontend is changing to non-Next.js and AI template is selected, clear it
      if (field === 'frontendFramework' && value !== 'nextjs') {
        if (config.aiTemplate !== 'none' && config.aiTemplate !== undefined) {
          updateConfig({ 
            [field]: value,
            aiTemplate: 'none'
          } as Partial<ScaffoldConfig>);
          // Also disable AI features toggle
          setAiEnabled(false);
          return;
        }
      }
      
      updateConfig({ [field]: value } as Partial<ScaffoldConfig>);
    });
  }, [config.aiTemplate, updateConfig]);

  return (
    <div className="w-full">
      <div className="mb-6 md:mb-8 fade-in">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          Configure Your Stack
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Select your preferred technologies to generate a custom project scaffold
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        {/* Project Basics Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Project Basics</h2>
          <div className="space-y-3 md:space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium mb-1">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                {...register('projectName')}
                onChange={(e) => handleFieldChange('projectName', e.target.value)}
                className="w-full px-3 py-2 text-sm md:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
                placeholder="my-awesome-project"
              />
              {errors.projectName && (
                <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full px-3 py-2 text-sm md:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
                placeholder="A brief description of your project"
                rows={3}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Frontend Framework Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Frontend Framework</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3" role="radiogroup" aria-label="Frontend framework selection">
            {(['nextjs', 'react', 'vue', 'angular', 'svelte'] as const).map((fw) => (
              <label
                key={fw}
                className={`flex flex-col items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                  formValues.frontendFramework === fw
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  value={fw}
                  {...register('frontendFramework')}
                  onChange={(e) => handleFieldChange('frontendFramework', e.target.value as ScaffoldConfig['frontendFramework'])}
                  className="sr-only"
                  aria-label={fw}
                  aria-checked={formValues.frontendFramework === fw}
                />
                <span className="font-medium text-sm md:text-base capitalize">
                  {fw === 'nextjs' ? 'Next.js' : fw}
                </span>
                {fw === 'nextjs' && (
                  <span className="text-xs text-purple-600 mt-1">Recommended</span>
                )}
              </label>
            ))}
          </div>

          {/* Next.js Router Selection */}
          {formValues.frontendFramework === 'nextjs' && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium mb-2">Next.js Router</label>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {(['app', 'pages'] as const).map((router) => (
                  <label
                    key={router}
                    className={`flex items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                      formValues.nextjsRouter === router
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      value={router}
                      {...register('nextjsRouter')}
                      onChange={(e) => handleFieldChange('nextjsRouter', e.target.value as 'app' | 'pages')}
                      className="sr-only"
                    />
                    <span className="font-medium text-sm md:text-base capitalize">{router} Router</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Backend Framework Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Backend Framework</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3" role="radiogroup" aria-label="Backend framework selection">
            {(['none', 'nextjs-api', 'express', 'fastify', 'nestjs'] as const).map((bk) => {
              const isDisabled = bk === 'nextjs-api' && formValues.frontendFramework !== 'nextjs';
              return (
                <label
                  key={bk}
                  className={`flex flex-col items-center justify-center p-3 md:p-4 border-2 rounded-lg transition-all touch-manipulation ${
                    isDisabled
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : formValues.backendFramework === bk
                      ? 'border-purple-500 bg-purple-50 cursor-pointer'
                      : 'border-gray-200 hover:border-gray-300 active:border-gray-400 cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    value={bk}
                    {...register('backendFramework')}
                    onChange={(e) => handleFieldChange('backendFramework', e.target.value as ScaffoldConfig['backendFramework'])}
                    className="sr-only"
                    disabled={isDisabled}
                    aria-label={bk}
                    aria-checked={formValues.backendFramework === bk}
                  />
                  <span className="font-medium text-sm md:text-base capitalize">
                    {bk === 'none' ? 'None' : bk === 'nextjs-api' ? 'Next.js API' : bk}
                  </span>
                  {bk === 'nextjs-api' && (
                    <span className="text-xs text-gray-500 mt-1">Requires Next.js</span>
                  )}
                </label>
              );
            })}
          </div>
        </section>

        {/* Build Tool Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Build Tool</h2>
          <div className="grid grid-cols-3 gap-2 md:gap-3" role="radiogroup" aria-label="Build tool selection">
            {(['auto', 'vite', 'webpack'] as const).map((tool) => (
              <label
                key={tool}
                className={`flex flex-col items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                  formValues.buildTool === tool
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  value={tool}
                  {...register('buildTool')}
                  onChange={(e) => handleFieldChange('buildTool', e.target.value as ScaffoldConfig['buildTool'])}
                  className="sr-only"
                  aria-label={tool}
                  aria-checked={formValues.buildTool === tool}
                />
                <span className="font-medium text-sm md:text-base capitalize">{tool}</span>
                {tool === 'auto' && (
                  <span className="text-xs text-purple-600 mt-1">Recommended</span>
                )}
              </label>
            ))}
          </div>
        </section>

        {/* Project Structure Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Project Structure</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3" role="radiogroup" aria-label="Project structure selection">
            {(['nextjs-only', 'react-spa', 'fullstack-monorepo', 'express-api-only'] as const).map((structure) => (
              <label
                key={structure}
                className={`flex flex-col items-start p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                  formValues.projectStructure === structure
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  value={structure}
                  {...register('projectStructure')}
                  onChange={(e) => handleFieldChange('projectStructure', e.target.value as ScaffoldConfig['projectStructure'])}
                  className="sr-only"
                  aria-label={structure}
                  aria-checked={formValues.projectStructure === structure}
                />
                <span className="font-medium text-sm md:text-base">
                  {structure === 'nextjs-only' && 'Next.js Only'}
                  {structure === 'react-spa' && 'React SPA'}
                  {structure === 'fullstack-monorepo' && 'Full-stack Monorepo'}
                  {structure === 'express-api-only' && 'Express API Only'}
                </span>
                <span className="text-xs text-gray-600 mt-1">
                  {structure === 'nextjs-only' && 'Frontend + API routes'}
                  {structure === 'react-spa' && 'Frontend only'}
                  {structure === 'fullstack-monorepo' && 'Next.js + Express'}
                  {structure === 'express-api-only' && 'Backend only'}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Authentication Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Authentication</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3" role="radiogroup" aria-label="Authentication provider selection">
            {(['none', 'nextauth', 'supabase', 'clerk'] as const).map((authOption) => (
              <label
                key={authOption}
                className={`flex items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                  formValues.auth === authOption
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  value={authOption}
                  {...register('auth')}
                  onChange={(e) => handleFieldChange('auth', e.target.value as ScaffoldConfig['auth'])}
                  className="sr-only"
                  aria-label={`${authOption} authentication`}
                  aria-checked={formValues.auth === authOption}
                />
                <span className="font-medium text-sm md:text-base capitalize">{authOption}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Database Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Database</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
            {(
              [
                'none',
                'prisma-postgres',
                'drizzle-postgres',
                'supabase',
                'mongodb',
              ] as const
            ).map((dbOption) => (
              <label
                key={dbOption}
                className={`flex items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                  formValues.database === dbOption
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  value={dbOption}
                  {...register('database')}
                  onChange={(e) => handleFieldChange('database', e.target.value as ScaffoldConfig['database'])}
                  className="sr-only"
                />
                <span className="font-medium text-xs md:text-sm">{dbOption}</span>
              </label>
            ))}
          </div>
        </section>

        {/* API Layer Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">API Layer</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
            {(['rest-fetch', 'rest-axios', 'trpc', 'graphql'] as const).map((apiOption) => (
              <label
                key={apiOption}
                className={`flex items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                  formValues.api === apiOption
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  value={apiOption}
                  {...register('api')}
                  onChange={(e) => handleFieldChange('api', e.target.value as ScaffoldConfig['api'])}
                  className="sr-only"
                />
                <span className="font-medium text-xs md:text-sm">{apiOption}</span>
              </label>
            ))}
          </div>
        </section>

        {/* AI Features Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-all duration-300 hover:shadow-md fade-in">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <h2 className="text-lg md:text-xl font-semibold">
              AI Features <span className="text-sm font-normal text-gray-500">(Optional)</span>
            </h2>
            <Tooltip content="Add pre-built AI features powered by leading providers like Anthropic, OpenAI, AWS Bedrock, and Google Gemini">
              <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs cursor-help hover:bg-gray-300 transition-colors">
                ?
              </div>
            </Tooltip>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Add AI-powered features to your project using leading AI providers
          </p>

          {/* Framework Compatibility Warning */}
          {formValues.frontendFramework !== 'nextjs' && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-3 md:p-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-2">
                <span className="text-red-600 text-lg">⚠️</span>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-900 mb-1">
                    Framework Incompatibility
                  </h4>
                  <p className="text-sm text-red-800">
                    AI templates require Next.js frontend. Please select Next.js to enable AI features.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enable/Disable Toggle */}
          <div className="mb-4">
            <label className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-300 ${
              formValues.frontendFramework !== 'nextjs'
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                : 'border-gray-200 hover:border-purple-300 hover:shadow-sm cursor-pointer touch-manipulation'
            }`}>
              <input
                type="checkbox"
                checked={aiEnabled}
                disabled={formValues.frontendFramework !== 'nextjs'}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setAiEnabled(enabled);
                  if (!enabled) {
                    // Clear AI template selection when disabled
                    handleFieldChange('aiTemplate', 'none');
                  }
                }}
                className="w-5 h-5 md:w-4 md:h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:cursor-not-allowed"
                aria-label="Enable AI features"
              />
              <span className="text-sm md:text-base font-medium">Enable AI Features</span>
            </label>
          </div>

          {/* AI Provider Notice - Only show when enabled */}
          {aiEnabled && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-4 transition-all duration-300">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">🤖 Powered by AI:</span> Choose from multiple AI providers including Anthropic Claude, OpenAI, AWS Bedrock, and Google Gemini
                </p>
              </div>

              {/* Template Grid */}
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"
                role="radiogroup"
                aria-label="AI template selection"
              >
                {getAITemplates().map((template) => {
                  const isCompatible = formValues.frontendFramework === 'nextjs';
                  const isSelected = formValues.aiTemplate === template.id;
                  
                  return (
                    <div key={template.id} className="stagger-fade-in">
                      <AITemplateCard
                        id={template.id}
                        title={template.title}
                        description={template.description}
                        icon={template.icon}
                        features={template.features}
                        generatedFiles={template.generatedFiles}
                        selected={isSelected}
                        disabled={!isCompatible}
                        onSelect={() => {
                          if (isCompatible) {
                            // Toggle selection: if already selected, deselect (set to 'none')
                            // Otherwise, select this template
                            const newValue = isSelected ? 'none' : template.id;
                            handleFieldChange('aiTemplate', newValue);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Setup Instructions and Links */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3 transition-all duration-300 hover:shadow-sm">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 text-lg">⚠️</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">
                      API Key Required
                    </h4>
                    <p className="text-sm text-amber-800 mb-2">
                      You'll need to obtain an API key from your chosen AI provider after generating your project.
                    </p>
                  </div>
                </div>

                <div className="border-t border-amber-200 pt-3">
                  <p className="text-xs font-semibold text-amber-900 uppercase mb-2">
                    Get Your API Keys:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href="https://console.anthropic.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-800 underline flex items-center gap-1 transition-all duration-200 hover:gap-2"
                    >
                      Anthropic Claude
                      <svg className="w-3 h-3 transition-transform duration-200 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <a
                      href="https://platform.openai.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-800 underline flex items-center gap-1 transition-all duration-200 hover:gap-2"
                    >
                      OpenAI
                      <svg className="w-3 h-3 transition-transform duration-200 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <a
                      href="https://aws.amazon.com/bedrock/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-800 underline flex items-center gap-1 transition-all duration-200 hover:gap-2"
                    >
                      AWS Bedrock
                      <svg className="w-3 h-3 transition-transform duration-200 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <a
                      href="https://ai.google.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-800 underline flex items-center gap-1 transition-all duration-200 hover:gap-2"
                    >
                      Google Gemini
                      <svg className="w-3 h-3 transition-transform duration-200 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="border-t border-amber-200 pt-3">
                  <p className="text-xs text-amber-800">
                    <span className="font-semibold">📚 Setup Documentation:</span> After generation, check the README.md and SETUP.md files in your project for detailed configuration instructions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Styling Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Styling</h2>
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">CSS Framework</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
                {(['tailwind', 'css-modules', 'styled-components'] as const).map(
                  (styleOption) => (
                    <label
                      key={styleOption}
                      className={`flex items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                        formValues.styling === styleOption
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        value={styleOption}
                        {...register('styling')}
                        onChange={(e) => handleFieldChange('styling', e.target.value as ScaffoldConfig['styling'])}
                        className="sr-only"
                      />
                      <span className="font-medium text-xs md:text-sm">{styleOption}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer touch-manipulation">
                <input
                  type="checkbox"
                  {...register('shadcn')}
                  onChange={(e) => handleFieldChange('shadcn', e.target.checked)}
                  className="w-5 h-5 md:w-4 md:h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  aria-label="Include shadcn/ui components"
                />
                <span className="text-sm font-medium">Include shadcn/ui components</span>
              </label>
            </div>
          </div>
        </section>

        {/* Deployment Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Deployment Targets</h2>
          <p className="text-sm text-gray-600 mb-3">
            Select one or more deployment platforms (at least one required)
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3" role="group" aria-label="Deployment targets">
            {(['vercel', 'render', 'ec2', 'railway'] as const).map((deployOption) => {
              const isSelected = formValues.deployment.includes(deployOption);
              return (
                <label
                  key={deployOption}
                  className={`flex items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const newDeployment = e.target.checked
                        ? [...formValues.deployment, deployOption]
                        : formValues.deployment.filter((d) => d !== deployOption);
                      handleFieldChange('deployment', newDeployment);
                    }}
                    className="sr-only"
                    aria-label={`Deploy to ${deployOption}`}
                  />
                  <span className="font-medium text-xs md:text-sm capitalize">
                    {deployOption === 'ec2' ? 'AWS EC2' : deployOption}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Tooling Extras Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Tooling Extras</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4" role="group" aria-label="Tooling extras">
            {Object.keys(config.extras).map((extra) => (
              <label key={extra} className="flex items-center space-x-2 cursor-pointer touch-manipulation">
                <input
                  type="checkbox"
                  {...register(`extras.${extra as keyof typeof config.extras}`)}
                  onChange={(e) =>
                    handleFieldChange('extras', {
                      ...formValues.extras,
                      [extra]: e.target.checked,
                    })
                  }
                  className="w-5 h-5 md:w-4 md:h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  aria-label={`Include ${extra.replace(/([A-Z])/g, ' $1').trim()}`}
                />
                <span className="text-sm font-medium capitalize">
                  {extra.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </section>
      </form>
    </div>
  );
}
