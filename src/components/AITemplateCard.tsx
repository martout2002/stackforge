'use client';

import { useState } from 'react';
import { type LucideIcon } from 'lucide-react';

/**
 * AITemplateCard Props Interface
 * 
 * Requirements:
 * - 2.1: Display card for each available AI template
 * - 2.2: Include title, icon, and description
 */
interface AITemplateCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  generatedFiles: {
    apiRoutes: string[];
    pages: string[];
    components?: string[];
  };
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * AITemplateCard Component
 * 
 * A card component for displaying AI template options with hover details.
 * Supports selection state, disabled state, and responsive design.
 * 
 * Requirements:
 * - 2.1: Accept template metadata as props, handle selection state, support disabled state
 * - 2.2: Implement hover effects, selection visual feedback, responsive design
 * - 2.4: Responsive grid layout (handled by parent)
 * - 3.1: Show generated files list on hover
 * - 3.2: Display features list on hover
 * - 3.3: Add API key requirement notice on hover
 * - 6.1, 6.2, 6.3, 6.4: Responsive design
 * - 6.5: Keyboard navigation support
 * - 6.6: ARIA labels and roles
 */
export function AITemplateCard({
  id: _id,
  title,
  description,
  icon: Icon,
  features,
  generatedFiles,
  selected,
  onSelect,
  disabled = false,
  loading = false,
}: AITemplateCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle selection with Enter or Space
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onSelect();
      }
    }
    
    // Handle arrow key navigation
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const currentCard = e.currentTarget as HTMLElement;
      const radioGroup = currentCard.parentElement;
      
      if (!radioGroup) return;
      
      // Get all non-disabled cards
      const allCards = Array.from(
        radioGroup.querySelectorAll('[role="radio"]:not([aria-disabled="true"])')
      ) as HTMLElement[];
      
      const currentIndex = allCards.indexOf(currentCard);
      let nextIndex = currentIndex;
      
      // Calculate next index based on arrow key
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % allCards.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + allCards.length) % allCards.length;
      }
      
      // Focus the next card
      if (nextIndex !== -1 && allCards[nextIndex]) {
        allCards[nextIndex]?.focus();
      }
    }
  };

  return (
    <div
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      aria-label={`${title}: ${description}`}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
      onClick={() => !disabled && !loading && onSelect()}
      className={`
        relative p-6 rounded-lg border-2 cursor-pointer 
        transition-all duration-300 ease-out
        ${
          loading
            ? 'border-gray-300 bg-gray-50 cursor-wait opacity-70 animate-pulse'
            : selected
            ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02] ring-2 ring-purple-200'
            : disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1'
        }
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
      `}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg z-10">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Card Header */}
      <div className="flex items-start gap-4 mb-3">
        <div
          className={`
            p-3 rounded-lg transition-all duration-300 ease-out
            ${
              selected
                ? 'bg-purple-100 text-purple-600 scale-110'
                : disabled
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gray-100 text-gray-600 group-hover:scale-105'
            }
          `}
        >
          <Icon size={24} className="transition-transform duration-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`
              text-lg font-semibold mb-1
              ${
                selected
                  ? 'text-purple-900'
                  : disabled
                  ? 'text-gray-400'
                  : 'text-gray-900'
              }
            `}
          >
            {title}
          </h3>
          <p
            className={`
              text-sm
              ${
                selected
                  ? 'text-purple-700'
                  : disabled
                  ? 'text-gray-400'
                  : 'text-gray-600'
              }
            `}
          >
            {description}
          </p>
        </div>
      </div>

      {/* Selection Indicator */}
      {selected && (
        <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
            <svg
              className="w-4 h-4 text-white animate-in zoom-in duration-200 delay-100"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Hover Details */}
      {showDetails && !disabled && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Features List */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">
              Features
            </h4>
            <ul className="space-y-1">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-600 flex items-start gap-2"
                >
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Generated Files */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">
              Generated Files
            </h4>
            <div className="space-y-2">
              {generatedFiles.apiRoutes.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">API Routes:</p>
                  <ul className="space-y-1">
                    {generatedFiles.apiRoutes.map((route, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded"
                      >
                        {route}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {generatedFiles.pages.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pages:</p>
                  <ul className="space-y-1">
                    {generatedFiles.pages.map((page, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded"
                      >
                        {page}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {generatedFiles.components && generatedFiles.components.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Components:</p>
                  <ul className="space-y-1">
                    {generatedFiles.components.map((component, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded"
                      >
                        {component}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* API Key Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-xs text-amber-800">
              <span className="font-semibold">⚠️ API Key Required:</span> You'll
              need to configure your AI provider API key after generation.
            </p>
          </div>
        </div>
      )}

      {/* Disabled State Message */}
      {disabled && (
        <div className="mt-3 text-xs text-gray-500 italic">
          Not available with current framework selection
        </div>
      )}
    </div>
  );
}
