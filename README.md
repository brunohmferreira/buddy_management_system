# Buddy Management System

A comprehensive mentorship management platform designed to streamline employee onboarding through structured pairing between experienced employees (buddies) and new hires.

## 📋 Overview

The **Buddy Management System** facilitates effective knowledge transfer and smoother integration of new employees into the company. It provides role-based access control, task management, meeting scheduling, and comprehensive tracking of buddy-new hire relationships.

## ✨ Key Features

### 1. **Role-Based Access Control**
- **Admin**: Full system access, manage all users, associations, and settings
- **Buddy**: Manage their profile, view assigned new hires, create and track tasks and meetings
- **New Hire**: View assigned buddy, track onboarding progress, participate in meetings
- **User**: Basic system access

### 2. **Dashboard**
At-a-glance metrics and quick actions:
- Total buddies, new hires, active associations, and pending tasks
- Quick action buttons for common operations:
  - Add Buddy
  - Add New Hire
  - Create Task
  - Schedule Meeting

### 3. **Buddy Management**
- List all buddies with advanced filtering (name, team, level, status)
- Create and edit buddy profiles
- Track buddy availability (available, unavailable, inactive)
- Manage buddy details and assignments

### 4. **New Hire Management**
- List and filter new hires by name, team, level, and status
- Create new hire profiles with start dates
- Edit new hire information
- Track onboarding status (onboarding, active, completed, inactive)

### 5. **Association Management**
- Create buddy-new hire pairings (admin only)
- View and filter all associations
- Track association status and timeline
- Manage buddy-new hire relationships throughout the onboarding process

### 6. **Task Management**
- Create tasks associated with buddy-new hire pairs
- Task properties: title, description, useful links
- Track task status and completion
- Assign and manage tasks for onboarding milestones

### 7. **Meeting Management**
- Schedule meetings between buddies and new hires
- Record meeting notes and outcomes
- Track meeting history and follow-ups
- Maintain communication records

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI
- **React Query (@tanstack/react-query)** - Server state management
- **tRPC Client** - Type-safe API client
- **React Hook Form** - Form state management
- **Wouter** - Lightweight routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **tRPC** - Type-safe RPC framework
- **Drizzle ORM** - TypeScript-first ORM
- **MySQL** - Database

### Development & Deployment
- **ESBuild** - JavaScript bundler
- **Vitest** - Unit testing framework
- **Prettier** - Code formatter
- **TypeScript** - Type checking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or compatible runtime
- pnpm (package manager)
- MySQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd buddy_management_system
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```bash
   DATABASE_URL=mysql://user:password@localhost:3306/buddy_system
   # Add other required environment variables (OAuth, AWS, etc.)
   ```

4. **Initialize the database**
   ```bash
   pnpm run db:push
   ```

5. **Seed the database (optional)**
   ```bash
   node seed-db.mjs
   ```

### Development

Start the development server:
```bash
pnpm run dev
```

The server will automatically find an available port starting from 3000 and log the URL to access the application.

### Build

Build for production:
```bash
pnpm run build
```

Start the production server:
```bash
pnpm run start
```

## 📁 Project Structure

```
buddy_management_system/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   │   └── ui/          # shadcn/ui component library
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React context providers (Theme)
│   │   ├── lib/             # Utilities (tRPC, helpers)
│   │   └── App.tsx          # Root application component
│   └── index.html           # HTML entry point
├── server/                    # Backend application
│   ├── _core/               # Core server functionality
│   │   ├── index.ts         # Server entry point
│   │   ├── context.ts       # tRPC context setup
│   │   ├── trpc.ts          # tRPC instance
│   │   ├── oauth.ts         # OAuth authentication
│   │   ├── cookies.ts       # Cookie management
│   │   ├── env.ts           # Environment variables
│   │   ├── llm.ts           # LLM integration
│   │   ├── notification.ts  # Notification system
│   │   └── [other utilities]
│   ├── db.ts                # Database queries
│   ├── routers.ts           # API route definitions
│   ├── storage.ts           # File storage handling
│   └── [feature].test.ts    # Tests
├── drizzle/                  # Database schema and migrations
│   ├── schema.ts            # Database schema definitions
│   └── migrations/          # Migration files
├── shared/                   # Shared types and constants
│   ├── types.ts             # Type definitions
│   ├── const.ts             # Constants
│   └── _core/errors.ts      # Error types
└── patches/                  # Patch files for dependencies
```

## 📚 API Routes

The application uses tRPC for type-safe API calls. Key router procedures include:

- **Buddies**: Create, read, update, delete buddy records
- **New Hires**: Manage new hire onboarding profiles
- **Associations**: Pair buddies with new hires
- **Tasks**: Create and track onboarding tasks
- **Meetings**: Schedule and record meetings
- **Dashboard**: Retrieve metrics and statistics
- **Authentication**: User login, logout, and authorization

## 🎨 Theming

The application supports light and dark modes with company-branded colors:
- **Colors**: Red, black, and white
- **Font**: Rubik
- **Storage**: Theme preference is persisted to localStorage

Access theme context via `ThemeContext.tsx` in the client application.

## 🔐 Authentication & Authorization

- **OAuth Integration**: Uses Manus OAuth for authentication
- **Role-Based Access Control**: Different permission levels for Admin, Buddy, and New Hire roles
- **Session Management**: Secure cookie-based sessions
- **Protected Procedures**: tRPC procedures are protected based on user roles

## 📦 Database Schema

The system uses MySQL with Drizzle ORM. Key tables include:

- **users**: User accounts and authentication
- **buddies**: Buddy profiles and information
- **newHires**: New hire onboarding records
- **associations**: Buddy-new hire pairings
- **tasks**: Onboarding tasks and milestones
- **meetings**: Meeting records
- **meetingNotes**: Notes from meetings
- **taskAssignments**: Task-to-user assignments

Run `pnpm run db:push` to apply migrations.

## 🧪 Testing

Run tests with:
```bash
pnpm run test
```

Test files are located alongside their source code with `.test.ts` extension.

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server |
| `pnpm run build` | Build for production |
| `pnpm run start` | Start production server |
| `pnpm run check` | Type check with TypeScript |
| `pnpm run format` | Format code with Prettier |
| `pnpm run test` | Run tests with Vitest |
| `pnpm run db:push` | Generate migrations and push to database |

## 📝 Environment Variables

Key environment variables needed:

```bash
DATABASE_URL                  # MySQL connection string
NODE_ENV                      # development or production
# OAuth credentials
# AWS S3 configuration (if using file uploads)
# LLM API keys (if using AI features)
```

See `.env` file for a complete list.

## 🚦 Port Management

The development server automatically finds an available port starting from 3000. Check the console output for the actual port being used.

## 📖 Additional Documentation

- **Demo Guide**: See `DEMO_GUIDE.md` for a comprehensive user guide
- **Project Status**: See `todo.md` for ongoing development tasks

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and add tests for new features.

## 📞 Support

For issues or questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ for streamlined employee onboarding**
