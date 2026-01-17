const subEventDataHelper = require('../dataHelpers/subEventDataHelper');
const competitionDataHelper = require('../dataHelpers/competitionDataHelper');
const auditLogDataHelper = require('../dataHelpers/auditLogDataHelper');

class SubEventService {
  createSubEvent(subEventData, userId, requestInfo = {}) {
    const { competitionId, title, description, eventDate, status } = subEventData;

    // Verify competition exists
    const competition = competitionDataHelper.getCompetitionById(competitionId);
    if (!competition) {
      throw new Error('Competition not found');
    }

    // Create sub-event
    const newSubEvent = subEventDataHelper.createSubEvent({
      competitionId,
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
      changes: { competitionId, title, status: newSubEvent.status },
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

  getSubEventsByCompetition(competitionId) {
    return subEventDataHelper.getSubEventsByCompetition(competitionId);
  }

  getSubEventById(subEventId) {
    return subEventDataHelper.getSubEventById(subEventId);
  }
}

module.exports = new SubEventService();

