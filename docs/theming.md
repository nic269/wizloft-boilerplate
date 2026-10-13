# Editing themes

## Copy, paste, save

In tweakcn, select **Tailwind v4**, open the CSS code tab, and copy everything.
Replace one of these files with the export, then save:

| Target | Paste destination |
| --- | --- |
| Shared default | `packages/design-system/src/styles/themes/default.tweakcn.css` |
| Marketing only (`apps/web`) | `apps/web/app/theme.tweakcn.css` |
| Optional product-only override (`apps/app`) | `apps/app/app/theme.tweakcn.css` |

Do not paste the Next.js layout or Tailwind v3 config tab. No manual removal of
imports, mappings, or base rules is required. No conversion command is required.
During development the theme files are watched. Production changes take effect
with the next normal build/deployment; editing a source file does not update an
already deployed site.

After initially pulling the theme infrastructure, restart any existing
Next/Storybook dev processes once so they load the new PostCSS configuration.
Subsequent theme-file edits use HMR. A previously started Storybook process can
retain its old PostCSS configuration even while ordinary stories hot reload.

The pasted files are deliberately exempt from Biome formatting/lint assistance:
the theme parser validates their supported structure during compilation. Other
CSS and JavaScript remain subject to the existing repository checks. The raw
export stays unchanged, including comments and formatting.

## Inheritance

An empty app file inherits the shared default. A complete export explicitly
replaces the values it contains. A partial override can be as small as:

```css
:root {
  --primary: oklch(0.55 0.2 250);
}

.dark {
  --primary: oklch(0.75 0.12 250);
}
```

Colors inherit independently for light/dark mode: omitting a dark color preserves
the default dark color. Font slots, radius, spacing, tracking and shadow settings
in `:root` apply to both modes unless `.dark` specifies them. This accounts for
tweakcn exporting spacing/tracking only under `:root`. A theme's explicit value
is retained even if it happens to equal the current default. Remove the declaration
to restore inheritance.

## Fonts

Albert Sans is bundled locally under `packages/design-system/src/styles/fonts/`
(OFL license included). System fonts need no downloads. The build-only font
catalog recognizes the Google Font families from the bundled Next.js font
metadata snapshot; the provenance and MIT notice are kept beside it in
`tooling/google-fonts.json` and `tooling/GOOGLE-FONTS-LICENSE.txt`.
Selected Google families are deduplicated across font slots and modes. The
adapter obtains their font-face CSS during compilation, caches it for that build
process, and emits the faces into the app stylesheet. Font binaries are fetched
from Google by the browser on demand. No JavaScript font loader is required.

This means a newly selected Google font requires network access from the build
machine to `fonts.googleapis.com`, and from the browser to `fonts.gstatic.com`.
A failed stylesheet request fails compilation with a diagnostic rather than
claiming the desired font loaded. The bundled local default has no external
font request. This is remote delivery, not automatic self-hosting.

Weights, italic availability and variable weight ranges follow the catalog.
Unicode ranges from the provider are retained; there is no Latin-only filter.
A family still needs glyph coverage for the author's language. First-family
resolution respects the fallback stack without downloading every fallback.

For a private/local font, add its `@font-face` outside the pasted input and
register its family in the shared PostCSS configuration:

```js
"@repo/design-system/theme-postcss": {
  registeredFonts: ["My Licensed Font"],
},
```

This is a one-time integration for that font, not a manual theme conversion.
The catalog is build-only and never shipped to the browser. Refresh it from the
corresponding Next.js `font-data.json` when new families are needed, preserving
family names, available weights, italic/normal availability and the provenance
notice. No font binaries or font licenses are implied by the metadata license.

## Ownership

- `globals.css`: shared baseline, font registration and contract import.
- `theme-contract.css`: Tailwind mapping of theme tokens to utilities.
- `themes/default.tweakcn.css`: actual default theme values; shadcn's configured
  CSS target points here.
- `tooling/theme-parser.mjs`: supported whole-export parser and merge semantics.
- `tooling/theme-postcss.mjs`: input dependency tracking and compilation adapter.
- `tooling/theme-fonts.mjs`: automatic font resolution and font-face loading.
- App stylesheets: screen composition, responsive bounds and app-specific roles.

A consuming app imports Tailwind and the shared stylesheet, then declares:

```css
@app-theme default;
@app-theme "./theme.tweakcn.css";
```

Use the shared PostCSS configuration; keep these directives at the entrypoint's
top level. If adding an entrypoint, use the same Biome annotations as existing
apps for the private directive. `@source` declarations still belong to the app.

Theme files accept the standard tweakcn scaffold and known semantic tokens, plus
`--app-` extension names; arbitrary rules and imports fail with a file/line
diagnostic. Custom keyframes and component styles belong outside theme input
files.

Colors, density and radii are theme-driven. Breakpoints, media geometry, minimum
touch targets, intentional circles/pills and optical glass/glow effects retain
structural values. A theme changes visual tokens, not page composition.

## Runtime extension and verification

CSS values live at the document root so portalled components inherit them.
A future settings feature can write validated variables on `html`, using the
same token names without rebuilding Tailwind. Mode switching still belongs to
`next-themes`. It must clear obsolete inline properties on reset or mode changes;
inline light values otherwise take precedence over dark CSS. New runtime font
families need the same resolver/asset registration; arbitrary new fonts cannot
be activated by a family name alone. There is no user-preference persistence or
runtime theme-editor UI in this change.

Use `pnpm --filter @repo/design-system test` for parser, font and compilation
regressions. The Storybook story `Design System/Foundations/Theme` exposes real
controls and a Dialog portal for inspection. Use default and app theme edits to
check HMR and isolation, then restore the intended theme before committing.

Required product extension roles (`--success` and `--destructive-foreground`)
have adapter defaults outside the replaceable input. Explicit theme values
override these defaults independently in each mode.
