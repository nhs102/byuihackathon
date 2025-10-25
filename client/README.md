# Brand Identity Design System - Frontend

This is the frontend application built with **React**, **Vite**, and **TypeScript**.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase project (for authentication and database)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:3000/api
   ```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui components
│   └── ...          # Custom components
├── pages/           # Page-level components
├── hooks/           # Custom React hooks
├── services/        # API and Supabase services
├── utils/           # Utility functions
├── styles/          # Global styles
├── data/            # Static/mock data
├── types/           # TypeScript types
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## 🔧 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Supabase** - Backend as a Service
- **React Router** - Routing

## 📚 Key Features

- ✅ Modern React with TypeScript
- ✅ Supabase authentication
- ✅ Beautiful UI with shadcn/ui
- ✅ Hot Module Replacement (HMR)
- ✅ Path aliases (`@/` → `src/`)
- ✅ ESLint configuration

## 🔐 Authentication

Authentication is handled through Supabase Auth. See `src/services/authService.ts` for available methods:

- `signUp()` - Register new user
- `signIn()` - Sign in with email/password
- `signOut()` - Sign out
- `getCurrentUser()` - Get current user
- `resetPassword()` - Reset password

## 🎨 Styling

This project uses:
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for pre-built components
- **CSS variables** for theming

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `VITE_API_URL` | Backend API URL (default: http://localhost:3000/api) |

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📖 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.io/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

