# Ask AI Design QA

## Comparison Target

- Source visual truth: `C:\Users\vpsre\.codex\visualizations\2026\07\24\desktop-preview\19-reference-ask-ai-hover.png`
- Source focused component: `C:\Users\vpsre\.codex\visualizations\2026\07\24\desktop-preview\23-reference-ask-ai-component.png`
- Implementation screenshot: `C:\Users\vpsre\.codex\visualizations\2026\07\24\desktop-preview\21-local-ask-ai-fixed.png`
- Implementation focused component: `C:\Users\vpsre\.codex\visualizations\2026\07\24\desktop-preview\22-local-ask-ai-component.png`
- Combined focused comparison: `C:\Users\vpsre\.codex\visualizations\2026\07\24\desktop-preview\25-ask-ai-reference-vs-local.png`
- Source mobile: `C:\Users\vpsre\.codex\visualizations\2026\07\24\desktop-preview\20-reference-ask-ai-mobile.png`
- Implementation mobile: `C:\Users\vpsre\.codex\visualizations\2026\07\24\desktop-preview\24-local-ask-ai-mobile.png`
- Desktop viewport: 1440 × 1000 CSS px, device scale factor 1
- Mobile viewport: 390 × 844 CSS px, device scale factor 1
- Source focused pixels: 312 × 61
- Implementation focused pixels: 312 × 61
- Density normalization: none required; source and implementation were captured at the same CSS width and device density
- State: light theme, launcher visible; provider hover and click behavior tested separately

## Full-view Comparison Evidence

The implementation preserves the existing Aami hero while matching the source launcher’s 312 × 60 footprint, centered placement, white glass surface, border, 16px radius, copy hierarchy, divider, three 36px provider controls, and responsive mobile centering.

## Focused Comparison Evidence

The combined image places the source and implementation components side by side at equal pixel dimensions. Typography, spacing, divider position, control sizing, backgrounds, icon treatment, border radius, and overall density have no actionable P0/P1/P2 mismatch. The intentional content difference is “About Aami” instead of “About Sreedev.”

## Required Fidelity Surfaces

- Fonts and typography: matching size, weight, hierarchy, line height, capitalization, and compact label treatment.
- Spacing and layout rhythm: matching component width, height, padding, gap, divider, circular control size, radius, and centered mobile placement.
- Colors and visual tokens: matching translucent white surface, neutral border, provider background colors, and green-purple sparkle.
- Image quality and asset fidelity: provider and sparkle marks are local SVG assets; no hotlinked launcher assets remain.
- Copy and content: source structure retained and adapted only from Sreedev to Aami.

## Comparison History

### Iteration 1

- [P0] Provider links could not receive pointer input because `.hero-content` inherited `pointer-events: none`.
- [P1] The manual `window.open()` path was vulnerable to popup blocking and could trigger an unintended same-page fallback.
- [P2] Gemini used a different destination from the source and launcher icons were hotlinked.

Fixes:

- Explicitly restored pointer input on the Ask AI launcher and provider controls.
- Replaced manual popup handling with native `_blank` links and click-time URL refresh.
- Matched the source ChatGPT, Claude, and Gemini destinations.
- Added the Aami-specific recruiter evaluation prompt.
- Localized all launcher icons.

Post-fix evidence:

- Normal Playwright clicks reached all three provider controls without forced interaction.
- Each click generated the expected provider URL and populated prompt.
- Mobile layout has zero horizontal overflow.
- Browser console and framework-overlay checks are clean.

## Findings

No actionable P0, P1, or P2 findings remain.

## Follow-up Polish

No P3 refinement is required for the requested interaction.

final result: passed
