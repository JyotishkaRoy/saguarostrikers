# Mission Status Logic

## Date: January 21, 2026

---

## Overview

Mission status system controls mission lifecycle from creation through completion, with specific visibility rules for public and admin views.

---

## Status Values

The system supports 6 distinct status values:

1. **Draft** - Work in progress, not visible to public
2. **Published** - Active mission, shows as "Upcoming" on public page
3. **In Progress** - Mission actively running, visible in "In Progress" category
4. **Completed** - Mission finished, visible in "Completed" category
5. **Cancelled** - Mission cancelled, hidden from public view
6. **Archived** - Mission archived, visible in "Archived" category

---

## Status Flow

### When Creating a Mission

**Available Options:**
- ✅ **Draft** - Save without publishing
- ✅ **Published (Upcoming)** - Immediately visible as upcoming mission
- ✅ **In Progress** - Mark as actively running

**Not Available:**
- ❌ Completed
- ❌ Cancelled
- ❌ Archived

### When Editing a Mission

**All Status Options Available:**
- ✅ **Draft** - Return to draft state
- ✅ **Published (Upcoming)** - Mark as upcoming mission
- ✅ **In Progress** - Mark as actively running
- ✅ **Completed** - Mark as finished
- ✅ **Cancelled** - Cancel the mission (hidden from public)
- ✅ **Archived** - Archive the mission

---

## Public Visibility Rules

### Missions Page (`/missions`)

#### **Upcoming Tab**
**Shows:**
- Missions with status `published`

**Categorization:**
- Displays as "Upcoming"

#### **In Progress Tab**
**Shows:**
- Missions with status `in-progress`

**Categorization:**
- Explicitly marked as in progress

#### **Completed Tab**
**Shows:**
- Missions with status `completed`

**Categorization:**
- Explicitly marked as completed

#### **Archived Tab**
**Shows:**
- Missions with status `archived`

**Hidden from Public:**
- ❌ Missions with status `draft`
- ❌ Missions with status `cancelled`

---

## Status Display Logic

### Frontend Display

```typescript
function getMissionStatus(startDate, endDate, dbStatus) {
  // Explicit status overrides
  if (dbStatus === 'archived') {
    return 'archived';
  }
  
  if (dbStatus === 'completed') {
    return 'completed';
  }
  
  // Published missions categorized by date
  if (dbStatus === 'published') {
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'in-progress';
  }
  
  // Fallback
  return determineByDates();
}
```

### Badge Colors

| Status | Badge Label | Color Class |
|--------|-------------|-------------|
| Upcoming | "Upcoming" | `badge-primary` (Blue) |
| In Progress | "Active Now" | `badge-success` (Green) |
| Completed | "Completed" | `badge-gray` (Gray) |
| Archived | "Archived" | `badge-warning` (Orange) |
| Cancelled | N/A | Not displayed publicly |

---

## Backend Logic

### Published Missions Endpoint

**Endpoint**: `GET /api/public/missions`

**Returns:**
- All missions EXCEPT:
  - `draft` status
  - `cancelled` status

**SQL-like Filter:**
```javascript
missions.filter(m => 
  m.status !== 'draft' && 
  m.status !== 'cancelled'
)
```

---

## Admin Dashboard

### Mission List View

**Filter Options:**
- All Status
- Published (Upcoming)
- Draft
- Completed
- Cancelled
- Archived

### Mission Form

#### Create Mode
**Status Dropdown:**
```html
<select>
  <option value="draft">Draft</option>
  <option value="published">Published (Upcoming)</option>
</select>
```

#### Edit Mode
**Status Dropdown:**
```html
<select>
  <option value="draft">Draft</option>
  <option value="published">Published (Upcoming)</option>
  <option value="completed">Completed</option>
  <option value="cancelled">Cancelled</option>
  <option value="archived">Archived</option>
</select>
```

---

## Use Cases & Examples

### Example 1: Creating a New Mission

**Scenario**: Admin creates "NASA USLI 2027"

