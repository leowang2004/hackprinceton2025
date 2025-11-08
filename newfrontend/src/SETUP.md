# WingsPay Demo - Setup Instructions

## Project Structure

```
wingspay-demo/
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── ConnectedMerchantsLanding.tsx
│   │   ├── AmazonProductPage.tsx
│   │   ├── ShoppingCart.tsx
│   │   ├── ModernCheckout.tsx
│   │   ├── PaymentPlanSelection.tsx
│   │   ├── OrderConfirmation.tsx
│   │   ├── figma/
│   │   │   └── ImageWithFallback.tsx
│   │   └── ui/
│   │       └── (all shadcn components)
│   └── styles/
│       └── globals.css
├── index.html
└── package.json
```

## Required Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "latest",
    "tailwindcss": "^4.0.0"
  }
}
```

## Installation Steps

### 1. Create a new React + TypeScript project

```bash
# Using Vite (recommended)
npm create vite@latest wingspay-demo -- --template react-ts
cd wingspay-demo
```

### 2. Install dependencies

```bash
npm install
npm install lucide-react
npm install -D tailwindcss@next @tailwindcss/vite@next
```

### 3. Configure Tailwind CSS v4

Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 4. Copy Files

Copy all files from this Figma Make project to your local project:
- Copy `App.tsx` to `src/App.tsx`
- Copy all components from `components/` to `src/components/`
- Copy `styles/globals.css` to `src/styles/globals.css`
- Copy all UI components from `components/ui/` to `src/components/ui/`

### 5. Update your main entry file

Update `src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 6. Run the project

```bash
npm run dev
```

## Flow Overview

1. **Landing Page** - Connected merchants dashboard
2. **Product Page** - Amazon product view
3. **Cart** - Shopping cart with items
4. **Checkout** - Payment method selection
5. **Payment Plans** - WingsPay installment options
6. **Confirmation** - Order success screen

## Key Features

- Modern fintech design with gradient accents
- Fully responsive layout
- Smooth transitions and animations
- Complete checkout flow
- WingsPay payment plan selection
- Professional UI/UX

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS v4
- Lucide React (icons)
- Shadcn/ui components
- Vite (build tool)

## Notes

- All images use Unsplash URLs (will work in production)
- No backend required - pure frontend demo
- All data is mock/demo data
- Ready for integration with real APIs

---

Built with Figma Make
