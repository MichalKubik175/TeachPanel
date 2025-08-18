# Student Visiting System

## Overview
The visiting system allows teachers to mark student attendance on a daily basis with comprehensive tracking and management features.

## Features

### ✅ Daily Attendance Tracking
- Mark students as present or absent for any date
- Historical tracking of all attendance records
- Unique constraint prevents duplicate entries per student/date

### ✅ Group Management
- **Mark Entire Group**: Quickly mark all students in a group as present/absent
- **Individual Control**: Override group settings for specific students
- **Selective Marking**: Choose specific students for bulk actions

### ✅ Flexible Interface
- **Date Selection**: Pick any date for attendance marking
- **Group Selection**: Choose which group to manage
- **Real-time Statistics**: See attendance percentage and counts
- **Individual Actions**: Mark/unmark students individually

### ✅ Notes & Comments
- Add notes to individual student visits
- Track reasons for absence or special circumstances
- Edit notes for existing attendance records

## User Interface Components

### Main Controls
- **Date Picker**: Select the date for attendance tracking
- **Group Filter**: Filter to show specific group or all groups (default: all groups)
- **Statistics Display**: Shows total students, present/absent counts, and attendance percentage

### Bulk Actions
- **Mark All Present**: Mark entire group as present
- **Mark All Absent**: Mark entire group as absent
- **Selected Actions**: Mark only selected students

### Student Display
- **All Groups View**: Shows all groups with their students by default
- **Single Group View**: When filtered, shows only selected group with checkboxes
- **Status Indicators**: Visual tags showing attendance status (default: "Не відвідав")
- **Action Buttons**: Individual present/absent/edit buttons per student
- **Group Actions**: Bulk actions for entire groups
- **Notes**: Edit attendance notes for each student

## API Endpoints

### Backend (ASP.NET Core)
```
GET    /v1/studentvisits              # Get visits with filters
POST   /v1/studentvisits              # Create single visit
PUT    /v1/studentvisits/{id}         # Update visit
DELETE /v1/studentvisits/{id}         # Delete visit
POST   /v1/studentvisits/bulk         # Bulk create/update
GET    /v1/studentvisits/summaries    # Group summaries
GET    /v1/studentvisits/summaries/{groupId} # Specific group summary
```

### Frontend (React/Axios)
```javascript
// Service: src/services/visitsApi.js
visitsApi.create(visitData)
visitsApi.bulkCreateOrUpdate(bulkData)
visitsApi.getGroupSummary(groupId, date)
// ... and more
```

## Database Schema

### StudentVisit Entity
```csharp
public class StudentVisit
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public DateOnly VisitDate { get; set; }
    public bool IsPresent { get; set; }
    public Guid UserId { get; set; }
    public string? Notes { get; set; }
    // Audit fields...
}
```

### Key Features
- **Unique Constraint**: (StudentId, VisitDate, UserId) prevents duplicates
- **Foreign Keys**: Links to Student and User tables
- **Cascade Delete**: Visits are deleted when student is removed
- **Audit Trail**: Full creation/update tracking

## Usage Examples

### Default View (All Groups)
1. Select date (group filter is optional)
2. See all groups with their students
3. Each group shows attendance percentage
4. Click group-level "Всі присутні/відсутні" buttons

### Mark Individual Student
1. Click ✓ or ✗ button next to any student name
2. Status updates immediately from "Не відвідав" to "Присутній/Відсутній"

### Mark Entire Group
1. In any group card, click "Всі присутні" or "Всі відсутні"
2. All students in that specific group are marked

### Filtered Group View
1. Select specific group from filter
2. Use checkboxes to select individual students
3. Use "Mark Selected Present/Absent" buttons for bulk actions

### Add Notes
1. Click edit button (✎) next to student
2. Enter notes in modal dialog
3. Save to store with attendance record

## Integration Points

### Navigation
- Added to main sidebar as "Відвідування" with CheckSquare icon
- Positioned between Students and Questionnaires

### Data Dependencies
- Requires existing Students and Groups
- Uses existing authentication system
- Integrates with existing API infrastructure

### State Management
- Uses existing Redux auth state
- Leverages useBrandsGroupsStudents hook for data
- Local state for visit management

## Technical Implementation

### Backend Architecture
- **Entity Framework Core**: Database ORM with migrations
- **Clean Architecture**: Separated concerns (Core, Application, API)
- **Validation**: FluentValidation for request validation
- **Security**: User-scoped data access with ISecurityContext

### Frontend Architecture
- **React Hooks**: Functional components with state management
- **Ant Design**: Consistent UI components
- **Axios**: HTTP client with interceptors
- **Error Handling**: User-friendly error messages

### Performance Considerations
- **Efficient Queries**: Optimized database queries with includes
- **Bulk Operations**: Batch processing for multiple students
- **Lazy Loading**: Data loaded only when needed
- **Caching**: Leverages existing data hooks

## Future Enhancements

### Potential Features
- **Attendance Reports**: Generate PDF/Excel reports
- **Attendance Analytics**: Trends and patterns
- **Automated Notifications**: Alert for frequent absences
- **Integration with Sessions**: Link attendance to specific lessons
- **Mobile Responsive**: Better mobile interface
- **Export/Import**: Bulk data management

### Technical Improvements
- **Real-time Updates**: WebSocket integration
- **Offline Support**: Progressive Web App features
- **Performance**: Virtual scrolling for large groups
- **Accessibility**: Enhanced screen reader support
