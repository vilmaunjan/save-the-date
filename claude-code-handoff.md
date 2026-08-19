# Save-the-Date Site — Project Brief

## What this is
A custom, animated save-the-date single-page site (not using The Knot/Zola — those are for the main wedding website separately). Hosted free on GitHub Pages.

## Wedding details (exact copy to use)
- **Save The Date**
- **April 30th, 2027**
- **Orlando, FL, USA**

## Visual direction
Source artwork: a soft watercolor illustration of a Tuscan-style villa with a stone fountain, cypress trees, warm stone/terracotta tones, dusty blue sky. (Attached: `villa.png`)

Design tokens established so far:
- Parchment/cream: `#F7F1E4`
- Clay/terracotta: `#C97C5D`
- Stone/gold: `#E6C79A`
- Sage green: `#6C7C58`
- Dusty sky blue: `#AFC9D6`
- Ink (near-black warm brown, used for text/bg): `#3B322A`
- Gold accent: `#B8912F`

Typography: **Cormorant Garamond** (display/headline/date) + **EB Garamond** (labels/body), both via Google Fonts.

## Current state
Built a first version: cinematic zoom-in on the villa image, staggered text reveal (letter-spacing "tracking in" for labels, blurred word-by-word reveal for the headline, hand-drawn flourish line), gentle mouse parallax, birds, fountain sparkles.

## Direction we're moving toward next
Inspired by a Claude Code skill called **scroll-world** (github.com/oso95/scroll-world) — immersive scroll-scrubbed "fly-through" landing pages where scroll position drives a continuous camera-like journey through layered scenes, no hard cuts between sections. **We are NOT using that skill directly** — it depends on paid AI video generation (Higgsfield/Monid, billed per clip). We only want the *concept*, built free:

- Scroll position scrubs a continuous animation/journey (not just "fade in on scroll")
- Depth via **layered parallax** (sky / villa / foreground at different scroll speeds) rather than real 3D or AI-rendered video
- One continuous flow rather than separate stacked sections
- Deliberate pacing — some moments get more scroll-distance to "linger," others pass quickly

Free tools for this: **GSAP + ScrollTrigger** (free core), or native CSS `animation-timeline: scroll()`, and **Lenis** for smooth-scroll feel. Explicitly avoid Three.js/WebGL — not needed for 2-3 parallax layers and adds unnecessary weight.

## Assets provided
- `villa.png` — source watercolor illustration
- `index.html` — first-pass version (reference for tokens/copy/structure, but rebuild the animation approach per the constraints above)

## Deployment
Plain static HTML/CSS/JS, no build step, hosted on GitHub Pages directly from the repo.

## Ask
Rebuild this as a lightweight scroll-driven experience: as the visitor scrolls, they move through the villa scene (e.g., wide view → drifting toward the archway/fountain → text resolves), using layered parallax depth instead of a single flat image.
