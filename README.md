# Job Board Platform - Frontend

A modern React + TypeScript frontend application for the Job Board Platform, built with Vite, Zustand, and integrated with the REST API.

## Features

- 🔐 **Authentication** - Login, Register, and JWT token management
- 📋 **Job Listings** - Browse, search, and filter jobs
- 📝 **Job Applications** - Apply to jobs with resume upload
- 🎨 **Modern UI** - Built with Tailwind CSS
- 📱 **Responsive Design** - Works on all devices
- 🔄 **State Management** - Zustand for global state
- 🛡️ **Type Safety** - Full TypeScript support

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── JobList.tsx
│   ├── JobCard.tsx
│   ├── JobDetails.tsx
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── stores/             # Zustand stores
│   ├── authStore.ts
│   ├── jobsStore.ts
│   ├── applicationsStore.ts
│   └── notificationsStore.ts
├── lib/                 # API client
│   └── api.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## API Integration

The app is fully integrated with the Job Board Platform API. All API endpoints are configured in `src/lib/api.ts` and use:

- JWT authentication with automatic token refresh
- Axios interceptors for request/response handling
- TypeScript types for all API responses
- Error handling and validation

## Environment Variables

- `VITE_API_BASE_URL` - Base URL for the API (default: http://localhost:8000)
- `VITE_API_VERSION` - API version (default: v1)

## Features Overview

### Authentication
- User registration and login
- JWT token management
- Protected routes
- User profile management

### Jobs
- Browse all available jobs
- Search and filter jobs
- View job details
- Apply to jobs (with resume upload)

### Applications
- View your applications
- Track application status
- Withdraw applications

### Notifications
- View notifications
- Mark as read
- Unread count badge

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier (if configured) for formatting

### State Management

The app uses Zustand for state management with separate stores for:
- Authentication (`authStore`)
- Jobs (`jobsStore`)
- Applications (`applicationsStore`)
- Notifications (`notificationsStore`)

## License

This project is part of the ALX Project Nexus.