**Options:**
1. Save as **Draft** → Not visible to public, can edit freely
2. Save as **Published** → Immediately visible in "Upcoming Missions"

**Workflow:**
```
Create → Select Status (Draft/Published) → Save → Done
```

---

### Example 2: Mission Lifecycle

**Timeline:**

1. **Jan 1**: Created as `draft`
   - ❌ Not visible on public page
   - ✅ Visible in admin dashboard

2. **Jan 15**: Changed to `published`
   - ✅ Appears in "Upcoming Missions"
   - Badge: "Upcoming" (Blue)

3. **Mar 1**: Mission starts (current date passes start date)
   - ✅ Appears in "In Progress"
   - Badge: "Active Now" (Green)

4. **Mar 30**: Mission ends (current date passes end date)
   - ✅ Auto-categorized to "Completed"
   - Badge: "Completed" (Gray)

5. **Apr 15**: Admin explicitly marks as `completed`
   - ✅ Remains in "Completed"
   - Explicitly confirmed as finished

6. **Dec 31**: Admin changes to `archived`
   - ✅ Moves to "Archived" tab
   - Badge: "Archived" (Orange)

---

### Example 3: Cancelling a Mission

**Scenario**: Mission needs to be cancelled

**Steps:**
1. Admin edits mission
2. Changes status to `cancelled`
3. Saves

**Result:**
- ❌ Removed from public `/missions` page
- ✅ Still visible in admin dashboard (filtered by "Cancelled")
- ✅ Can be re-activated by changing status back to `published`

---

## Database Schema

### Mission Model

```typescript
interface Mission {
  missionId: string;
  title: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled' | 'archived';
  startDate: string;
  endDate: string;
  // ... other fields
}
```

---

## API Responses

### Public Endpoint

**Request:** `GET /api/public/missions`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "missionId": "abc123xyz456",
      "title": "NASA USLI 2026",
      "status": "published",
      "startDate": "2026-03-01",
      "endDate": "2026-03-15"
    }
  ]
}
```

**Note:** Draft and cancelled missions are filtered out server-side.

---

## Migration Notes

### Breaking Changes from Previous Version

**Before:**
- Only 4 statuses: `draft`, `published`, `completed`, `cancelled`
- All non-draft missions were visible

**After:**
- 5 statuses: Added `archived`
- `cancelled` missions are now hidden from public view

### Database Migration

No migration needed - `archived` status is new, existing missions unaffected.

---

## Testing Checklist

### Create Flow
- [ ] Can create mission as Draft
- [ ] Can create mission as Published
- [ ] Cannot select Completed/Cancelled/Archived on create

### Edit Flow
- [ ] Can change Draft → Published
- [ ] Can change Published → Completed
- [ ] Can change Published → Cancelled
- [ ] Can change Published → Archived
- [ ] All 5 status options available in edit mode

### Public Visibility
- [ ] Draft missions not visible on `/missions`
- [ ] Cancelled missions not visible on `/missions`
- [ ] Published missions visible in Upcoming
- [ ] Completed missions visible in Completed
- [ ] Archived missions visible in Archived

### Admin Dashboard
- [ ] All missions visible (including draft/cancelled)
- [ ] Filter by status works correctly
- [ ] Status badge displays correctly

---

## Status Reference Table

| Status | Create | Edit | Public Visible | Category | Badge |
|--------|--------|------|----------------|----------|-------|
| Draft | ✅ | ✅ | ❌ | N/A | N/A |
| Published | ✅ | ✅ | ✅ | Upcoming | Blue |
| In Progress | ✅ | ✅ | ✅ | In Progress | Green |
| Completed | ❌ | ✅ | ✅ | Completed | Gray |
| Cancelled | ❌ | ✅ | ❌ | N/A | N/A |
| Archived | ❌ | ✅ | ✅ | Archived | Orange |

---

## Conclusion

The mission status system provides clear lifecycle management with appropriate visibility controls for public and admin users. The `published` status always represents "Upcoming" missions, while `completed`, `cancelled`, and `archived` provide explicit control over mission state and visibility.

**Status**: ✅ **IMPLEMENTED**
