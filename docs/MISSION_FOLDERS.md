# Mission Folder Structure

## Overview
When a new mission (mission) is created, the system automatically creates organized folder structures for storing mission-related files.

## Automatic Folder Creation

When you create a new mission, the system automatically creates three dedicated folders:

### Folder Structure
```
uploads/
├── mission-artifacts/{missionTitle}-{missionId}/
├── mission-galleries/{missionTitle}-{missionId}/
└── mission-scientists/{missionTitle}-{missionId}/
```

### Folder Purposes

1. **mission-artifacts/**
   - **Purpose**: Store mission documentation and deliverables
   - **Allowed File Types**: 
     - PDF files (`.pdf`)
     - ZIP archives (`.zip`)
     - Image files (`.jpg`, `.jpeg`, `.png`, `.gif`)
   - **Use Cases**: Mission reports, technical documentation, data packages

2. **mission-galleries/**
   - **Purpose**: Store media content for mission galleries
   - **Allowed File Types**: 
     - Image files (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`)
     - Video files (`.mp4`, `.mov`, `.avi`, `.webm`)
   - **Use Cases**: Launch photos, team photos, event videos, mission highlights

3. **mission-scientists/**
   - **Purpose**: Store team member profile images
   - **Allowed File Types**: 
     - Image files (`.jpg`, `.jpeg`, `.png`, `.gif`)
   - **Use Cases**: Team member headshots, scientist profiles

## Folder Naming Convention

Folders are named using the pattern: `{sanitizedTitle}-{missionId}`

**Example:**
- Mission Title: "NASA USLI 2026"
- Mission ID: "5dcbe6a0-a755-414f-aa48-ecf7f24992de"
- Folder Name: `nasa-usli-2026-5dcbe6a0-a755-414f-aa48-ecf7f24992de`

### Title Sanitization
- All non-alphanumeric characters (except spaces and hyphens) are removed
- Spaces are converted to hyphens
- Result is lowercased

## Admin Access

Admins can upload files to these folders through:
- Mission Artifacts Management
- Mission Gallery Management
- Team Member Profile Management

## Technical Implementation

### Backend Service
Located in: `backend/src/services/MissionService.ts`

```typescript
private createMissionFolders(title: string, missionId: string): void {
  // Creates three folders automatically
  // Logs success or failure without blocking mission creation
}
```

### Error Handling
- Folder creation failures do NOT prevent mission creation
- Errors are logged to console for admin monitoring
- Folders can be manually created if automatic creation fails

## Existing Missions

For missions created before this feature was implemented, folders can be created manually by:

1. Running the migration script (if provided)
2. Manually creating folders using the naming convention
3. Re-saving the mission in admin panel (will attempt to create folders)

## Directory Permissions

Ensure the `uploads/` directory has appropriate write permissions:
```bash
chmod -R 755 uploads/
```

## Cleanup on Mission Deletion

**Note**: Currently, folders are NOT automatically deleted when a mission is deleted. This is intentional to preserve historical data. Manual cleanup may be required.

## Future Enhancements

Potential improvements:
- Archive folders when mission is archived
- Automatic cleanup with confirmation dialog
- File size limits and storage quotas
- Cloud storage integration (AWS S3, etc.)
