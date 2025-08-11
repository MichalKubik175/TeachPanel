# API Integration Documentation

## Overview
The frontend has been updated to use real API calls instead of mock data for Students and Groups management.

## API Configuration

### Backend URL
The backend API runs on `http://localhost:5152` by default. This is configured in:
- `src/config/api.js` - API configuration
- `src/app/api.js` - Axios instance with authentication

### Environment Variables
Create a `.env` file in the root directory with:
```
VITE_API_URL=http://localhost:5152
```

## API Endpoints

### Students API
- `GET /v1/students` - Get all students with pagination
- `GET /v1/students/{id}` - Get student by ID
- `POST /v1/students` - Create new student
- `PUT /v1/students/{id}` - Update student
- `DELETE /v1/students/{id}` - Delete student

### Groups API
- `GET /v1/groups` - Get all groups with pagination
- `GET /v1/groups/{id}` - Get group by ID
- `POST /v1/groups` - Create new group
- `PUT /v1/groups/{id}` - Update group
- `DELETE /v1/groups/{id}` - Delete group

## Components Updated

### 1. StudentsOverviewPage
- Removed mock data
- Uses `useStudentsAndGroups` hook
- Displays real students grouped by their groups
- Added Groups Management button

### 2. StudentManagementPage
- Removed mock data
- Uses real API calls for CRUD operations
- Proper error handling and loading states
- Form validation with Yup

### 3. GroupsManagementPage (New)
- Complete CRUD operations for groups
- Prevents deletion of groups with students
- Form validation and error handling

### 4. Custom Hooks
- `useStudentsAndGroups` - Manages students and groups state
- Handles loading states, errors, and API calls

## Data Models

### Student
```javascript
{
  id: string,
  name: string,
  totalScore: number,
  groupId: string
}
```

### Group
```javascript
{
  id: string,
  name: string
}
```

## Error Handling
- API errors are displayed as alerts
- Loading states during API calls
- Form validation with user-friendly messages
- Network error handling

## Authentication
- Uses Bearer token authentication
- Automatic token refresh
- Request/response interceptors for auth headers

## Running the Application

1. Start the backend API:
   ```bash
   cd TeachPanel/TeacherPanel/src/TeachPanel.Api
   dotnet run
   ```

2. Start the frontend:
   ```bash
   cd TeachPanel_FrontEnd/TeacherPanel_FrontEnd/teach-panel
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

## Notes
- All mock data has been removed
- Real-time data synchronization
- Proper pagination support
- Responsive error handling 