import type { NextRequest } from "next/server";

export const COACH_MODEL_CANDIDATES = ["gemini-3.8-flash", "gemini-3.5-flash-lite"] as const;

export interface GeminiErrorLike {
  status?: number;
  name?: string;
  message?: string;
}

export function isTimeoutError(err: GeminiErrorLike | null | undefined): boolean {
  return (
    err?.name === "TimeoutError" ||
    err?.name === "AbortError" ||
    err?.name === "RequestTimeoutError" ||
    Boolean(err?.message?.toLowerCase().includes("timed out"))
  );
}

export function isRetryableModelError(err: GeminiErrorLike | null | undefined): boolean {
  const status = err?.status;
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    isTimeoutError(err)
  );
}

export function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

// In-memory limiter: resets on cold start and is per instance. Good enough to stop
// one visitor from draining the shared key; swap for a KV store if traffic grows.
export function createSlidingWindowLimiter(maxRequests: number, windowMs: number) {
  const hits = new Map<string, number[]>();

  return function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= maxRequests) {
      hits.set(ip, recent);
      return true;
    }
    recent.push(now);
    hits.set(ip, recent);
    return false;
  };
}

export async function runWithModelFallback<T>({
  totalTimeoutMs,
  primaryTimeoutMs,
  logTag,
  run,
}: {
  totalTimeoutMs: number;
  primaryTimeoutMs: number;
  logTag: string;
  run: (model: (typeof COACH_MODEL_CANDIDATES)[number], timeoutMs: number) => Promise<T>;
}): Promise<{ ok: true; value: T; model: string } | { ok: false; error: unknown }> {
  const deadline = Date.now() + totalTimeoutMs;
  let lastErr: unknown = null;

  for (let i = 0; i < COACH_MODEL_CANDIDATES.length; i += 1) {
    const model = COACH_MODEL_CANDIDATES[i];
    const remainingMs = deadline - Date.now();
    if (remainingMs < 5_000) break;

    const isLastCandidate = i === COACH_MODEL_CANDIDATES.length - 1;
    const timeoutMs = isLastCandidate
      ? remainingMs
      : Math.min(primaryTimeoutMs, remainingMs);

    try {
      const value = await run(model, timeoutMs);
      return { ok: true, value, model };
    } catch (err) {
      lastErr = err;
      const errObj = err as GeminiErrorLike;
      if (!isLastCandidate && isRetryableModelError(errObj)) {
        console.warn(
          `[${logTag}] ${model} unavailable (${errObj?.status ?? errObj?.name ?? "error"}), falling back`
        );
        continue;
      }
      break;
    }
  }

  return { ok: false, error: lastErr };
}

export type GeminiErrorKind = "quota" | "busy" | "timeout" | "unknown";

export function classifyGeminiError(err: unknown): GeminiErrorKind {
  const errObj = err as GeminiErrorLike | undefined;
  const status = errObj?.status;
  if (status === 429) return "quota";
  if (status === 503) return "busy";
  if (isTimeoutError(errObj)) return "timeout";
  return "unknown";
}

