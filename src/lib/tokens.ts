/** Lightweight sanity token for consent / CSRF-ish checks on same-origin writes. */
export const CONSENT_TOKEN = "starloom-consent-v1";

export function checkToken(request: Request): boolean {
  const header = request.headers.get("x-starloom-consent");
  return header === CONSENT_TOKEN;
}
