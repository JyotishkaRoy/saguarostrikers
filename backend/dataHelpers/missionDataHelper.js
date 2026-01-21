const { generateId } = require('../utils/idGenerator.cjs');
const { readDB, writeDB, DB_FILES } = require('../config/database');

class MissionDataHelper {
  getAllMissions() {
    return readDB(DB_FILES.MISSIONS);
  }

  getMissionById(missionId) {
    const missions = this.getAllMissions();
    return missions.find(comp => comp.missionId === missionId);
  }

  getMissionBySlug(slug) {
    const missions = this.getAllMissions();
    return missions.find(comp => comp.slug === slug);
  }

  createMission(missionData) {
    const missions = this.getAllMissions();
    const newMission = {
      missionId: generateId(),
      ...missionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    missions.push(newMission);
    writeDB(DB_FILES.MISSIONS, missions);
    return newMission;
  }

  updateMission(missionId, updateData) {
    const missions = this.getAllMissions();
    const index = missions.findIndex(comp => comp.missionId === missionId);
    
    if (index === -1) return null;
    
    missions[index] = {
      ...missions[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    writeDB(DB_FILES.MISSIONS, missions);
    return missions[index];
  }

  deleteMission(missionId) {
    const missions = this.getAllMissions();
    const filteredMissions = missions.filter(comp => comp.missionId !== missionId);
    
    if (missions.length === filteredMissions.length) return false;
    
    writeDB(DB_FILES.MISSIONS, filteredMissions);
    return true;
  }

  getMissionsByStatus(status) {
    const missions = this.getAllMissions();
    return missions.filter(comp => comp.status === status);
  }

  getUpcomingMissions() {
    const missions = this.getAllMissions();
    const now = new Date();
    return missions.filter(comp => 
      comp.status === 'published' && new Date(comp.startDate) > now
    ).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }

  getPublishedMissions() {
    // Return all missions except drafts and cancelled (published, in-progress, completed, archived are visible)
    const missions = this.getAllMissions();
    return missions.filter(comp => comp.status !== 'draft' && comp.status !== 'cancelled');
  }
}

module.exports = new MissionDataHelper();

