# Design Document

## Overview

This design transforms the landing page from a modern SaaS aesthetic to an immersive pixel-art experience. The redesign centers around a mystical forest background featuring a bubbling cauldron, with the "Cauldron 2 Code" branding and a prominent "Build" call-to-action button. The design prioritizes visual impact while maintaining accessibility and performance.

## Architecture

### Component Structure

The landing page will remain a single-file component (`src/app/page.tsx`) but with a dramatically simplified structure:

```
Landing Page
├── Background Layer (full-screen image)
├── Hero Section (centered content)
│   ├── Title: "Cauldron 2 Code"
│   └── Build Button
└── Optional: Minimal footer or attribution
```

### Font Integration

The Pixelify Sans font will be integrated at the layout level (`src/app/layout.tsx`) using Next.js's `next/font/google` optimization:

```typescript
import { Pixelify_Sans } from "next/font/google";

const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
```

This approach ensures:
- Automatic font optimization and subsetting
- Zero layout shift during font loading
- CSS variable for easy application throughout the app

### Image Asset Management

The background image will be stored in the `public` directory as `public/cauldron-background.png`. The image should be:
- Optimized to ~300-500KB using tools like TinyPNG or ImageOptim
- Saved in PNG format to preserve pixel-art quality
- Dimensions: Minimum 1920x1080px for desktop displays

## Components and Interfaces

### Landing Page Component

**File:** `src/app/page.tsx`

**Structure:**
```typescript
export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a0e1a]">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/cauldron-background.png')" }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="pixel-title">Cauldron 2 Code</h1>
        <Link href="/configure">
          <button className="pixel-button">Build</button>
        </Link>
      </div>
    </div>
  );
}
```

**Key Design Decisions:**
- Use CSS background-image instead of Next.js Image component for full-screen backgrounds (better control over positioning and layering)
- Fallback background color `#0a0e1a` (dark blue-black) matches the image's overall tone
- Relative/absolute positioning creates proper layering without z-index conflicts
- Flexbox centering ensures content remains centered across all viewport sizes

### Typography Styles

**Title Styling:**
```css
.pixel-title {
  font-family: var(--font-pixelify);
  font-size: clamp(2rem, 8vw, 5rem);
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  text-shadow: 
    0 0 10px rgba(180, 255, 100, 0.5),
    0 0 20px rgba(180, 255, 100, 0.3),
    4px 4px 0px rgba(0, 0, 0, 0.8);
  letter-spacing: 0.05em;
  margin-bottom: 2rem;
}
```

**Design Rationale:**
- `clamp()` provides fluid typography that scales between mobile and desktop
- Green glow effect (`text-shadow`) creates magical atmosphere matching the cauldron
- Black drop shadow ensures readability over varying background areas
- Letter spacing improves readability of pixel fonts at larger sizes

### Button Component

**Button Styling:**
```css
.pixel-button {
  font-family: var(--font-pixelify);
  font-size: clamp(1.25rem, 4vw, 2rem);
  font-weight: 600;
  color: #0a0e1a;
  background-color: #b4ff64;
  padding: 1rem 3rem;
  border-radius: 0.5rem;
  border: 3px solid #8fcc4f;
  box-shadow: 
    0 4px 0 #6a9938,
    0 8px 20px rgba(0, 0, 0, 0.4);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  cursor: pointer;
}

.pixel-button:hover {
  background-color: #c8ff82;
  transform: translateY(-2px);
  box-shadow: 
    0 6px 0 #6a9938,
    0 12px 24px rgba(0, 0, 0, 0.5);
}

.pixel-button:active {
  transform: translateY(2px);
  box-shadow: 
    0 2px 0 #6a9938,
    0 4px 12px rgba(0, 0, 0, 0.3);
}
```

**Design Rationale:**
- Lime green (`#b4ff64`) matches the magical cauldron glow in the background
- 3D effect using box-shadow creates depth and tactile feel
- Hover state lifts button upward (game-like interaction)
- Active state pushes button down (pressed effect)
- Dark text on bright background ensures WCAG AAA contrast compliance

## Data Models

No data models required for this feature. The landing page is purely presentational with no state management or data fetching.

## Error Handling

### Image Loading Failures

**Scenario:** Background image fails to load due to network issues or missing file

**Handling:**
```typescript
<div className="absolute inset-0 bg-[#0a0e1a]">
  <div 
    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: "url('/cauldron-background.png')" }}
    onError={(e) => {
      // Fallback: hide the image div, show only background color
      e.currentTarget.style.display = 'none';
    }}
  />
</div>
```

The fallback background color ensures the page remains usable even if the image fails to load.

### Font Loading Failures

**Scenario:** Pixelify Sans font fails to load from Google Fonts

**Handling:**
Next.js font optimization automatically provides fallback fonts. We'll specify a fallback stack:

```typescript
const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  fallback: ["monospace", "system-ui"],
});
```

Monospace fonts provide a similar blocky aesthetic if the pixel font fails.

## Responsive Design

### Breakpoint Strategy

