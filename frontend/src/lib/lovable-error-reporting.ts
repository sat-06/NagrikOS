// Lightweight client-side error reporting hook. In the hosted Lovable
// environment a richer reporter may be injected; here we simply log so that
// runtime errors remain visible during development without crashing the app.

export function reportLovableError(error: unknown, context?: Record<string, unknown>): void {
  if (typeof console === "undefined") return;
  if (context) {
    console.error("[NagrikOS] runtime error", context, error);
  } else {
    console.error("[NagrikOS] runtime error", error);
  }
}
