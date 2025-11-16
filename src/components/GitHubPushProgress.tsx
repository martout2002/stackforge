'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, ExternalLink, Download } from 'lucide-react';
import { GenerationProgress as ProgressType } from '@/lib/generator/progress-tracker';

interface GitHubPushProgressProps {
  generationId: string;
  onComplete?: (repositoryUrl: string) => void;
  onError?: (error: string) => void;
  onFallbackDownload?: (downloadId: string) => void;
}

type PushStep = 'creating' | 'initializing' | 'committing' | 'pushing' | 'complete' | 'error';

const STEP_LABELS: Record<PushStep, string> = {
  creating: 'Creating Repository',
  initializing: 'Initializing Git',
  committing: 'Creating Initial Commit',
  pushing: 'Pushing to GitHub',
  complete: 'Complete',
  error: 'Error',
};

const STEP_ORDER: PushStep[] = ['creating', 'initializing', 'committing', 'pushing', 'complete'];

// Helper function to get error-specific suggestion title
function getErrorSuggestionTitle(errorMessage: string | null): string {
  if (!errorMessage) return 'What to try:';
  
  const msg = errorMessage.toLowerCase();
  
  if (msg.includes('authentication') || msg.includes('token') || msg.includes('session')) {
    return 'Authentication issue:';
  }
  if (msg.includes('already exists') || msg.includes('name')) {
    return 'Repository name conflict:';
  }
  if (msg.includes('rate limit') || msg.includes('api limit')) {
    return 'Rate limit reached:';
  }
  if (msg.includes('timeout') || msg.includes('network') || msg.includes('connection')) {
    return 'Connection issue:';
  }
  if (msg.includes('permission') || msg.includes('forbidden')) {
    return 'Permission issue:';
  }
  
  return 'What to try:';
}

// Helper function to get error-specific suggestions
function getErrorSuggestions(errorMessage: string | null): string[] {
  if (!errorMessage) {
    return [
      'Download the ZIP and create the repository manually',
      'Try again in a few moments',
      'Check your GitHub account status',
    ];
  }
  
  const msg = errorMessage.toLowerCase();
  
  // Authentication errors
  if (msg.includes('authentication') || msg.includes('token') || msg.includes('session')) {
    return [
      'Sign out and sign in again with GitHub',
      'Check if your GitHub account is still active',
      'Download the ZIP and push manually after re-authenticating',
    ];
  }
  
  // Repository name conflicts
  if (msg.includes('already exists') || msg.includes('name')) {
    return [
      'Choose a different repository name',
      'Check your GitHub repositories for duplicates',
      'Delete the existing repository if you no longer need it',
      'Download the ZIP and push to an existing repository',
    ];
  }
  
  // Rate limit errors
  if (msg.includes('rate limit') || msg.includes('api limit')) {
    return [
      'Wait a few minutes before trying again',
      'GitHub API limits reset every hour',
      'Download the ZIP and push manually',
    ];
  }
  
  // Network/timeout errors
  if (msg.includes('timeout') || msg.includes('network') || msg.includes('connection')) {
    return [
      'Check your internet connection',
      'Try again in a few moments',
      'GitHub might be experiencing issues - check status.github.com',
      'Download the ZIP and try pushing later',
    ];
  }
  
  // Permission errors
  if (msg.includes('permission') || msg.includes('forbidden')) {
    return [
      'Check your GitHub account permissions',
      'Verify you can create repositories in your account',
      'Sign out and re-authenticate with full permissions',
      'Download the ZIP and create the repository manually',
    ];
  }
  
  // Generic suggestions
  return [
    'Try again in a few moments',
    'Check if the repository name is available',
    'Verify your GitHub authentication is valid',
    'Download the ZIP and create the repository manually',
  ];
}

