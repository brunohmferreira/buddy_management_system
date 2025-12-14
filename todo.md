# Buddy System - Project TODO

## Database & Schema
- [x] Create database schema with all tables (users, buddies, newHires, associations, tasks, meetings, meetingNotes, taskAssignments)
- [x] Set up Drizzle migrations and push to database
- [x] Create database query helpers in server/db.ts

## Authentication & Authorization
- [x] Implement role-based access control (admin, buddy, newHire)
- [x] Create protected procedures for each role
- [x] Implement user profile and role management
- [x] Add logout functionality

## Backend APIs
- [x] Create tRPC routers for buddies management
- [x] Create tRPC routers for newHires management
- [x] Create tRPC routers for associations management
- [x] Create tRPC routers for tasks management
- [x] Create tRPC routers for meetings management
- [x] Create tRPC routers for meetingNotes management
- [x] Create tRPC routers for dashboard metrics

## Frontend - Theme & Layout
- [x] Set up light/dark mode with theme persistence
- [x] Create DashboardLayout component with sidebar navigation
- [x] Implement theme toggle in header
- [x] Configure Tailwind with company colors (red, black, white)
- [x] Set up Rubik font family globally

## Frontend - Components
- [x] Create reusable modal/dialog components
- [x] Create collapsible filter component
- [x] Create status badge component
- [x] Create quick action buttons component
- [x] Create task status summary cards
- [x] Create metric cards for dashboard

## Frontend - Pages
- [x] Create Login page (via Manus OAuth)
- [x] Create Dashboard/Home page with metrics and quick actions
- [x] Create Buddies listing page with filters and modals
- [x] Create NewHires listing page with filters and modals
- [x] Create Tasks management page with status summary
- [x] Create Meetings management page with notes
- [x] Create Associations management page with filters
- [ ] Create User profile/settings page

## Testing
- [ ] Write unit tests for authentication procedures
- [ ] Write unit tests for CRUD operations
- [ ] Write integration tests for main workflows
- [ ] Create test data/seed script for demo scenario
- [ ] Create demo user accounts and associations

## Final Delivery
- [ ] Review all pages for UI/UX consistency
- [ ] Test light/dark mode across all pages
- [ ] Verify all filters and modals work correctly
- [ ] Test responsive design on mobile/tablet
- [ ] Create checkpoint and prepare for deployment

## UI/UX Adjustments (User Requested)
- [x] Remove System Color Reference block from Dashboard
- [x] Add next meeting date block to Dashboard
- [x] Display buddy and new hire names in Meetings page (instead of association ID)
- [x] Display buddy and new hire names in Tasks page (instead of association ID)
- [x] Add undo option to unmark meetings as done
- [x] Move meeting notes to dialog/popup instead of sidebar
