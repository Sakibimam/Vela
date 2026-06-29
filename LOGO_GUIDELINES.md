# Vela Logo Guidelines

## Logo Concept

The Vela logo combines three core elements:

1. **The "V" Shape** - Represents both:
   - A sail (Vela = sail in Latin, referencing the constellation)
   - A shield (privacy and security)
   - A valley/corridor (cross-border remittance corridors)

2. **Shield Background** - Subtle geometric shape suggesting:
   - Protection and security
   - ZK-proof verification
   - Institutional trust

3. **Constellation Dots** - Small nodes representing:
   - Stellar network
   - Distributed system
   - Connection points between sender/receiver

## Color Palette

```
Primary Gradient: #3B82F6 → #8B5CF6 (blue to purple)
- Blue (#3B82F6): Trust, stability, blockchain
- Purple (#8B5CF6): Privacy, technology, innovation

Supporting Colors:
- Space Dark: #0B0F19 (backgrounds)
- Slate Gray: #64748B (secondary text)
- White: #FFFFFF (text on dark)
```

## Logo Variations

### 1. Full Logo (`logo.svg`)
- Size: 200x200px
- Use: App icons, social media profiles, large displays
- Minimum size: 48x48px

### 2. Wordmark (`logo-wordmark.svg`)
- Size: 400x120px
- Use: Headers, landing pages, marketing materials
- Includes tagline: "PRIVATE REMITTANCE"

### 3. Favicon (`favicon.svg`)
- Size: 32x32px
- Use: Browser tabs, bookmarks
- Simplified version with just the "V"

## Usage Rules

### ✅ Do:
- Use on dark backgrounds (#0B0F19, #111827)
- Maintain clear space (minimum 20% of logo height around all sides)
- Scale proportionally
- Use SVG format when possible for crisp rendering

### ❌ Don't:
- Distort or stretch the logo
- Change the gradient colors
- Add effects (shadows, glows, outlines)
- Place on busy backgrounds without a container
- Use on light backgrounds without adjusting opacity

## Technical Specs

- Format: SVG (vector)
- Fallback: PNG with transparent background
- Font: Inter (weights: 400, 700)
- Gradient: Linear, 0° to 100°

## Brand Personality

The logo conveys:
- **Professional**: Clean lines, minimal design
- **Trustworthy**: Shield shape, institutional colors
- **Innovative**: Gradient, modern typography
- **Private**: Subtle, not flashy
- **Global**: Network nodes, constellation reference

## Mockups

The logo works well on:
- Dark app headers
- Social media banners
- Documentation covers
- Pitch decks
- GitHub repository header

## Export Sizes

```
Favicon: 16x16, 32x32, 48x48
App Icon: 192x192, 512x512
Social Media: 400x400 (square), 1200x630 (og:image)
Print: Vector SVG or 300dpi PNG
```

## Files Location

```
public/
├── logo.svg              # Main logo mark
├── logo-wordmark.svg     # Logo with text
└── favicon.svg           # Simplified favicon
```

## Next Steps

To generate PNG versions for broader compatibility:

```bash
# Install librsvg (if not already installed)
brew install librsvg

# Convert to PNG at different sizes
rsvg-convert -w 512 -h 512 public/logo.svg > public/logo-512.png
rsvg-convert -w 192 -h 192 public/logo.svg > public/logo-192.png
rsvg-convert -w 48 -h 48 public/favicon.svg > public/favicon-48.png
rsvg-convert -w 32 -h 32 public/favicon.svg > public/favicon-32.png
```

## Brand Voice Alignment

Logo complements the brand voice:
- Dark, professional aesthetic (stellar.org inspired)
- Clean typography (Inter font)
- Generous whitespace
- Subtle gradients and glassmorphism
- Privacy-first, not "crypto bro"
