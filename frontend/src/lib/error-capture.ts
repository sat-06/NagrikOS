// Captures the most recent unhandled error so the SSR handler can surface a
// meaningful log line even when the framework swallows the original throw.

let lastCapturedError: unknown = null;

export function captureError(error: unknown): void {
  lastCapturedError = error;
}

export function consumeLastCapturedError(): unknown {
  const error = lastCapturedError;
  lastCapturedError = null;
  return error;
}

const globalScope = globalThis as {
  process?: { on?: (event: string, handler: (err: unknown) => void) => void };
};

if (globalScope.process?.on) {
  globalScope.process.on("uncaughtException", captureError);
  globalScope.process.on("unhandledRejection", captureError);
}
