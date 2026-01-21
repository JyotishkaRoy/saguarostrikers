const missionDataHelper = require('../dataHelpers/missionDataHelper');
const subEventDataHelper = require('../dataHelpers/subEventDataHelper');
const auditLogDataHelper = require('../dataHelpers/auditLogDataHelper');
const fs = require('fs');
const path = require('path');

class MissionService {
  // Generate slug from title
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Create mission folders for artifacts, galleries, and scientists
  createMissionFolders(title, missionId) {
    try {
      // Create sanitized folder name: missionTitle-missionId
      const sanitizedTitle = title
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
      const folderName = `${sanitizedTitle}-${missionId}`;

      // Base uploads directory (project root)
      const uploadsBase = path.join(__dirname, '..', '..', 'uploads');

      // Define folder paths
      const folders = [
        path.join(uploadsBase, 'mission-artifacts', folderName),
        path.join(uploadsBase, 'mission-galleries', folderName),
        path.join(uploadsBase, 'mission-scientists', folderName)
      ];

      // Create each folder
      folders.forEach(folderPath => {
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
          console.log(`✅ Created mission folder: ${folderPath}`);
        }
      });
    } catch (error) {
      console.error('❌ Error creating mission folders:', error);
      // Don't throw error - folder creation failure shouldn't block mission creation
    }
  }

  getAllMissions(userId = null) {
    const missions = missionDataHelper.getAllMissions();
    return missions.map(comp => ({
      missionId: comp.missionId,
      title: comp.title,
      slug: comp.slug,
      description: comp.description,
      startDate: comp.startDate,
      endDate: comp.endDate,
      location: comp.location,
      status: comp.status,
      imageUrl: comp.imageUrl,
      createdBy: comp.createdBy,
      createdAt: comp.createdAt,
      updatedAt: comp.updatedAt
    }));
  }

  getMissionById(missionId) {
    const mission = missionDataHelper.getMissionById(missionId);
    if (!mission) return null;

    // Get sub-events for this mission
    const subEvents = subEventDataHelper.getSubEventsByMission(missionId);

    return {
      ...mission,
      subEvents
    };
  }

  getMissionBySlug(slug) {
    const mission = missionDataHelper.getMissionBySlug(slug);
    if (!mission) return null;

    // Get sub-events for this mission
    const subEvents = subEventDataHelper.getSubEventsByMission(mission.missionId);

    return {
      ...mission,
      subEvents
    };
  }

  createMission(missionData, userId, requestInfo = {}) {
    const { title, description, startDate, endDate, location, status, imageUrl } = missionData;

    // Generate slug
    const slug = this.generateSlug(title);

    // Check if slug already exists
    const existingMission = missionDataHelper.getMissionBySlug(slug);
    if (existingMission) {
      throw new Error('A mission with this title already exists');
    }

    // Create mission
    const newMission = missionDataHelper.createMission({
      title,
      slug,
      description,
      startDate,
      endDate,
      location,
      status: status || 'draft',
      imageUrl: imageUrl || '',
      createdBy: userId
    });

    // Create mission folders
    this.createMissionFolders(title, newMission.missionId);

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'COMPETITION_CREATED',
      entity: 'mission',
      entityId: newMission.missionId,
      changes: { title, status: newMission.status },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return newMission;
  }

  updateMission(missionId, updateData, userId, requestInfo = {}) {
    const mission = missionDataHelper.getMissionById(missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }

    // If title is being updated, regenerate slug (but keep the old one - following memory rule)
    // Actually, based on memory: slug should NEVER change when name is updated
    if (updateData.title) {
      delete updateData.slug; // Ensure slug is never updated
    }

    // Update mission
    const updatedMission = missionDataHelper.updateMission(missionId, updateData);

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'COMPETITION_UPDATED',
      entity: 'mission',
      entityId: missionId,
      changes: updateData,
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return updatedMission;
  }

  deleteMission(missionId, userId, requestInfo = {}) {
    const mission = missionDataHelper.getMissionById(missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }

    // Delete related sub-events
    subEventDataHelper.deleteSubEventsByMission(missionId);

    // Delete mission
    const success = missionDataHelper.deleteMission(missionId);

    if (success) {
      // Log audit
      auditLogDataHelper.createLog({
        userId,
        action: 'COMPETITION_DELETED',
        entity: 'mission',
        entityId: missionId,
        changes: { title: mission.title },
        ipAddress: requestInfo.ipAddress || '',
        userAgent: requestInfo.userAgent || ''
      });
    }

    return success;
  }

  publishMission(missionId, userId, requestInfo = {}) {
    return this.updateMission(missionId, { status: 'published' }, userId, requestInfo);
  }

  getPublishedMissions() {
    const missions = missionDataHelper.getPublishedMissions();
    return missions.map(comp => ({
      missionId: comp.missionId,
      title: comp.title,
      slug: comp.slug,
      description: comp.description,
      startDate: comp.startDate,
      endDate: comp.endDate,
      location: comp.location,
      status: comp.status,
      imageUrl: comp.imageUrl,
      createdAt: comp.createdAt
    }));
  }

  getUpcomingMissions() {
    return missionDataHelper.getUpcomingMissions();
  }
}

module.exports = new MissionService();

