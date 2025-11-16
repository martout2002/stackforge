'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface CreateRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    private: boolean;
  }) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onErrorDismiss?: () => void;
  initialName?: string;
  initialDescription?: string;
}

export function CreateRepoModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  error = null,
  onRetry,
  onErrorDismiss,
  initialName = '',
  initialDescription = '',
}: CreateRepoModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isPrivate, setIsPrivate] = useState(false);
  const [nameError, setNameError] = useState('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{
    available: boolean;
    suggestions?: string[];
  } | null>(null);

  // Update form when initial values change (e.g., when modal opens)
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
    }
  }, [isOpen, initialName, initialDescription]);

  // Clear parent error when user starts typing
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error && onErrorDismiss) {
      onErrorDismiss();
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (error && onErrorDismiss) {
      onErrorDismiss();
    }
  };

  // Debounced availability check
  useEffect(() => {
    if (!name || name.trim().length === 0) {
      setAvailabilityResult(null);
      setNameError('');
      return;
    }

    const timeoutId = setTimeout(() => {
      checkAvailability(name);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [name]);

  const checkAvailability = async (repoName: string) => {
    setIsCheckingAvailability(true);
    setNameError('');

    try {
      const response = await fetch('/api/github/repos/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: repoName }),
      });

      if (!response.ok) {
        const error = await response.json();
        setNameError(error.error || 'Failed to check availability');
        setAvailabilityResult(null);
        return;
      }

      const result = await response.json();
      setAvailabilityResult(result);

      if (!result.available) {
        setNameError('This repository name is already taken');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setNameError('Failed to check availability');
      setAvailabilityResult(null);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.trim().length === 0) {
      setNameError('Repository name is required');
      return;
    }

    if (nameError) {
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      private: isPrivate,
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setName(suggestion);
  };

  const handleClose = () => {
    if (!isLoading) {
      setName('');
      setDescription('');
      setIsPrivate(false);
      setNameError('');
      setAvailabilityResult(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const descriptionLength = description.length;
  const maxDescriptionLength = 350;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create GitHub Repository
            </h2>
            {!isLoading && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline"
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Repository Name */}
            <div>
              <label
                htmlFor="repo-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Repository name
              </label>
              <div className="relative">
                <input
                  id="repo-name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                    nameError
                      ? 'border-red-500 focus:ring-red-500'
                      : availabilityResult?.available
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="my-awesome-project"
                  required
                />
                {isCheckingAvailability && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
                {!isCheckingAvailability && availabilityResult?.available && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {nameError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {nameError}
                </p>
              )}
              {availabilityResult?.available && !nameError && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  This name is available!
                </p>
              )}
              {availabilityResult?.suggestions && availabilityResult.suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Suggestions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availabilityResult.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isLoading}
                        className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="repo-description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description (optional)
              </label>
              <textarea
                id="repo-description"
                value={description}
                onChange={handleDescriptionChange}
                disabled={isLoading}
                maxLength={maxDescriptionLength}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                placeholder="A brief description of your project"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Great repositories have clear descriptions
                </p>
                <p
                  className={`text-xs ${
                    descriptionLength > maxDescriptionLength * 0.9
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {descriptionLength}/{maxDescriptionLength}
                </p>
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Visibility
              </label>
              <div className="space-y-2">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    disabled={isLoading}
                    className="mt-1 mr-3 disabled:cursor-not-allowed"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Public
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Anyone can see this repository
                    </div>
                  </div>
                </label>
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    disabled={isLoading}
                    className="mt-1 mr-3 disabled:cursor-not-allowed"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Private
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Only you can see this repository
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !!nameError || !name || !availabilityResult?.available}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    Creating...
                    <LoadingSpinner size="sm" />
                  </>
                ) : (
                  'Create Repository'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
