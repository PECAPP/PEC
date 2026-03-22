# Quick Reference Card

## Access College Settings
```
Admin Dashboard → "College Settings" button (top right)
OR
Direct URL: /admin/college-settings
```

## What You Can Set
- College name
- Tagline/motto
- Email & phone
- Website & address
- Logo (image upload)

## How to Use Settings in Code
```typescript
import { useCollegeSettings } from '@/hooks/useCollegeSettings';

export function MyComponent() {
  const { settings, loading } = useCollegeSettings();
  return <img src={settings?.logoUrl} alt="Logo" />;
}
```

## File Locations
| What | Where |
|------|-------|
| Settings Page | `src/pages/admin/CollegeSettings.tsx` |
| Hook | `src/hooks/useCollegeSettings.ts` (create this) |
| Admin Dashboard | `src/pages/dashboards/AdminDashboard.tsx` |
| Database | PostgreSQL (via backend API) |

## Storage Options
| Free Tier | Best For |
|-----------|----------|
| Cloud media storage | **Logo & docs** (recommended) |
| Cloudinary 10GB | **Images** (optimization) |
| AWS S3 5GB | **Enterprise** (scale) |

## Setup Storage (Later)
1. Read `STORAGE_SETUP_GUIDE.md`
2. Follow steps for your choice
3. Update `CollegeSettings.tsx` to upload instead of data URL

## Documentation
- `SETUP_COMPLETE.md` - What was built
- `STORAGE_SETUP_GUIDE.md` - Storage options
- `COLLEGE_SETTINGS_GUIDE.md` - How to use settings
- `COLLEGE_SETTINGS_INTEGRATION.md` - Code examples

## Common Tasks

### Display college logo
```typescript
const { settings } = useCollegeSettings();
return <img src={settings?.logoUrl} alt="College" />;
```

### Add to footer
```typescript
const { settings } = useCollegeSettings();
return (
  <footer>
    <img src={settings?.logoUrl} alt="Logo" />
    <p>{settings?.email}</p>
    <p>{settings?.phone}</p>
  </footer>
);
```

### Use in invoice
```typescript
const { settings } = useCollegeSettings();
return (
  <div>
    <img src={settings?.logoUrl} />
    <h1>{settings?.collegeName}</h1>
    <p>{settings?.tagline}</p>
  </div>
);
```

## Data Structure
```
collegeSettings/main/
├── collegeName: string
├── tagline: string
├── email: string
├── phone: string
├── website: string
├── address: string
├── logoUrl: string (data URL or storage URL)
├── lastUpdated: timestamp
└── updatedBy: string
```

## Quick Start
1. Go to Admin Dashboard
2. Click "College Settings"
3. Fill in college info
4. Upload logo (optional)
5. Click "Save Settings"
6. Use in components with `useCollegeSettings()` hook

## Troubleshooting
- **Logo not saving?** Check backend API and storage configuration
- **Logo not showing?** Check browser console for errors
- **Need storage help?** See `STORAGE_SETUP_GUIDE.md`
- **Want integration examples?** See `COLLEGE_SETTINGS_INTEGRATION.md`
