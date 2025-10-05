# Assets Structure

This folder contains all image assets for the KCCW project.

## Folder Structure

```
src/assets/images/
├── logos/           # Organization and project logos
│   ├── Mlody_Krakow_LOGO.png
│   ├── Mlody_Krakow_LOGO-bez-tla.png
│   └── Mlody_Krakow_LOGO_cmyk_pion.png
├── icons/           # UI icons and small graphics
├── backgrounds/     # Background images and patterns
├── avatars/         # User profile pictures and avatars
└── README.md        # This file
```

## Logo Files

### Mlody Krakow Logos
- **Mlody_Krakow_LOGO.png** - Main logo (standard version)
- **Mlody_Krakow_LOGO-bez-tla.png** - Logo without background (transparent)
- **Mlody_Krakow_LOGO_cmyk_pion.png** - CMYK vertical logo (for print)

## Usage

To import and use these images in your components:

```typescript
// Import logo
import logo from '../assets/images/logos/Mlody_Krakow_LOGO.png';

// Use in JSX
<img src={logo} alt="Młody Kraków Logo" />
```

## Guidelines

- Keep file names descriptive and consistent
- Use appropriate formats (PNG for logos with transparency, JPG for photos)
- Optimize images for web use
- Maintain consistent naming conventions
