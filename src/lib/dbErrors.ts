/**
 * Drizzle wraps driver errors (DrizzleQueryError), so unique-violation handling that
 * reads `error.message` silently degrades into "something went wrong". Walk the
 * `cause` chain and map PostgreSQL SQLSTATE codes to copy a human can act on.
 */

type PgLikeError = {
  code?: unknown;
  constraint?: unknown;
  detail?: unknown;
  message?: unknown;
  cause?: unknown;
};

export type DbErrorContext =
  | "project"
  | "story"
  | "page"
  | "guestbook"
  | "score"
  | "settings"
  | "profile"
  | "chat"
  | "preferences"
  | "auth";

function collect(error: unknown, depth = 0): PgLikeError[] {
  if (!error || depth > 5) return [];
  const asObject = error as PgLikeError;
  const chain: PgLikeError[] = [asObject];
  if (asObject.cause) chain.push(...collect(asObject.cause, depth + 1));
  return chain;
}

export function describeDbError(error: unknown, context: DbErrorContext): string {
  // Keep the real cause in the server logs without leaking it to visitors.
  console.error(`[starloom:${context}] database error`, error);

  for (const item of collect(error)) {
    const code = typeof item.code === "string" ? item.code : undefined;
    const constraint = typeof item.constraint === "string" ? item.constraint : "";

    if (code === "23505") {
      if (constraint.includes("slug")) {
        return context === "story"
          ? "That story slug is already on the library shelf. Change the title or the slug and save again."
          : "That slug already belongs to another dream project. Change the title or the slug and save again.";
      }
      if (constraint.includes("email")) {
        return "A keeper account with that email already exists. Try signing in instead.";
      }
      if (constraint.includes("visitor")) {
        return "Dream settings for this visitor already exist — they were updated instead.";
      }
      if (constraint.includes("page")) {
        return "That page number is already taken in this story. Reorder the pages and try again.";
      }
      return "That already exists in the postbag. Try a slightly different name.";
    }

    if (code === "23503") {
      return "The parent item this belongs to no longer exists. Refresh the dashboard and try again.";
    }
    if (code === "23514") {
      return "Some of those values broke the dream rules (lengths, moods or score limits). Check the fields and retry.";
    }
    if (code === "23502") {
      return "A required field was empty, so nothing was saved.";
    }
    if (code === "22P02" || code === "22003") {
      return "One of those values was in an unexpected format. Check the numbers and try again.";
    }
  }

  return "The database dropped that envelope. Please try again in a moment.";
}
