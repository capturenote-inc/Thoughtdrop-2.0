# ThoughtDrop Design System

Stitch-exported HTML files for every screen. Use these as visual reference in Claude Code.

## Files

| File | Screen | Mode |
|---|---|---|
| 01-dashboard-light.html | Dashboard | Light |
| 02-dashboard-dark.html | Dashboard | Dark |
| 03-quick-capture-light.html | Quick Capture Modal (Tier 1) | Light |
| 04-expanded-capture-dark.html | Expanded Capture Modal (Tier 2) | Dark |
| 05-page-view-light.html | Page View | Light |
| 06-inbox-light.html | Inbox | Light |
| 07-inbox-dark.html | Inbox | Dark |
| 08-workspace-dark.html | Workspace Overview | Dark |

## How to use in Claude Code

Drop this entire folder into your project root as `/design`.

When implementing a screen, reference the corresponding HTML file:
> "Implement the dashboard using /design/01-dashboard-light.html and /design/02-dashboard-dark.html as the exact visual reference. Match the Tailwind colour tokens, spacing, and component patterns."

## Colour Tokens

- Teal accent: `#0D9488` (Web Development page)
- Amber accent: `#D97706` (Personal Growth page)  
- Violet accent: `#7C3AED` (Design Projects page)
- Surface light: `#f9f9f9`
- Surface dark: `#111827`
- Card light: `#ffffff`
- Card dark: `#1F2937`
