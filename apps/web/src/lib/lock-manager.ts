/**
 * Execution Lock / Mutex for the TathyaTest Engine.
 * Ensures that multiple respondents testing the Web Orchestrator remotely
 * do not overwrite tathya.config.yaml or execute concurrent Playwright browsers.
 */

export type LockStep = 'idle' | 'crawl' | 'generate' | 'run';

export interface LockState {
  isLocked: boolean;
  activeStep: LockStep;
  userId: string | null;
  startedAt: string | null;
  durationSeconds: number;
}

// In-memory global singleton lock (persists across Next.js API requests in the Node process)
class EngineLockManager {
  private isLocked: boolean = false;
  private activeStep: LockStep = 'idle';
  private userId: string | null = null;
  private startedAt: number | null = null;
  private lockTimeoutMs: number = 10 * 60 * 1000; // 10 minutes auto-release safety timeout

  /**
   * Attempts to acquire the lock. Returns true if acquired, false if busy.
   */
  public acquire(userId: string, step: LockStep): { success: boolean; message: string; state: LockState } {
    this.checkTimeout();

    if (this.isLocked && this.userId !== userId) {
      return {
        success: false,
        message: `Engine sedang digunakan oleh penguji lain (${this.userId}) untuk tahap [${this.activeStep}]. Harap tunggu beberapa saat.`,
        state: this.getState(),
      };
    }

    this.isLocked = true;
    this.activeStep = step;
    this.userId = userId;
    this.startedAt = Date.now();

    return {
      success: true,
      message: `Lock berhasil diperoleh untuk tahap ${step}.`,
      state: this.getState(),
    };
  }

  /**
   * Releases the lock.
   */
  public release(userId?: string): LockState {
    // If userId provided, only release if it matches (or if called system-wide)
    if (!userId || this.userId === userId) {
      this.isLocked = false;
      this.activeStep = 'idle';
      this.userId = null;
      this.startedAt = null;
    }
    return this.getState();
  }

  /**
   * Returns current lock state.
   */
  public getState(): LockState {
    this.checkTimeout();
    return {
      isLocked: this.isLocked,
      activeStep: this.activeStep,
      userId: this.userId,
      startedAt: this.startedAt ? new Date(this.startedAt).toISOString() : null,
      durationSeconds: this.startedAt ? Math.round((Date.now() - this.startedAt) / 1000) : 0,
    };
  }

  private checkTimeout() {
    if (this.isLocked && this.startedAt && Date.now() - this.startedAt > this.lockTimeoutMs) {
      console.warn(`[LockManager] Lock timed out after ${this.lockTimeoutMs}ms. Auto-releasing.`);
      this.release();
    }
  }
}

// Maintain singleton on globalThis so Next.js dev server hot reloads do not wipe it
const globalForLock = globalThis as unknown as { engineLockManager?: EngineLockManager };
export const lockManager = globalForLock.engineLockManager ?? new EngineLockManager();
if (process.env.NODE_ENV !== 'production') globalForLock.engineLockManager = lockManager;
