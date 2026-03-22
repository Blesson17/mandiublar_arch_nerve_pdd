# ImplantAI Shared Design System

## Source of Truth
Derived from the website styles in `website/frontend/src/styles/main.css`, `dashboard.css`, and `settings.css`.

## Color Tokens
- Primary: `#1E4ED8` (Royal Blue)
- Primary Dark: `#1E3A8A`
- Primary Light: `#3B82F6`
- Accent: `#0D9488` (Teal)
- Warning: `#F59E0B`
- Danger: `#EF4444`
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Border: `#E2E8F0`
- Text Main: `#111827`
- Text Secondary: `#4B5563`
- Text Light: `#9CA3AF`

## Typography Scale
Website baseline uses Inter.
- H1: 1.5rem to 2.25rem, weight 700
- H2: 1.75rem to 2rem, weight 700
- Section Title: 1.1rem to 1.25rem, weight 700
- Body: 0.95rem to 1rem, weight 400/500
- Caption/Meta: 0.75rem to 0.85rem, weight 500/600

Compose mapping:
- `headlineSmall` -> Page title
- `titleLarge` -> Section heading
- `bodyMedium` -> Primary body text
- `labelSmall` -> Meta labels

## Buttons
Primary button:
- Background: `#2563EB`/primary token family
- Radius: 8px
- Font weight: 600
- Padding: 0.75rem x 1.5rem (web), 12dp x 24dp (mobile)
- Elevation: subtle (web `0 4px 6px -1px rgba(37,99,235,0.2)`, mobile 2dp-4dp)

Secondary/outlined:
- Background: white
- Border: 1px `#E2E8F0`
- Radius: 8px
- Hover: border darkens to `#CBD5E1`, background `#F8FAFC`

Danger action:
- Text: `#EF4444`
- Hover background: `#FEF2F2`

## Surface and Layout Tokens
- Card radius: 12px (16px for larger hero/auth cards)
- Sidebar nav item radius: 8px to 12px
- Focus ring: blue tint (`rgba(37,99,235,0.1)`) with border `#1E4ED8`
- Shadows:
  - card-shadow: `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)`
  - light-card-shadow: `0 1px 3px rgba(0,0,0,0.05)`

## Android Implementation Notes
Implemented in:
- `app/src/main/java/com/s4/belsson/ui/theme/Color.kt`
- `app/src/main/java/com/s4/belsson/ui/theme/Theme.kt`
- `app/src/main/res/values/themes.xml`

Rules:
- Keep dynamic Material color disabled for brand consistency.
- Use the same semantic color roles across web and mobile (primary/action, warning, danger, background, text).
- Preserve button corner radius and compact vertical rhythm from web, but do not replicate desktop layout patterns.
