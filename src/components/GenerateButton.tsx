'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Download, Loader2, Github, ExternalLink, CheckCircle2 } from 'lucide-react';
import { ScaffoldConfig, ValidationResult } from '@/types';
import { validateForGeneration } from '@/lib/validation/validation-handler';
import { DownloadButton } from './DownloadButton';
import { CreateRepoModal } from './CreateRepoModal';
import { GenerationProgress } from './GenerationProgress';
import { ErrorMessage, ERROR_MESSAGES } from './ErrorMessage';

interface GenerateButtonProps {
  config: ScaffoldConfig;
  validationResult?: ValidationResult;
  isValidating?: boolean;
  onValidationError?: (errors: string[]) => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

// Helper function to format time remaining
function formatTimeRemaining(resetTime: number): string {
  const now = Date.now();
  const diff = resetTime - now;

  if (diff <= 0) {
    return 'now';
  }

  const minutes = Math.floor(diff / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

export function GenerateButton({
  config,
  validationResult,
  isValidating = false,
  onValidationError,
  onSuccess,
  onError,
  className = '',
}: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [repositoryUrl, setRepositoryUrl] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    resetTime: number;
    retryAfter: number;
  } | null>(null);
  const [repoModalError, setRepoModalError] = useState<string | null>(null);
  const [lastRepoData, setLastRepoData] = useState<{
    name: string;
    description: string;
    private: boolean;
  } | null>(null);

  // Check GitHub authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/github/auth/status');
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      } catch (err) {
        console.error('Failed to check auth status:', err);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Countdown timer for rate limit
  useEffect(() => {
    if (!rateLimitInfo) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= rateLimitInfo.resetTime) {
        setRateLimitInfo(null);
        setError(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimitInfo]);

  // Use provided validation result or compute it
  const validationState = validationResult 
    ? {
        ...validateForGeneration(config),
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        hasErrors: validationResult.errors.length > 0,
        hasWarnings: validationResult.warnings.length > 0,
      }
    : validateForGeneration(config);

  const handleRepoSubmit = async (repoData: {
    name: string;
    description: string;
    private: boolean;
  }) => {
    setLastRepoData(repoData);
    setRepoModalError(null);
    setIsCreatingRepo(true);

    try {
      const response = await fetch('/api/github/repos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: repoData.name,
          description: repoData.description,
          private: repoData.private,
          config: config,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsCreatingRepo(false);
        
        // Handle rate limit error specially (our app rate limit)
        if (response.status === 429 && data.resetTime) {
          setRateLimitInfo({
            resetTime: data.resetTime,
            retryAfter: data.retryAfter || 3600,
          });
          setError(data.message || 'Rate limit exceeded. Please try again later.');
          setShowRepoModal(false);
        } 
        // Handle authentication errors
        else if (response.status === 401) {
          setRepoModalError(data.message || 'Authentication failed. Please sign in again.');
          // Keep modal open for retry after re-auth
        }
        // Handle repository name conflicts
        else if (response.status === 409) {
          setRepoModalError(data.message || 'Repository name already exists. Please choose a different name.');
          // Keep modal open so user can change the name
        }
        // Handle network/timeout errors - allow retry
        else if (response.status === 408 || response.status === 503) {
          setRepoModalError(data.message || 'Network error. Please check your connection and try again.');
          // Keep modal open for retry
        }
        // Handle other errors
        else {
          setRepoModalError(data.message || data.error || 'Failed to create repository');
          // Keep modal open for retry
        }
        return;
      }

      // Success
      setIsCreatingRepo(false);
      setShowRepoModal(false);
      setRepoModalError(null);
      setLastRepoData(null);
      setRepositoryUrl(data.repository.htmlUrl);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Failed to create repository:', err);
      setIsCreatingRepo(false);
      const errorMsg = err instanceof Error ? err.message : 'Network error. Please try again.';
      setRepoModalError(errorMsg);
      // Keep modal open for retry
    }
  };

  const handleGenerate = async () => {
    // Prevent generation if there are errors
    if (!validationState.canGenerate) {
      if (onValidationError) {
        onValidationError(validationState.errors.map((e) => e.message));
      }
      return;
    }

    setIsGenerating(true);
    setError(null);
    setDownloadId(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok) {
        // Provide specific error messages based on status
        if (response.status === 408 || response.status === 504) {
          throw new Error('timeout');
        } else if (response.status >= 500) {
          throw new Error('server');
        } else if (response.status === 400) {
          throw new Error('invalid_config');
        }
        throw new Error(data.error || 'generation_failed');
      }

      // Set download ID directly from response
      setDownloadId(data.downloadId);
      setIsGenerating(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      let errorType = 'generation_failed';
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorType = 'network';
      } else if (err instanceof Error) {
        errorType = err.message;
      }
      
      setError(errorType);
      setIsGenerating(false);
      if (onError) {
        onError(errorType);
      }
    }
  };

  // Show repository success state
  if (repositoryUrl) {
    return (
      <div className={`space-y-3 md:space-y-4 ${className}`}>
        <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={24} className="text-green-600 shrink-0 mt-0.5 animate-in zoom-in duration-300" />
            <div className="flex-1">
              <p className="text-base text-green-800 font-bold">
                🎉 Repository Created Successfully!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Your scaffold has been pushed to GitHub and is ready to use.
              </p>
            </div>
          </div>

          <a
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold text-base hover:bg-green-700 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <ExternalLink size={18} />
            Go to Repository
          </a>
        </div>

        <button
          onClick={() => {
            setRepositoryUrl(null);
            setDownloadId(null);
            setError(null);
          }}
          className="w-full px-4 py-2 md:px-6 text-xs md:text-sm text-gray-600 hover:text-gray-800 transition-colors touch-manipulation"
        >
          Create Another Repository
        </button>
      </div>
    );
  }

  // Show download and GitHub options if complete
  if (downloadId) {
    return (
      <div className={`space-y-3 md:space-y-4 ${className}`}>
        {/* Download ZIP Option */}
        <DownloadButton
          downloadId={downloadId}
          onRetryExhausted={() => {
            setError(
              'Download failed after multiple attempts. Please regenerate your scaffold.'
            );
          }}
        />

        {/* GitHub Repository Option */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <button
          onClick={() => setShowRepoModal(true)}
          disabled={!isAuthenticated || !!rateLimitInfo}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all touch-manipulation ${
            isAuthenticated && !rateLimitInfo
              ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={
            !isAuthenticated
              ? 'Sign in with GitHub to create repositories'
              : rateLimitInfo
              ? 'Rate limit exceeded. Please wait.'
              : 'Create a GitHub repository with your scaffold'
          }
        >
          <Github size={18} className="md:w-5 md:h-5" />
          Create GitHub Repository
        </button>

        {!isAuthenticated && (
          <p className="text-[10px] md:text-xs text-center text-gray-500">
            Sign in with GitHub to create repositories directly
          </p>
        )}

        {rateLimitInfo && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800 font-medium">
              Rate Limit Reached
            </p>
            <p className="text-sm text-orange-700 mt-1">
              You&apos;ve created 5 repositories in the last hour. You can create more in{' '}
              <span className="font-mono font-semibold">
                {formatTimeRemaining(rateLimitInfo.resetTime)}
              </span>
            </p>
          </div>
        )}

        {/* Repository Creation Modal */}
        {showRepoModal && (
          <CreateRepoModal
            isOpen={showRepoModal}
            onClose={() => {
              if (!isCreatingRepo) {
                setShowRepoModal(false);
                setRepoModalError(null);
                setLastRepoData(null);
              }
            }}
            error={repoModalError}
            isLoading={isCreatingRepo}
            onRetry={() => {
              if (lastRepoData) {
                setRepoModalError(null);
                // Retry with the same data
                handleRepoSubmit(lastRepoData);
              }
            }}
            onErrorDismiss={() => setRepoModalError(null)}
            onSubmit={handleRepoSubmit}
            initialName={config.projectName}
            initialDescription={config.description}
          />
        )}

        <button
          onClick={() => {
            setDownloadId(null);
            setError(null);
          }}
          className="w-full px-4 py-2 md:px-6 text-xs md:text-sm text-gray-600 hover:text-gray-800 transition-colors touch-manipulation"
        >
          Generate Another
        </button>
      </div>
    );
  }

  // Show loading state while generating with progress tracking
  if (isGenerating && downloadId) {
    return (
      <div className={`space-y-3 md:space-y-4 ${className}`}>
        <GenerationProgress
          generationId={downloadId}
          onComplete={(completedDownloadId) => {
            setIsGenerating(false);
            setDownloadId(completedDownloadId);
            if (onSuccess) {
              onSuccess();
            }
          }}
          onError={(errorMessage) => {
            setIsGenerating(false);
            setError(errorMessage);
            if (onError) {
              onError(errorMessage);
            }
          }}
        />
      </div>
    );
  }

  // Fallback loading state (before downloadId is set)
  if (isGenerating) {
    return (
      <div className={`space-y-3 md:space-y-4 ${className}`}>
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 size={32} className="animate-spin text-purple-600" />
          <p className="text-sm text-gray-600">Starting generation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 md:space-y-4 ${className}`}>
      {/* Validation Status */}
      <div className="text-xs md:text-sm">
        {validationState.hasErrors && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 md:px-4">
            <AlertCircle size={14} className="md:w-4 md:h-4 shrink-0" />
            <span className="font-medium">{validationState.validationMessage}</span>
          </div>
        )}
        {!validationState.hasErrors && validationState.hasWarnings && (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 md:px-4">
            <AlertCircle size={14} className="md:w-4 md:h-4 shrink-0" />
            <span className="font-medium">{validationState.validationMessage}</span>
          </div>
        )}
        {!validationState.hasErrors && !validationState.hasWarnings && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 md:px-4">
            <span className="font-medium">✓ {validationState.validationMessage}</span>
          </div>
        )}
      </div>

      {/* Error Display with comprehensive messages */}
      {error && (
        <ErrorMessage
          title={
            error === 'network'
              ? ERROR_MESSAGES.NETWORK_ERROR.title
              : error === 'timeout'
              ? ERROR_MESSAGES.TIMEOUT_ERROR.title
              : error === 'invalid_config'
              ? ERROR_MESSAGES.INVALID_CONFIG.title
              : ERROR_MESSAGES.GENERATION_FAILED.title
          }
          message={
            error === 'network'
              ? ERROR_MESSAGES.NETWORK_ERROR.message
              : error === 'timeout'
              ? ERROR_MESSAGES.TIMEOUT_ERROR.message
              : error === 'invalid_config'
              ? ERROR_MESSAGES.INVALID_CONFIG.message
              : ERROR_MESSAGES.GENERATION_FAILED.message
          }
          suggestions={
            error === 'network'
              ? ERROR_MESSAGES.NETWORK_ERROR.suggestions
              : error === 'timeout'
              ? ERROR_MESSAGES.TIMEOUT_ERROR.suggestions
              : error === 'invalid_config'
              ? ERROR_MESSAGES.INVALID_CONFIG.suggestions
              : ERROR_MESSAGES.GENERATION_FAILED.suggestions
          }
          onRetry={() => {
            setError(null);
            handleGenerate();
          }}
        />
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!validationState.canGenerate || isGenerating || isValidating}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all touch-manipulation ${
          validationState.canGenerate && !isGenerating && !isValidating
            ? 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title={
          isValidating
            ? 'Validating configuration...'
            : !validationState.canGenerate
            ? 'Fix validation errors before generating'
            : 'Generate scaffold'
        }
      >
        {isValidating ? (
          <>
            <Loader2 size={18} className="md:w-5 md:h-5 animate-spin" />
            Validating...
          </>
        ) : isGenerating ? (
          <>
            <Loader2 size={18} className="md:w-5 md:h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download size={18} className="md:w-5 md:h-5" />
            Generate Scaffold
          </>
        )}
      </button>

      {/* Helper Text */}
      {!validationState.canGenerate && (
        <p className="text-[10px] md:text-xs text-center text-gray-500">
          Please fix the configuration errors above to enable generation
        </p>
      )}
      {validationState.canGenerate && validationState.hasWarnings && (
        <p className="text-[10px] md:text-xs text-center text-gray-500">
          Warnings won&apos;t prevent generation, but you may want to review them
        </p>
      )}
    </div>
  );
}
