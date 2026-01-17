const interestDataHelper = require('../dataHelpers/interestDataHelper');
const competitionDataHelper = require('../dataHelpers/competitionDataHelper');
const userDataHelper = require('../dataHelpers/userDataHelper');
const auditLogDataHelper = require('../dataHelpers/auditLogDataHelper');

class InterestService {
  showInterest(userId, competitionId, message, requestInfo = {}) {
    // Verify competition exists and is published
    const competition = competitionDataHelper.getCompetitionById(competitionId);
    if (!competition) {
      throw new Error('Competition not found');
    }

    if (competition.status !== 'published') {
      throw new Error('Cannot show interest in unpublished competition');
    }

    // Check if user already showed interest
    const existingInterest = interestDataHelper.getInterestByUserAndCompetition(userId, competitionId);
    if (existingInterest) {
      throw new Error('You have already shown interest in this competition');
    }

    // Create interest
    const newInterest = interestDataHelper.createInterest({
      userId,
      competitionId,
      message: message || ''
    });

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'INTEREST_SHOWN',
      entity: 'interest',
      entityId: newInterest.interestId,
      changes: { competitionId },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return newInterest;
  }

  getUserInterests(userId) {
    const interests = interestDataHelper.getInterestsByUser(userId);
    return interests.map(interest => {
      const competition = competitionDataHelper.getCompetitionById(interest.competitionId);
      return {
        ...interest,
        competition: competition ? {
          competitionId: competition.competitionId,
          title: competition.title,
          slug: competition.slug,
          startDate: competition.startDate,
          endDate: competition.endDate,
          status: competition.status
        } : null
      };
    });
  }

  getCompetitionInterests(competitionId, adminUserId) {
    const interests = interestDataHelper.getInterestsByCompetition(competitionId);
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
        changes: { competitionId: interest.competitionId },
        ipAddress: requestInfo.ipAddress || '',
        userAgent: requestInfo.userAgent || ''
      });
    }

    return success;
  }
}

module.exports = new InterestService();

