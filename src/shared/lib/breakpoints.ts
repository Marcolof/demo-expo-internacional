/**
 * Targets de viewport y breakpoints oficiales del design system.
 * Deben coincidir con los tokens de `src/styles/tokens.css`.
 * CSS `@media` no puede usar `var()` — los literales en CSS deben
 * igualar estos números. Validar con `npm run check:breakpoints`.
 */

export const VIEWPORTS = {
  mobile: { width: 360, height: 800 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1366, height: 768 },
} as const

export type ViewportName = keyof typeof VIEWPORTS

/** min-width (mobile-first) en px — mismos valores que `--bp-*`. */
export const BREAKPOINTS = {
  mobile: 360,
  tablet: 768,
  desktop: 1366,
} as const

/** max-width just below the next breakpoint (Bootstrap-style .98). */
export const BREAKPOINT_MAX = {
  mobile: 767.98,
  tablet: 1365.98,
} as const

export const MEDIA = {
  mobileOnly: `(max-width: ${BREAKPOINT_MAX.mobile}px)`,
  tabletUp: `(min-width: ${BREAKPOINTS.tablet}px)`,
  tabletOnly: `(min-width: ${BREAKPOINTS.tablet}px) and (max-width: ${BREAKPOINT_MAX.tablet}px)`,
  desktopUp: `(min-width: ${BREAKPOINTS.desktop}px)`,
} as const
