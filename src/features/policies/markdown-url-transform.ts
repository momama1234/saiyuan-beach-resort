/**
 * URL transformer passed to react-markdown to defang dangerous link schemes.
 *
 * `react-markdown` already ships a default sanitizer that strips most bad
 * schemes — this is an explicit defense-in-depth wrapper so the policy
 * stays in our codebase, is unit-testable, and survives library upgrades
 * that might loosen the default.
 *
 * Allowed: http(s), mailto:, tel:, and same-origin/relative paths.
 * Blocked: javascript:, data:, vbscript:, file: — return empty string so
 * the rendered <a> has no usable href.
 */
const BLOCKED_SCHEME_RE = /^\s*(javascript|data|vbscript|file):/i

export function safePolicyUrlTransform(url: string): string {
    if (BLOCKED_SCHEME_RE.test(url)) return ''
    return url
}
