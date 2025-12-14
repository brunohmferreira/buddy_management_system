# Buddy System - Demo & User Guide

## Overview

The **Buddy System** is a comprehensive mentorship management platform designed to streamline the employee onboarding process. It facilitates structured pairing between experienced employees (buddies) and new hires, enabling effective knowledge transfer and smoother integration into the company.

## Key Features

### 1. **Role-Based Access Control**
- **Admin**: Full system access, can manage all users, associations, and settings
- **Buddy**: Can manage their own profile, view assigned new hires, create and track tasks and meetings
- **New Hire**: Can view their assigned buddy, track onboarding progress, and participate in meetings
- **User**: Basic access to the system

### 2. **Dashboard**
The main dashboard provides at-a-glance metrics:
- **Total Buddies**: Number of registered mentors
- **New Hires**: Number of employees in onboarding
- **Active Associations**: Current buddy-new hire pairings
- **Pending Tasks**: Tasks awaiting completion

Quick action buttons allow rapid access to common operations:
- Add Buddy
- Add New Hire
- Create Task
- Schedule Meeting

### 3. **Buddy Management**
- **List all buddies** with filtering by name, team, level, and status
- **Create buddy profiles** via modal dialog
- **Edit buddy information** (nickname, team, level, status)
- **Track buddy availability** (available, unavailable, inactive)

### 4. **New Hire Management**
- **List all new hires** with filtering by name, team, level, and status
- **Create new hire profiles** with start date
- **Edit new hire information**
- **Track onboarding status** (onboarding, active, completed, inactive)

### 5. **Association Management**
- **Create buddy-new hire pairings** (admin only)
- **View all associations** with filtering by buddy name, new hire name, and status
- **Track association status** (active, completed, paused, inactive)
- **Display association timeline** (start date and end date)

### 6. **Task Management**
- **Create tasks** associated with specific buddy-new hire pairs
- **Task properties**:
  - Title and description
  - Useful links for resources
  - Status (pending, in progress, completed, overdue)
  - Due date
  - Multiple assignees
- **Task summary** showing counts by status
- **Edit and update tasks** as progress is made

### 7. **Meeting Management**
- **Schedule meetings** between buddies and new hires
- **Meeting details**: Title, date, and time
- **Collaborative notes**: Both buddy and new hire can add notes
- **Mark meetings as completed**
- **View meeting history** and notes

## User Interface

### Design System
The interface uses the company's corporate colors:
- **Red** (rgb(225, 0, 42)): Primary actions and highlights
- **Black** (#33393d): Text and dark elements
- **White** (rgb(255, 255, 255)): Background and cards

### Font
All text uses **Rubik** font family for consistency.

### Theme Support
- **Light Mode**: Clean, professional appearance with light backgrounds
- **Dark Mode**: Eye-friendly dark theme for extended use
- **Theme Toggle**: Easy switching via button in sidebar or header

### Navigation
- **Sidebar Navigation**: Always accessible with collapsible menu
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Quick Access**: Direct links to all main sections

## Getting Started

### 1. Login
Users authenticate via Manus OAuth. The system automatically assigns roles based on user type.

### 2. First Steps for Admin
1. Create buddy profiles for experienced employees
2. Create new hire profiles for incoming employees
3. Create associations pairing buddies with new hires
4. Create onboarding tasks and schedule meetings

### 3. First Steps for Buddy
1. View your assigned new hire(s)
2. Create and track onboarding tasks
3. Schedule regular check-in meetings
4. Add notes during meetings to track progress

### 4. First Steps for New Hire
1. View your assigned buddy
2. Track your onboarding tasks
3. Attend scheduled meetings
4. Provide feedback during meetings

## Demo Scenario

The system comes with pre-populated demo data:

### Users
- **Admin User**: Full system access
- **John Smith** (Buddy): Engineering team, Senior level
- **Sarah Johnson** (Buddy): Design team, Mid level
- **Alice Brown** (New Hire): Engineering team, Junior level
- **Bob Wilson** (New Hire): Design team, Junior level

### Associations
- John Smith ↔ Alice Brown (Engineering onboarding)
- Sarah Johnson ↔ Bob Wilson (Design onboarding)

### Sample Tasks
- Setup Development Environment (In Progress)
- Review Company Policies (Pending)
- Complete Design Training (Pending)

### Sample Meetings
- Onboarding Kickoff (Engineering)
- Design Review (Design)

## Best Practices

### For Admins
1. Create clear buddy-new hire pairings based on team and experience level
2. Define specific onboarding tasks with clear due dates
3. Schedule regular check-in meetings (weekly recommended)
4. Monitor progress through the dashboard

### For Buddies
1. Schedule regular meetings with your new hire
2. Create specific, actionable tasks
3. Provide resources and useful links
4. Document progress in meeting notes
5. Celebrate milestones and completed tasks

### For New Hires
1. Attend all scheduled meetings
2. Complete assigned tasks on time
3. Ask questions and take notes
4. Provide feedback to your buddy
5. Mark tasks as complete when done

## Technical Details

### Architecture
- **Frontend**: React 19 with TypeScript
- **Backend**: Node.js with Express and tRPC
- **Database**: MySQL/TiDB with Drizzle ORM
- **Authentication**: Manus OAuth
- **Styling**: Tailwind CSS 4 with shadcn/ui components

### Database Schema
- **users**: User accounts and roles
- **buddies**: Buddy profiles
- **newHires**: New hire profiles
- **associations**: Buddy-new hire pairings
- **tasks**: Onboarding tasks
- **taskAssignments**: Task responsibility tracking
- **meetings**: Scheduled meetings
- **meetingNotes**: Collaborative meeting notes

### API
All operations are exposed through tRPC procedures with full type safety:
- Dashboard metrics
- CRUD operations for all entities
- Role-based access control
- Collaborative features (meeting notes)

## Testing

The system includes comprehensive automated tests covering:
- Authentication and authorization
- Role-based access control
- User operations
- Dashboard metrics
- Error handling

Run tests with: `pnpm test`

## Support & Feedback

For issues or feature requests, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: December 2025
