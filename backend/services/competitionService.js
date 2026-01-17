const competitionDataHelper = require('../dataHelpers/competitionDataHelper');
const subEventDataHelper = require('../dataHelpers/subEventDataHelper');
const auditLogDataHelper = require('../dataHelpers/auditLogDataHelper');

class CompetitionService {
  // Generate slug from title
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  getAllCompetitions(userId = null) {
    const competitions = competitionDataHelper.getAllCompetitions();
    return competitions.map(comp => ({
      competitionId: comp.competitionId,
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

  getCompetitionById(competitionId) {
    const competition = competitionDataHelper.getCompetitionById(competitionId);
    if (!competition) return null;

    // Get sub-events for this competition
    const subEvents = subEventDataHelper.getSubEventsByCompetition(competitionId);

    return {
      ...competition,
      subEvents
    };
  }

  getCompetitionBySlug(slug) {
    const competition = competitionDataHelper.getCompetitionBySlug(slug);
    if (!competition) return null;

    // Get sub-events for this competition
    const subEvents = subEventDataHelper.getSubEventsByCompetition(competition.competitionId);

    return {
      ...competition,
      subEvents
    };
  }

  createCompetition(competitionData, userId, requestInfo = {}) {
    const { title, description, startDate, endDate, location, status, imageUrl } = competitionData;

    // Generate slug
    const slug = this.generateSlug(title);

    // Check if slug already exists
    const existingCompetition = competitionDataHelper.getCompetitionBySlug(slug);
    if (existingCompetition) {
      throw new Error('A competition with this title already exists');
    }

    // Create competition
    const newCompetition = competitionDataHelper.createCompetition({
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

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'COMPETITION_CREATED',
      entity: 'competition',
      entityId: newCompetition.competitionId,
      changes: { title, status: newCompetition.status },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return newCompetition;
  }

  updateCompetition(competitionId, updateData, userId, requestInfo = {}) {
    const competition = competitionDataHelper.getCompetitionById(competitionId);
    if (!competition) {
      throw new Error('Competition not found');
    }

    // If title is being updated, regenerate slug (but keep the old one - following memory rule)
    // Actually, based on memory: slug should NEVER change when name is updated
    if (updateData.title) {
      delete updateData.slug; // Ensure slug is never updated
    }

    // Update competition
    const updatedCompetition = competitionDataHelper.updateCompetition(competitionId, updateData);

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'COMPETITION_UPDATED',
      entity: 'competition',
      entityId: competitionId,
      changes: updateData,
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return updatedCompetition;
  }

  deleteCompetition(competitionId, userId, requestInfo = {}) {
    const competition = competitionDataHelper.getCompetitionById(competitionId);
    if (!competition) {
      throw new Error('Competition not found');
    }

    // Delete related sub-events
    subEventDataHelper.deleteSubEventsByCompetition(competitionId);

    // Delete competition
    const success = competitionDataHelper.deleteCompetition(competitionId);

    if (success) {
      // Log audit
      auditLogDataHelper.createLog({
        userId,
        action: 'COMPETITION_DELETED',
        entity: 'competition',
        entityId: competitionId,
        changes: { title: competition.title },
        ipAddress: requestInfo.ipAddress || '',
        userAgent: requestInfo.userAgent || ''
      });
    }

    return success;
  }

  publishCompetition(competitionId, userId, requestInfo = {}) {
    return this.updateCompetition(competitionId, { status: 'published' }, userId, requestInfo);
  }

  getPublishedCompetitions() {
    const competitions = competitionDataHelper.getPublishedCompetitions();
    return competitions.map(comp => ({
      competitionId: comp.competitionId,
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

  getUpcomingCompetitions() {
    return competitionDataHelper.getUpcomingCompetitions();
  }
}

module.exports = new CompetitionService();

