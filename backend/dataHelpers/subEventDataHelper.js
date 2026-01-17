const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB, DB_FILES } = require('../config/database');

class SubEventDataHelper {
  getAllSubEvents() {
    return readDB(DB_FILES.SUB_EVENTS);
  }

  getSubEventById(subEventId) {
    const subEvents = this.getAllSubEvents();
    return subEvents.find(event => event.subEventId === subEventId);
  }

  getSubEventsByCompetition(competitionId) {
    const subEvents = this.getAllSubEvents();
    return subEvents.filter(event => event.competitionId === competitionId);
  }

  createSubEvent(subEventData) {
    const subEvents = this.getAllSubEvents();
    const newSubEvent = {
      subEventId: uuidv4(),
      ...subEventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    subEvents.push(newSubEvent);
    writeDB(DB_FILES.SUB_EVENTS, subEvents);
    return newSubEvent;
  }

  updateSubEvent(subEventId, updateData) {
    const subEvents = this.getAllSubEvents();
    const index = subEvents.findIndex(event => event.subEventId === subEventId);
    
    if (index === -1) return null;
    
    subEvents[index] = {
      ...subEvents[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    writeDB(DB_FILES.SUB_EVENTS, subEvents);
    return subEvents[index];
  }

  deleteSubEvent(subEventId) {
    const subEvents = this.getAllSubEvents();
    const filteredSubEvents = subEvents.filter(event => event.subEventId !== subEventId);
    
    if (subEvents.length === filteredSubEvents.length) return false;
    
    writeDB(DB_FILES.SUB_EVENTS, filteredSubEvents);
    return true;
  }

  deleteSubEventsByCompetition(competitionId) {
    const subEvents = this.getAllSubEvents();
    const filteredSubEvents = subEvents.filter(event => event.competitionId !== competitionId);
    writeDB(DB_FILES.SUB_EVENTS, filteredSubEvents);
    return true;
  }
}

module.exports = new SubEventDataHelper();

