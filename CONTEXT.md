# Sigh — Project Context

## What is Sigh?

Sigh is a satirical "guided meditation" web app for the modern workplace. It's a single-page static site hosted on GitHub Pages at **getsigh.app**. The humor is deadpan — it presents itself as a legitimate wellness app while the content is absurd workplace comedy. Think Headspace meets The Office.

Tagline: **"Mindfulness for modern work."**
Subtitle: **"Guided meditation for All-Hands meetings, performance reviews, and the AI that's learning your job."**

It was originally built as an April Fools' 2026 project. The footer reads: *"Sigh is not a substitute for actual therapy. Happy April Fools' Day."*

## File Structure

```
sigh/
├── index.html          # The entire app (HTML + CSS + JS, single file)
├── scripts.md          # Full written scripts for all 10 sessions
├── og-template.html    # HTML template for generating OG share images
├── generate-og.js      # Playwright script to screenshot OG images
├── og/                 # Generated OG share images (1200x630 PNGs)
│   ├── home.png        # Homepage OG image (hero layout)
│   └── session-{1-10}.png  # Per-session OG images (quote cards)
├── s/                  # Share page redirects with OG meta tags
│   ├── 1/index.html    # through 10/index.html
│   └── ...
├── .gitignore          # Excludes *.md, node_modules, og-template, generate-og
├── package.json        # Only dependency: playwright (for OG image generation)
└── CONTEXT.md          # This file
```

## Sessions (Current Lineup)

10 playable sessions + 2 "Coming Soon" placeholders:


| #   | Title                | Subtitle                                                    | Audio File     | Duration    |
| --- | -------------------- | ----------------------------------------------------------- | -------------- | ----------- |
| 1   | You Are Not an LLM   | A meditation for when AI learns your job                    | session-1.mp3  | 2:32        |
| 2   | Quick Question       | Acceptance for the message that is never quick              | session-2.mp3  | 2:32        |
| 3   | 2,847 Unread         | You are not your inbox. You are enough.                     | session-3.mp3  | 2:23        |
| 4   | Meets Expectations   | A breathing exercise for review season                      | session-4.mp3  | 2:12        |
| 5   | Your 7th Manager     | Acceptance and impermanence in org design                   | session-5.mp3  | 1:51        |
| 6   | Your Camera Is Off   | A meditation for surviving the All-Hands                    | session-6.mp3  | 2:20        |
| 7   | jsdkfjsd.zip         | Letting go of your Downloads folder                         | session-7.mp3  | 2:41        |
| 8   | Share Your Screen    | A breathing exercise for the moment before you share        | session-8.mp3  | 3:05        |
| 9   | Final_v3_REAL.docx   | Finding inner peace through file naming                     | session-9.mp3  | 1:51        |
| 10  | No Times Work        | A meditation for scheduling the impossible                  | session-10.mp3 | 2:37        |
| 11  | 👍                   | A meditation for the reply that says everything and nothing | —              | Coming Soon |
| 12  | Sorry, Just Saw This | A meditation on the lie we all agree to believe             | —              | Coming Soon |


Durations are calculated as: voice track length + 9 seconds (3s voice delay + 5s ambient tail + 1s fade out).

## Audio Architecture

All audio is hosted on Google Cloud Storage: `https://storage.googleapis.com/sigh-audio/`

The player uses the **Web Audio API** with a custom `mixer` object:

- **Ambient track** (`ambient.mp3`): Loops seamlessly using `AudioBufferSourceNode`. Crossfades between loop iterations to avoid audible seams.
- **Voice track** (`session-N.mp3`): Plays over the ambient after a 3-second delay (`VOICE_DELAY`).
- After the voice ends, ambient continues for 5 seconds (`TAIL_DURATION`), then fades out over 1 second (`FADE_DURATION`).
- Safari compatibility was a major issue with Dropbox CDN (the original host). Migrating to GCS resolved streaming/range-request problems. The Web Audio API approach (vs. `HTMLAudioElement`) ensures seamless ambient looping.

Key mixer constants in `index.html`:

```
VOICE_DELAY: 3      // seconds before voice starts
TAIL_DURATION: 5    // seconds of ambient after voice ends
FADE_DURATION: 1    // fade out duration
AMBIENT_VOLUME: 0.75
```

## Share System

