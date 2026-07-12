/**
 * Tailwind CSS v4 Configuration Note
 * ====================================
 * Tailwind CSS v4 uses a CSS-first configuration approach.
 * Design tokens are defined directly in `src/index.css` using the `@theme` block.
 *
 * See: frontend/src/index.css → @theme { ... }
 *
 * The following tokens are defined:
 * - Colors: --color-primary, --color-secondary, --color-accent,
 *            --color-background, --color-surface, --color-text, etc.
 * - Border radius: --radius-sm, --radius-md, --radius-lg, --radius-xl, --radius-full
 * - Spacing: 4px base grid (--spacing-1 through --spacing-64)
 * - Typography: --font-sans (Inter), --font-mono (JetBrains Mono)
 *
 * Dark mode is handled via [data-theme="dark"] selector overriding the CSS variables.
 */

// This file is intentionally a documentation-only comment.
// Tailwind v4 does NOT use tailwind.config.ts — configuration lives in CSS.
export {}