export function GitHubPushProgress({
  generationId,
  onComplete,
  onError,
  onFallbackDownload,
}: GitHubPushProgressProps) {
  const [progress, setProgress] = useState<ProgressType | null>(null);
  const [currentStep, setCurrentStep] = useState<PushStep>('creating');
  const [repositoryUrl, setRepositoryUrl] = useState<string | null>(null);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!polling) return;

    const pollProgress = async () => {
      try {
        const response = await fetch(`/api/progress/${generationId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch progress');
        }

        const data: ProgressType = await response.json();
        setProgress(data);

        // Map progress steps to push steps
        if (data.currentStep === 'generating-files') {
          setCurrentStep('creating');
        } else if (data.currentStep === 'creating-structure') {
          if (data.progress < 60) {
            setCurrentStep('initializing');
          } else if (data.progress < 80) {
            setCurrentStep('committing');
          } else {
            setCurrentStep('pushing');
          }
        }

        // Handle completion
        if (data.status === 'complete') {
          setPolling(false);
          setCurrentStep('complete');
          
          // Extract repository URL from events or metadata
          const repoUrl = extractRepositoryUrl(data);
          if (repoUrl) {
            setRepositoryUrl(repoUrl);
            if (onComplete) {
              onComplete(repoUrl);
            }
          }
        } else if (data.status === 'error') {
          setPolling(false);
          setCurrentStep('error');
          const error = data.error || 'Failed to push to GitHub';
          setErrorMessage(error);
          
          // Extract download ID for fallback
          if (data.downloadId) {
            setDownloadId(data.downloadId);
          }
          
          if (onError) {
            onError(error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
        setPolling(false);
        setCurrentStep('error');
        const errorMsg = 'Failed to track push progress';
        setErrorMessage(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
      }
    };

    // Poll immediately
    pollProgress();

    // Then poll every 500ms
    const interval = setInterval(pollProgress, 500);

    return () => clearInterval(interval);
  }, [generationId, polling, onComplete, onError]);

  const extractRepositoryUrl = (data: ProgressType): string | null => {
    // Try to find repository URL in events
    if (data.events) {
      for (const event of data.events) {
        if (event.message.includes('https://github.com/')) {
          const match = event.message.match(/https:\/\/github\.com\/[^\s]+/);
          if (match) {
            return match[0];
          }
        }
      }
    }
    return null;
  };

  const getStepStatus = (step: PushStep): 'pending' | 'active' | 'complete' | 'error' => {
    if (currentStep === 'error') {
      const stepIndex = STEP_ORDER.indexOf(step);
      const currentIndex = STEP_ORDER.indexOf(currentStep);
      if (stepIndex < currentIndex) return 'complete';
      return 'error';
    }

    const stepIndex = STEP_ORDER.indexOf(step);
    const currentIndex = STEP_ORDER.indexOf(currentStep);

    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const handleFallbackDownload = () => {
    if (downloadId && onFallbackDownload) {
      onFallbackDownload(downloadId);
    }
  };

  if (!progress) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      {/* Progress Steps */}
      <div className="space-y-3">
        {STEP_ORDER.filter(step => step !== 'complete').map((step, index) => {
          const status = getStepStatus(step);
          
          return (
            <div 
              key={step} 
              className="flex items-center gap-3 transition-all duration-300"
              style={{ 
                animationDelay: `${index * 100}ms`,
                opacity: status === 'pending' ? 0.5 : 1,
              }}
            >
              {/* Step Icon */}
              <div className="shrink-0 transition-transform duration-200" style={{
                transform: status === 'active' ? 'scale(1.1)' : 'scale(1)',
              }}>
                {status === 'complete' && (
                  <CheckCircle2 size={20} className="text-green-600 animate-in zoom-in duration-300" />
                )}
                {status === 'active' && (
                  <Loader2 size={20} className="text-primary animate-spin" />
                )}
                {status === 'error' && (
                  <XCircle size={20} className="text-red-600 animate-in zoom-in duration-300" />
                )}
                {status === 'pending' && (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 transition-colors duration-200" />
                )}
              </div>

              {/* Step Label */}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium transition-colors duration-200 ${
                    status === 'complete'
                      ? 'text-green-700'
                      : status === 'active'
                      ? 'text-primary'
                      : status === 'error'
                      ? 'text-red-700'
                      : 'text-gray-500'
                  }`}
                >
                  {STEP_LABELS[step]}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Success State */}
      {currentStep === 'complete' && repositoryUrl && (
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
      )}

      {/* Error State */}
      {currentStep === 'error' && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <XCircle size={20} className="text-red-600 shrink-0 mt-0.5 animate-in zoom-in duration-300" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">
                  Failed to Push to GitHub
                </p>
                <p className="text-sm text-red-700 mt-1">
                  {errorMessage || 'An error occurred while creating your repository.'}
                </p>
              </div>
            </div>
          </div>

          {/* Fallback to ZIP Download */}
          {downloadId && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150">
              <p className="text-sm text-blue-800 font-medium">
                Don&apos;t worry! Your scaffold is ready.
              </p>
              <p className="text-sm text-blue-700">
                You can download the ZIP file and manually push it to GitHub.
              </p>
              <button
                onClick={handleFallbackDownload}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download size={16} />
                Download ZIP Instead
              </button>
            </div>
          )}

          {/* Context-specific suggestions based on error */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300 delay-300">
            <p className="text-xs text-gray-700 font-medium mb-2">
              {getErrorSuggestionTitle(errorMessage)}
            </p>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              {getErrorSuggestions(errorMessage).map((suggestion, index) => (
                <li key={index} className="transition-opacity duration-200" style={{ animationDelay: `${index * 50}ms` }}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Current Progress Message */}
      {currentStep !== 'complete' && currentStep !== 'error' && progress.events && progress.events.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          {progress.events[progress.events.length - 1]?.message}
        </div>
      )}
    </div>
  );
}
