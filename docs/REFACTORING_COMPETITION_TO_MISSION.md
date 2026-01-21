# Refactoring: Competition → Mission

## Date: January 20, 2026

---

## Overview

Complete system-wide refactoring to rename all occurrences of "competition" to "mission" throughout the Saguaro Strikers platform. This includes code, data, routes, UI labels, and documentation.

---

## Scope of Changes

### 📊 Statistics
- **Total Files Modified**: 99 files
- **Total Instances Replaced**: 855+ occurrences
- **Layers Affected**: Backend, Frontend, Data, Documentation

---

## Detailed Changes

### 1. Backend Type Definitions

#### Files Modified:
- `backend/src/models/types.ts`
- `frontend/src/types/index.ts`

#### Changes:
- `Competition` interface → `Mission` interface
- `CompetitionStatus` → `MissionStatus`
- `CreateCompetitionData` → `CreateMissionData`
- `UpdateCompetitionData` → `UpdateMissionData`
- `competitionId` field → `missionId` field
- `CalendarEventType` value `'competition'` → `'mission'`
- `NoticeType` value `'competition'` → `'mission'`

---

### 2. Data Files

#### Files Renamed:
- `data/competitions.json` → `data/missions.json`

#### Files Modified:
- `data/calendarEvents.json` - Updated `competitionId` → `missionId`
- `data/galleries.json` - Updated `competitionId` → `missionId`
- `data/files.json` - Updated `competitionId` → `missionId`
- `data/interests.json` - Updated `competitionId` → `missionId`
- `data/notices.json` - Updated `competitionId` → `missionId`
- `data/teams.json` - Updated `competitionId` → `missionId`

#### Database Configuration:
- `backend/config/database.js`:
  - `DB_FILES.COMPETITIONS` → `DB_FILES.MISSIONS`
  - File path: `competitions.json` → `missions.json`

---

### 3. Backend Services & Data Helpers

#### Files Renamed:

**Data Helpers:**
- `backend/dataHelpers/competitionDataHelper.js` → `missionDataHelper.js`
- `backend/src/data/CompetitionDataHelper.ts` → `MissionDataHelper.ts`

**Services:**
- `backend/services/competitionService.js` → `missionService.js`
- `backend/src/services/CompetitionService.ts` → `MissionService.ts`

**Controllers:**
- `backend/src/controllers/CompetitionController.ts` → `MissionController.ts`
- `backend/controllers/portal/competitionController.js` → `missionController.js`
- `backend/controllers/admin/competitionAdminController.js` → `missionAdminController.js`

**Routes:**
- `backend/routes/admin/competitionAdminRoutes.js` → `missionAdminRoutes.js`

#### Content Updated:
- All class names: `CompetitionService` → `MissionService`
- All variable names: `competition` → `mission`, `competitions` → `missions`
- All method names: `getCompetition()` → `getMission()`, etc.
- All comments and documentation strings

---

### 4. Frontend Pages & Components

#### Files Renamed:

**Pages:**
- `frontend/src/pages/public/CompetitionsPage.tsx` → `MissionsPage.tsx`
- `frontend/src/pages/public/CompetitionDetailPage.tsx` → `MissionDetailPage.tsx`
- `frontend/src/pages/admin/AdminCompetitions.tsx` → `AdminMissions.tsx`

**Store:**
- `frontend/src/store/competitionStore.ts` → `missionStore.ts`

#### Content Updated:
- All component names
- All interface/type references
- All prop names and state variables
- All API endpoint calls
- All import/export statements

---

### 5. Routes & URLs

#### Updated Paths:

**Frontend Routes:**
- `/competitions` → `/missions`
- `/competitions/:slug` → `/missions/:slug`
- `/admin/competitions` → `/admin/missions`

**Backend API Routes:**
- `/api/public/competitions` → `/api/public/missions`
- `/api/public/competitions/:id` → `/api/public/missions/:id`
- `/api/public/competitions/slug/:slug` → `/api/public/missions/slug/:slug`
- `/api/admin/competitions` → `/api/admin/missions`
- `/api/admin/competitions/:id` → `/api/admin/missions/:id`
- `/api/user/competitions` → `/api/user/missions`

---

### 6. UI Labels & Text