When a user clicks Share on a session:

1. JS constructs URL `https://getsigh.app/s/{id}/` and shares via `navigator.share()` or clipboard fallback
2. The share page at `s/{id}/index.html` has session-specific OG meta tags:
  - `og:title`: "{Title} — Sigh"
  - `og:description`: The session's share quote (wrapped in `"`)
  - `og:image`: `https://getsigh.app/og/session-{id}.png`
3. The page immediately redirects to `/#session-{id}` which opens the player

**Source of truth for share quotes**: The `og:description` in each `s/N/index.html` file. When changing a quote, update:

1. `s/N/index.html` (og:description) — the source of truth
2. `index.html` (shareQuote in the SESSIONS array) — used by the share button and text copy
3. `og-template.html` (SESSIONS array) — used to render OG images
4. Run `node generate-og.js` to regenerate the PNG

## OG Image Generation

The OG images are static PNGs generated by Playwright. To regenerate:

```bash
cd personal-sites/sigh
node generate-og.js
```

This produces:

- `og/session-1.png` through `og/session-10.png` — dark gradient background with session number, title, and pull quote in italic text
- `og/home.png` — hero-style layout with "sigh." logo, tagline, and subtitle

The template (`og-template.html`) accepts `?session=N` for session cards or `?home=1` for the homepage variant.

## Analytics (GoatCounter)

Integrated at `sigh.goatcounter.com`. Events tracked:

- `play/{id}` — session card clicked / player opened
- `listen/{id}` — play button pressed
- `complete/{id}` — session played to completion
- `drop/{id}/{pct}pct` — player closed before completion (with % progress)
- `share/{id}` — share button clicked

Uses GoatCounter's `goatcounter.count()` with event tracking. Standard page views are tracked automatically by the embedded script.

## Tech Stack

- **Hosting**: GitHub Pages (static)
- **Domain**: getsigh.app (custom DNS)
- **Audio CDN**: Google Cloud Storage (bucket: `sigh-audio`)
- **Analytics**: GoatCounter (sigh.goatcounter.com)
- **Font**: Plus Jakarta Sans (Google Fonts)
- **Favicon**: 😮‍💨 emoji as inline SVG data URI
- **No framework**: Pure HTML/CSS/JS, single `index.html` file

## Design System

CSS custom properties defined in `:root`:

```
--bg-deep: #0a0a1a
--bg-surface: #111128
--bg-card: #1a1a3e
--bg-card-hover: #222255
--text-primary: #e8e6f0
--text-secondary: #9896b0
--text-muted: #6b6888
--accent-lavender: #a78bfa
--accent-amber: #f5c76e
--accent-sage: #7dd3a8
--accent-rose: #f0a0b0
--font: 'Plus Jakarta Sans'
```

The background uses animated radial gradients with a slow "breathing" pulse effect. Session cards have hover glow effects. The player overlay is full-screen with a dark backdrop.

## Page Layout

1. **Hero**: Logo ("sigh.") with breathing animation, tagline, subtitle, CTA button
2. **Sessions Grid**: 12 cards (10 playable + 2 coming-soon). Grid layout with interleaving logic that mixes playable and coming-soon cards by ID order.
3. **Testimonials**: Carousel of 6 fake reviews from fictional users. Each references a real session title.
4. **Footer**: Disclaimer + copyright
5. **Player Overlay**: Full-screen overlay with play/pause, progress bar, time display, share button, and next-session button.

## GitHub

Repo: `github.com/kylemaclaren/sigh` 

## Tone Guidelines

- Deadpan, dry humor. Never winking or self-aware. Present everything as if it's a real product.
- The scripts read like actual guided meditations, except the subject matter is absurd workplace situations.
- Testimonials are fake but written in the voice of real product reviews.
- Session titles should be viscerally relatable to knowledge workers — the "OMG, I know that feeling" reaction.
- Avoid anything that could read as mean-spirited toward specific teams or roles. The humor should be about shared experiences, not punching down.

## Known Issues / Open Items

- Session 1 script ("You Are Not an LLM") has a line referencing "Karen from Legal" that the author wants to rework — it reads as a dig at legal teams. The replacement should reference a mundane workplace skill that feels uniquely human.
- The `.gitignore` excludes `*.md` files from the deployed site (scripts, context docs stay local only).