**Mobile (< 640px):**
- Title: 2rem (32px)
- Button: 1.25rem (20px)
- Padding: 1rem horizontal
- Background: `background-position: center center`

**Tablet (640px - 1024px):**
- Title: 4rem (64px)
- Button: 1.5rem (24px)
- Padding: 2rem horizontal
- Background: `background-position: center center`

**Desktop (> 1024px):**
- Title: 5rem (80px)
- Button: 2rem (32px)
- Padding: 4rem horizontal
- Background: `background-position: center center`

### Background Image Positioning

The background image features a central cauldron that must remain visible across all screen sizes. CSS approach:

```css
.bg-image {
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
}

@media (max-width: 640px) {
  .bg-image {
    background-size: auto 100%;
    background-position: center center;
  }
}
```

On very narrow screens, switching to `auto 100%` ensures the full height is visible, even if horizontal edges are cropped.

## Accessibility Considerations

### Color Contrast

- Title (white on dark): Contrast ratio ~15:1 (WCAG AAA)
- Button (dark on lime): Contrast ratio ~8:1 (WCAG AAA)
- Text shadows enhance readability without compromising contrast

### Keyboard Navigation

- Build button remains fully keyboard accessible (native `<button>` or `<Link>` with button styling)
- Focus states will use a bright outline for visibility against the dark background:

```css
.pixel-button:focus-visible {
  outline: 3px solid #ffffff;
  outline-offset: 4px;
}
```

### Screen Readers

- Semantic HTML maintained (`<h1>` for title, `<button>` or `<Link>` for CTA)
- Alt text not needed for decorative background image (applied via CSS)
- Page title in metadata remains descriptive

## Performance Optimization

### Image Optimization

1. **Compression:** Use TinyPNG or similar to reduce file size to ~300-500KB
2. **Format:** PNG for pixel-art (preserves sharp edges better than JPEG)
3. **Dimensions:** 1920x1080px (standard Full HD) provides good quality without excessive file size
4. **Loading:** Background image loads immediately (critical for first impression)

### Font Loading Strategy

Next.js font optimization automatically:
- Inlines font CSS in the document head
- Preloads font files
- Eliminates layout shift with `font-display: swap`

### CSS Optimization

- Use Tailwind utility classes where possible (tree-shaken in production)
- Custom CSS for pixel-specific styles added to `globals.css`
- Avoid heavy animations on the background (static image only)

## Testing Strategy

### Visual Regression Testing

**Manual Testing Checklist:**
1. Verify background image displays correctly on:
   - Chrome (desktop & mobile)
   - Safari (desktop & mobile)
   - Firefox (desktop)
2. Verify font renders correctly (no FOUT/FOIT)
3. Verify button hover/active states work
4. Test on various screen sizes (320px to 2560px width)

### Accessibility Testing

1. **Keyboard Navigation:**
   - Tab to Build button
   - Press Enter to navigate
   - Verify focus outline is visible

2. **Screen Reader Testing:**
   - Test with VoiceOver (macOS) or NVDA (Windows)
   - Verify title and button are announced correctly

3. **Contrast Testing:**
   - Use browser DevTools or WebAIM Contrast Checker
   - Verify all text meets WCAG AA minimum (AAA preferred)

### Performance Testing

1. **Lighthouse Audit:**
   - Target: Performance score > 90
   - Target: Accessibility score = 100
   - Target: LCP < 2.5s

2. **Network Throttling:**
   - Test on "Fast 3G" to ensure acceptable load time
   - Verify fallback background color displays immediately

### Cross-Browser Testing

**Priority Browsers:**
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Edge (latest)

**Known Considerations:**
- Safari may render text-shadow differently (test glow effect)
- Mobile browsers may handle background-attachment differently (use `scroll` not `fixed`)

## Migration Strategy

### Preserving Existing Content

The current landing page has multiple sections (hero, features, tech showcase, CTA, footer). Options:

**Option A: Complete Replacement (Recommended)**
- Replace entire landing page with new pixel-art design
- Move existing content to a new `/about` or `/features` page
- Simplest implementation, cleanest user experience

**Option B: Hybrid Approach**
- Keep pixel-art hero section
- Retain feature sections below with adapted styling
- More content but risks visual inconsistency

**Recommendation:** Option A provides the strongest first impression and aligns with the "magical" branding. Existing content can be repurposed elsewhere if needed.

### Rollback Plan

1. Create a backup of current `src/app/page.tsx` as `src/app/page.backup.tsx`
2. Implement new design in `src/app/page.tsx`
3. If issues arise, restore from backup
4. Use feature flags if gradual rollout is desired (not necessary for this scope)

## Future Enhancements

While out of scope for this initial implementation, potential future enhancements include:

1. **Animated Cauldron:** CSS or Lottie animation for bubbling effect
2. **Particle Effects:** Floating sparkles using canvas or CSS animations
3. **Sound Effects:** Optional magical sound on button hover/click
4. **Multiple Themes:** Allow users to toggle between pixel-art and modern themes
5. **Interactive Elements:** Clickable objects in the scene that reveal features

These enhancements should be considered only after validating user response to the base redesign.