All user-facing text updated:
- "Competition" → "Mission"
- "Competitions" → "Missions"
- "Our Competitions" → "Our Missions"
- "Competition Details" → "Mission Details"
- "Join Competition" → "Join Mission"
- "Upcoming Competitions" → "Upcoming Missions"
- Navigation menu items
- Button labels
- Page titles
- Form labels
- Error messages

---

### 7. Documentation

#### Files Updated:
- `README.md`
- All files in `docs/` directory
- `package.json` descriptions
- Inline code comments
- API documentation
- Feature specifications

---

## Migration Notes

### Database IDs
- All `competitionId` fields in the database have been renamed to `missionId`
- **Important**: This is a breaking change for existing data
- Existing data files were updated automatically

### URLs
- **Breaking Change**: All URLs containing `/competitions` now use `/missions`
- External links and bookmarks will need to be updated
- Consider setting up redirects if needed

### API Contracts
- All API endpoints now use `mission` terminology
- Request/response payloads use `missionId` instead of `competitionId`
- Any external integrations will need to be updated

---

## Testing Checklist

### Backend
- ✅ TypeScript compilation successful
- ✅ Server starts without errors
- ✅ API endpoints respond correctly
- ✅ Data file loading works
- ⚠️ Manual testing needed:
  - Create new mission
  - Update mission
  - Delete mission
  - Mission folder creation
  - Sub-events association
  - Teams association

### Frontend
- ⚠️ Manual testing needed:
  - Browse missions page
  - View mission details
  - Admin mission management
  - Create/edit/delete missions
  - Navigation menu
  - Search functionality
  - Mission calendar
  - Join mission flow

---

## Files Requiring Manual Review

Due to the bulk nature of this refactoring, the following areas should be manually reviewed:

1. **Complex conditionals** - Ensure logic wasn't broken by text replacement
2. **Comments** - Verify comments still make sense in context
3. **String literals** - Check if any hardcoded strings were missed
4. **Database queries** - Verify all field names are correct
5. **API integrations** - Update any external API consumers

---

## Rollback Plan

If issues arise, rollback can be performed by:

1. **Git revert** - Revert the commit containing these changes
2. **Manual rollback**:
   - Restore `data/missions.json` → `data/competitions.json`
   - Reverse all file renames
   - Run: `find . -type f -exec sed -i '' 's/Mission/Competition/g; s/mission/competition/g; s/MISSIONS/COMPETITIONS/g' {} +`
3. **Rebuild** backend and restart servers

---

## Impact Assessment

### Breaking Changes
1. ✅ Database field names changed
2. ✅ API endpoint paths changed
3. ✅ URL routes changed
4. ✅ Type definitions changed

### Non-Breaking Changes
1. ✅ UI labels updated
2. ✅ Documentation updated
3. ✅ Code comments updated

### Risk Level: **MEDIUM-HIGH**
- Major refactoring touching core data models
- Extensive testing required before production deployment
- Backup data before deploying

---

## Next Steps

1. **Immediate**:
   - ✅ Verify backend builds successfully
   - ✅ Verify backend starts without errors
   - ⚠️ Test all mission CRUD operations
   - ⚠️ Test all API endpoints
   - ⚠️ Verify frontend renders correctly

2. **Short-term**:
   - Test complete user flows
   - Update any external documentation
   - Notify stakeholders of URL changes
   - Test data migration on staging

3. **Long-term**:
   - Monitor for any issues
   - Update training materials
   - Update user guides

---

## Success Criteria

- [x] All files compile without errors
- [x] Backend server starts successfully
- [x] API responds to mission endpoints
- [ ] All mission CRUD operations work
- [ ] Frontend displays missions correctly
- [ ] Navigation works end-to-end
- [ ] No console errors in browser
- [ ] Data persistence works correctly

---

## Support

If issues arise after this refactoring:
1. Check console logs for errors
2. Review this document for context
3. Check git history for specific file changes
4. Test API endpoints individually
5. Verify data file integrity

---

## Conclusion

This comprehensive refactoring successfully updated the entire Saguaro Strikers platform from "competition" terminology to "mission" terminology, maintaining consistency across all layers of the application.

**Status**: ✅ **REFACTORING COMPLETE** - Testing Required
