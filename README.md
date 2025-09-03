# AWAKE – Meta-AI OS Prototype

A modern, responsive AI chat interface that provides access to multiple AI models through a unified interface. Built with React, TypeScript, and Tailwind CSS, featuring stunning animations and a dark cyberpunk aesthetic.

![AWAKE Demo](https://img.shields.io/badge/Status-Production_Ready-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan)

## ✨ Features

- **Multi-Model AI Chat**: Support for GPT, Claude, LLaMA, and auto-selection
- **Real-time Responses**: Streaming AI responses with elegant loading states
- **Automation Hub**: Keyword detection for simulated automation actions
- **Modern UI**: Dark theme with gradient backgrounds and smooth animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **No Backend Required**: Client-side only for easy Vercel deployment

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/awake-meta-ai)

### Environment Variables

After deploying, add these environment variables in your Vercel dashboard:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | ✅ Yes |
| `DATABASE_URL` | Your Database connection string | ✅ Yes |

## 🔧 Converting to Next.js for Vercel

Since Vercel is optimized for Next.js, here's how to convert this React app to Next.js:

### 1. Install Next.js Dependencies

```bash
npm install next@latest react@latest react-dom@latest
npm install --save-dev @types/node
```

### 2. Update package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 3. Create Next.js Configuration

Create `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig
```

### 4. Convert File Structure

```
awake-meta-ai/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── api/
│       └── chat/
│           └── route.ts   # API route (optional)
├── components/
│   └── ui/               # Reusable components
├── lib/                  # Utilities
├── public/              # Static assets
└── package.json
```

### 5. Update Root Layout (app/layout.tsx)

```tsx
import './globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'

const queryClient = new QueryClient()

export const metadata = {
  title: 'AWAKE – Meta-AI OS Prototype',
  description: 'Your unified AI assistant powered by multiple language models',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
```

### 6. Update Home Page (app/page.tsx)

```tsx
'use client'

// Move your existing home page content here
// Import all the same components and hooks
import { useState } from 'react'
// ... rest of your imports

export default function HomePage() {
  // Your existing home page component logic
  return (
    // Your existing JSX
  )
}
```

### 7. Client-Side API Calls

Create `lib/openrouter.ts` for client-side API calls:

```typescript
const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

export async function chatWithAI(message: string, model: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AWAKE Meta-AI OS'
    },
    body: JSON.stringify({
      model: getModelMapping(model),
      messages: [{ role: 'user', content: message }],
      max_tokens: 1000,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error('Failed to get AI response')
  }

  return response.json()
}
```

## 🎨 UI Enhancements

### Modern Dark Theme
- **Gradient Backgrounds**: Radial gradients for depth
- **Glass Morphism**: Backdrop blur effects
- **Neon Accents**: Bright cyan highlights
- **Smooth Animations**: Cubic-bezier transitions

### Animation Classes
- `.fade-in` - Smooth entrance animations
- `.slide-up` - Bottom-to-top transitions  
- `.scale-in` - Scale entrance effects
- `.glow-pulse` - Pulsing glow effects
- `.hover-lift` - 3D hover elevation
- `.hover-glow` - Border glow on hover

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## 🔑 Getting OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for a free account
3. Navigate to the "Keys" section
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-`)

## 🚀 Manual Deployment Steps

### Option 1: Direct Vercel Deployment

1. **Fork/Clone Repository**
   ```bash
   git clone https://github.com/yourusername/awake-meta-ai.git
   cd awake-meta-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Convert to Next.js** (follow steps above)

4. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

5. **Set Environment Variables**
   - Go to Vercel dashboard
   - Navigate to your project settings
   - Add `NEXT_PUBLIC_OPENROUTER_API_KEY`

### Option 2: GitHub Integration

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/awake-meta-ai.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Visit [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables**
   - In project settings, add your OpenRouter API key

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   └── ...
├── pages/               # Page components
├── lib/                 # Utilities and helpers
├── hooks/              # Custom React hooks
└── styles/             # Global styles
```

## 🎯 Features Overview

### AI Models Supported
- **GPT**: OpenAI's latest models
- **Claude**: Anthropic's Claude models  
- **LLaMA**: Meta's LLaMA models
- **Auto**: Random model selection

### Automation Detection
- **Email** keywords trigger email simulation
- **Task** keywords trigger Jira task creation
- **Slack** keywords trigger Slack messaging

### Performance Optimizations
- **React Query**: Efficient API state management
- **CSS Animations**: Hardware-accelerated transitions
- **Lazy Loading**: Component code splitting
- **Responsive Images**: Optimized asset delivery

## 📱 Browser Support

- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙋‍♂️ Support

If you have questions or need help:

1. Check the [Issues](https://github.com/yourusername/awake-meta-ai/issues) page
2. Create a new issue with detailed information
3. Join our [Discord community](https://discord.gg/awake-ai)

---

**Powered by many AIs, fused into one — AWAKE**