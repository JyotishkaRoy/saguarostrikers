const subEventDataHelper = require('../dataHelpers/subEventDataHelper');
const missionDataHelper = require('../dataHelpers/missionDataHelper');
const auditLogDataHelper = require('../dataHelpers/auditLogDataHelper');

class SubEventService {
  createSubEvent(subEventData, userId, requestInfo = {}) {
    const { missionId, title, description, eventDate, status } = subEventData;

    // Verify mission exists
    const mission = missionDataHelper.getMissionById(missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }

    // Create sub-event
    const newSubEvent = subEventDataHelper.createSubEvent({
      missionId,
      title,
      description,
      eventDate,
      status: status || 'draft'
    });

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'SUB_EVENT_CREATED',
      entity: 'subEvent',
      entityId: newSubEvent.subEventId,
      changes: { missionId, title, status: newSubEvent.status },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return newSubEvent;
  }

  updateSubEvent(subEventId, updateData, userId, requestInfo = {}) {
    const subEvent = subEventDataHelper.getSubEventById(subEventId);
    if (!subEvent) {
      throw new Error('Sub-event not found');
    }

    // Update sub-event
    const updatedSubEvent = subEventDataHelper.updateSubEvent(subEventId, updateData);

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'SUB_EVENT_UPDATED',
      entity: 'subEvent',
      entityId: subEventId,
      changes: updateData,
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return updatedSubEvent;
  }

  deleteSubEvent(subEventId, userId, requestInfo = {}) {
    const subEvent = subEventDataHelper.getSubEventById(subEventId);
    if (!subEvent) {
      throw new Error('Sub-event not found');
    }

    const success = subEventDataHelper.deleteSubEvent(subEventId);

    if (success) {
      // Log audit
      auditLogDataHelper.createLog({
        userId,
        action: 'SUB_EVENT_DELETED',
        entity: 'subEvent',
        entityId: subEventId,
        changes: { title: subEvent.title },
        ipAddress: requestInfo.ipAddress || '',
        userAgent: requestInfo.userAgent || ''
      });
    }

    return success;
  }

  getSubEventsByMission(missionId) {
    return subEventDataHelper.getSubEventsByMission(missionId);
  }

  getSubEventById(subEventId) {
    return subEventDataHelper.getSubEventById(subEventId);
  }
}

module.exports = new SubEventService();

