# Tarmac Design System (TDS)

Delhivery's design system — themeable UI library for logistics products (React `@delhivery/tarmac`, Angular `@delhivery/tarmac-angular`).

## Sources
- Figma: "🟥 TDS.fig" (mounted VFS) — 80 pages: foundations (Colors, Typography, Grid, Spacing, Radius, Borders, Shadows, Dividers, Logos, Iconography, Illustration), ~55 component families, token collections (2392 Figma variables across Ungrouped / DLV_Mapped / Brand / Alias / material-theme).
- Codebase: `Tarmac-Design-System-main 4/` — pnpm monorepo; `packages/atoms` (React, Emotion CSS), `packages/atoms-angular`, `packages/molecules`, Storybook apps. Component style specs live in `packages/atoms/public/tarmac-theme.json` as token references (e.g. `{{Surface/BG_Primary/Default}}`).
- GitHub: https://github.com/delhivery/Tarmac-Design-System (also referenced: delhivery/design-tokens, delhivery/Tarmac-Design-Icons — not accessible from here; explore them for deeper token/icon source).

## Status (work in progress)
- ✅ Tokens: `tokens/fig-tokens.css` — all 2392 variables, kebab-case (`Surface/BG_Primary/Default` → `--surface-bg-primary-default`). FLOAT tokens are unitless (`calc(var(--x)*1px)` at use).
- ✅ Fonts: `tokens/fonts.css` — Noto Sans (primary UI), Inter (dense/data UI), IBM Plex Sans (docs). Binaries absent from sources → Google Fonts substitution (exact families). Flag: supply real font files if different.
- ✅ Icons: `assets/icons/icon-data.js` + `Icon.jsx` — 1056 glyphs materialized from the .fig (Material-style names, filled+outlined variants; see `Icon.d.ts` for valid names).
- ✅ Logos: `assets/logos/DLVLogo.jsx`, `DelhiveryLogo2.jsx` (materialized; Delhivery wordmark + logomark, red #ED1B36 accent squares).
- ⬜ Components (build from tarmac-theme.json + `packages/atoms/src/components/*`): button, badge, avatar, tag, tooltip, spinner, statusIndicator, alerts, progressBar, slider, table, snackbar, datePicker, timePicker, link, rating, divider, popup, dialogBox, breadcrumbs, sideDrawer, bottomSheet, coachmarks, fab, tabCell/tabGroup, sideNavigation, sliderButton, carousel, accordion, tdsScrollbar, fileUpload, mobileAppHeader, bottomNav, statusDot, topNavigation, input, checkbox, radio, switch, dropdown, search, pagination, pills, stepper, otp, textArea, shimmer, emptyState, segmentedButton, splitButton, orderTrackingWidgets.
- ⬜ Foundation specimen cards, component cards, UI kits, thumbnail.html, SKILL.md, content/visual-foundations sections.

## Key facts gathered
- Button API: `variant` (black/white/info/success/error/warning/dlv_red/coal), `buttonStyle` (primary=filled, secondary=outlined, tertiary=text), `size` sm/md/lg, `isRounded`, iconButton mode, loading spinner. Font weight 500, transition all .15s ease-in-out, focus ring `0 0 0 2px alpha`.
- Theme JSON token refs resolve to CSS vars in fig-tokens.css (slash→dash, kebab).
- Dark mode via `data-theme="dark"` scope in the real library.
- Brand red: rgb(237,27,54); dense grays; Noto Sans loaded from Google Fonts in real apps too.
</content>
