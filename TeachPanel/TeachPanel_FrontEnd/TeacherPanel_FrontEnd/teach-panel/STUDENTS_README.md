# Students Management System

This document describes the new students management functionality added to the Teacher Panel Frontend.

## Overview

The students management system consists of two main pages:

1. **Students Overview Page** (`/students`) - Displays all students organized by their groups
2. **Student Management Page** (`/students/manage`) - Allows adding, editing, and removing students

## Features

### Students Overview Page
- **Group-based Display**: Students are organized by their respective groups
- **Score Visualization**: Total scores are displayed with color coding:
  - Green: 90-100 (Excellent)
  - Blue: 80-89 (Good)
  - Red: Below 80 (Needs Improvement)
- **Sorting**: Students can be sorted by score (highest to lowest by default)
- **Navigation**: "Manage Students" button to access the management page

### Student Management Page
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Form Validation**: Using Formik and Yup for robust form validation
- **Group Assignment**: Students can be assigned to existing groups
- **Search & Filter**: Filter students by group, sort by name or score
- **Confirmation Dialogs**: Safe deletion with confirmation prompts

## File Structure

```
src/
├── pages/
│   └── Students/
│       ├── StudentsOverviewPage.jsx    # Overview page component
│       └── StudentManagementPage.jsx   # Management page component
├── services/
│   └── studentsApi.js                  # API service functions
└── main.jsx                           # Updated with new routes
```

## API Integration

### Current Implementation
The pages currently use mock data for demonstration. To integrate with real APIs:

1. **Update API Base URL**: Set `REACT_APP_API_BASE_URL` in your environment variables
2. **Replace Mock Data**: Use the provided API service functions in `src/services/studentsApi.js`

### API Endpoints Required

The system expects the following API endpoints:

#### Groups with Students
```
GET /api/groups/with-students
Response: Array of groups with nested students
```

#### Students CRUD
```
GET    /api/students          # Get all students
POST   /api/students          # Create new student
PUT    /api/students/:id      # Update student
DELETE /api/students/:id      # Delete student
GET    /api/students/:id      # Get student by ID
```

#### Groups
```
GET /api/groups              # Get all groups
```

### Data Structure

#### Group with Students
```javascript
{
  id: 1,
  name: "Group A - Advanced Mathematics",
  students: [
    {
      id: 1,
      name: "John Smith",
      totalScore: 95
    }
  ]
}
```

#### Student
```javascript
{
  id: 1,
  name: "John Smith",
  totalScore: 95,
  groupId: 1,
  groupName: "Group A - Advanced Mathematics"
}
```

#### Group
```javascript
{
  id: 1,
  name: "Group A - Advanced Mathematics"
}
```

## Integration Steps

### 1. Replace Mock Data with API Calls

#### In StudentsOverviewPage.jsx:
```javascript
import { studentsApi } from '../services/studentsApi';
import { useQuery } from '@tanstack/react-query';

const StudentsOverviewPage = () => {
  const { data: groupsData, isLoading, error } = useQuery({
    queryKey: ['groups-with-students'],
    queryFn: studentsApi.getGroupsWithStudents,
  });

  if (isLoading) return <Spin />;
  if (error) return <div>Error loading data</div>;

  // Use groupsData instead of mock data
};
```

#### In StudentManagementPage.jsx:
```javascript
import { studentsApi } from '../services/studentsApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const StudentManagementPage = () => {
  const queryClient = useQueryClient();
  
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getAllStudents,
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: studentsApi.getAllGroups,
  });

  const createStudentMutation = useMutation({
    mutationFn: studentsApi.createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      messageApi.success('Student added successfully');
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, data }) => studentsApi.updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      messageApi.success('Student updated successfully');
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: studentsApi.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      messageApi.success('Student deleted successfully');
    },
  });
};
```

### 2. Environment Configuration

Create or update your `.env` file:
```env
REACT_APP_API_BASE_URL=http://your-api-server.com/api
```

### 3. Authentication

The API service automatically includes authentication tokens from localStorage. Ensure your backend expects:
```
Authorization: Bearer <token>
```

## Navigation

The students functionality is accessible through:

1. **Sidebar Menu**: "Students" item in the main navigation
2. **Direct URLs**: 
   - `/students` - Overview page
   - `/students/manage` - Management page
3. **Navigation Buttons**: 
   - "Manage Students" button on overview page
   - "Back to Overview" button on management page

## Styling & UI

The implementation uses Ant Design components and follows the existing design patterns:
- Consistent spacing and typography
- Color-coded score indicators
- Responsive table layouts
- Modal forms with validation
- Loading states and empty states

## Error Handling

The system includes comprehensive error handling:
- API error logging
- User-friendly error messages
- Loading states during operations
- Form validation with clear error messages

## Future Enhancements

Potential improvements for the students management system:
- Bulk operations (import/export students)
- Advanced filtering and search
- Student performance analytics
- Group management functionality
- Student attendance tracking
- Grade history and trends

## Testing

To test the functionality:
1. Start the development server: `npm run dev`
2. Navigate to `/students` to view the overview
3. Click "Manage Students" to test CRUD operations
4. Try adding, editing, and deleting students

The mock data will persist during the session but will reset on page refresh. 