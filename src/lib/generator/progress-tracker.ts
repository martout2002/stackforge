/**
 * Progress tracking for scaffold generation
 */


export type GenerationStep =
  | 'validating'
  | 'creating-structure'
  | 'generating-files'
  | 'applying-theme'
  | 'generating-docs'
  | 'creating-archive'
  | 'complete'
  | 'error';

export interface ProgressEvent {
  step: GenerationStep;
  message: string;
  progress: number; // 0-100
  timestamp: number;
}

export interface GenerationProgress {
  id: string;
  status: 'pending' | 'in-progress' | 'complete' | 'error';
  currentStep: GenerationStep;
  progress: number;
  events: ProgressEvent[];
  error?: string;
  downloadId?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 */
class ProgressStore {
  private store: Map<string, GenerationProgress> = new Map();
  private readonly TTL = 1000 * 60 * 30; // 30 minutes

  /**
   * Create new progress tracker
   */
  create(id: string): GenerationProgress {
    const progress: GenerationProgress = {
      id,
      status: 'pending',
      currentStep: 'validating',
      progress: 0,
      events: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.store.set(id, progress);
    this.scheduleCleanup(id);
    return progress;
  }

  /**
   * Update progress
   */
  update(
    id: string,
    step: GenerationStep,
    message: string,
    progress: number
  ): void {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Progress tracker not found: ${id}`);
    }

    const event: ProgressEvent = {
      step,
      message,
      progress,
      timestamp: Date.now(),
    };

    existing.currentStep = step;
    existing.progress = progress;
    existing.events.push(event);
    existing.updatedAt = Date.now();

    if (step === 'complete') {
      existing.status = 'complete';
    } else if (step === 'error') {
      existing.status = 'error';
    } else {
      existing.status = 'in-progress';
    }

    this.store.set(id, existing);
  }

  /**
   * Set error
   */
  setError(id: string, error: string): void {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Progress tracker not found: ${id}`);
    }

    existing.status = 'error';
    existing.currentStep = 'error';
    existing.error = error;
    existing.updatedAt = Date.now();

    this.store.set(id, existing);
  }

  /**
   * Set download ID
   */
  setDownloadId(id: string, downloadId: string): void {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Progress tracker not found: ${id}`);
    }

    existing.downloadId = downloadId;
    existing.updatedAt = Date.now();

    this.store.set(id, existing);
  }

  /**
   * Get progress
   */
  get(id: string): GenerationProgress | undefined {
    return this.store.get(id);
  }

  /**
   * Delete progress
   */
  delete(id: string): void {
    this.store.delete(id);
  }

  /**
   * Schedule cleanup after TTL
   */
  private scheduleCleanup(id: string): void {
    setTimeout(() => {
      this.delete(id);
    }, this.TTL);
  }

  /**
   * Get all progress trackers (for debugging)
   */
  getAll(): GenerationProgress[] {
    return Array.from(this.store.values());
  }
}

// Singleton instance
export const progressStore = new ProgressStore();

/**
 * Progress tracker helper class
 */
export class ProgressTracker {
  constructor(private id: string) {}

  /**
   * Update progress
   */
  update(step: GenerationStep, message: string, progress: number): void {
    progressStore.update(this.id, step, message, progress);
  }

  /**
   * Set error
   */
  setError(error: string): void {
    progressStore.setError(this.id, error);
  }

  /**
   * Set download ID
   */
  setDownloadId(downloadId: string): void {
    progressStore.setDownloadId(this.id, downloadId);
  }

  /**
   * Get current progress
   */
  get(): GenerationProgress | undefined {
    return progressStore.get(this.id);
  }
}
