const interestDataHelper = require('../dataHelpers/interestDataHelper');
const missionDataHelper = require('../dataHelpers/missionDataHelper');
const userDataHelper = require('../dataHelpers/userDataHelper');
const auditLogDataHelper = require('../dataHelpers/auditLogDataHelper');

class InterestService {
  showInterest(userId, missionId, message, requestInfo = {}) {
    // Verify mission exists and is published
    const mission = missionDataHelper.getMissionById(missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }

    if (mission.status !== 'published') {
      throw new Error('Cannot show interest in unpublished mission');
    }

    // Check if user already showed interest
    const existingInterest = interestDataHelper.getInterestByUserAndMission(userId, missionId);
    if (existingInterest) {
      throw new Error('You have already shown interest in this mission');
    }

    // Create interest
    const newInterest = interestDataHelper.createInterest({
      userId,
      missionId,
      message: message || ''
    });

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'INTEREST_SHOWN',
      entity: 'interest',
      entityId: newInterest.interestId,
      changes: { missionId },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return newInterest;
  }

  getUserInterests(userId) {
    const interests = interestDataHelper.getInterestsByUser(userId);
    return interests.map(interest => {
      const mission = missionDataHelper.getMissionById(interest.missionId);
      return {
        ...interest,
        mission: mission ? {
          missionId: mission.missionId,
          title: mission.title,
          slug: mission.slug,
          startDate: mission.startDate,
          endDate: mission.endDate,
          status: mission.status
        } : null
      };
    });
  }

  getMissionInterests(missionId, adminUserId) {
    const interests = interestDataHelper.getInterestsByMission(missionId);
    return interests.map(interest => {
      const user = userDataHelper.getUserById(interest.userId);
      return {
        ...interest,
        user: user ? {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        } : null
      };
    });
  }

  updateInterestStatus(interestId, status, adminUserId, requestInfo = {}) {
    const interest = interestDataHelper.getInterestById(interestId);
    if (!interest) {
      throw new Error('Interest not found');
    }

    const updatedInterest = interestDataHelper.updateInterest(interestId, { status });

    // Log audit
    auditLogDataHelper.createLog({
      userId: adminUserId,
      action: 'INTEREST_STATUS_UPDATED',
      entity: 'interest',
      entityId: interestId,
      changes: { status },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return updatedInterest;
  }

  deleteInterest(interestId, userId, requestInfo = {}) {
    const interest = interestDataHelper.getInterestById(interestId);
    if (!interest) {
      throw new Error('Interest not found');
    }

    const success = interestDataHelper.deleteInterest(interestId);

    if (success) {
      // Log audit
      auditLogDataHelper.createLog({
        userId,
        action: 'INTEREST_DELETED',
        entity: 'interest',
        entityId: interestId,
        changes: { missionId: interest.missionId },
        ipAddress: requestInfo.ipAddress || '',
        userAgent: requestInfo.userAgent || ''
      });
    }

    return success;
  }
}

module.exports = new InterestService();

