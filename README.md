# Full-Stack Application Boilerplate

This is a modern full-stack application boilerplate with the following features:

## Frontend (app/)
- React with Vite
- Tailwind CSS for styling
- Prettier for code formatting
- Component-based architecture
- Responsive design support

## Backend (api/)
- Node.js/Express server
- RESTful API structure
- Modular architecture
- Environment configuration

## Getting Started

1. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd app
   npm install

   # Install backend dependencies
   cd ../api
   npm install
   ```

2. Start development servers:
   ```bash
   # Start frontend (from app directory)
   npm run dev

   # Start backend (from api directory)
   npm run dev
   ```


## Project Structure

```
├── app/                    # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service functions
│   │   ├── utils/        # Utility functions
│   │   └── assets/       # Static assets
│   └── public/           # Public assets
│
└── api/                   # Backend application
    └── src/
        ├── controllers/   # Route controllers
        ├── models/        # Data models
        ├── services/      # Business logic
        ├── utils/         # Utility functions
        └── config/        # Configuration files
```

