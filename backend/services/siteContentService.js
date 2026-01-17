const siteContentDataHelper = require('../dataHelpers/siteContentDataHelper');
const boardMemberDataHelper = require('../dataHelpers/boardMemberDataHelper');
const auditLogDataHelper = require('../dataHelpers/auditLogDataHelper');

class SiteContentService {
  getHomepageContent() {
    return siteContentDataHelper.getHomepageContent();
  }

  updateHomepageContent(updateData, userId, requestInfo = {}) {
    const updatedContent = siteContentDataHelper.updateHomepageContent(updateData);

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'HOMEPAGE_CONTENT_UPDATED',
      entity: 'siteContent',
      entityId: 'homepage',
      changes: updateData,
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return updatedContent;
  }

  addHeroImage(imageUrl, userId, requestInfo = {}) {
    const updatedContent = siteContentDataHelper.addHeroImage(imageUrl);

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'HERO_IMAGE_ADDED',
      entity: 'siteContent',
      entityId: 'homepage',
      changes: { imageUrl },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return updatedContent;
  }

  removeHeroImage(imageUrl, userId, requestInfo = {}) {
    const updatedContent = siteContentDataHelper.removeHeroImage(imageUrl);

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'HERO_IMAGE_REMOVED',
      entity: 'siteContent',
      entityId: 'homepage',
      changes: { imageUrl },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return updatedContent;
  }

  // Board Members
  getAllBoardMembers() {
    return boardMemberDataHelper.getAllBoardMembers();
  }

  getActiveBoardMembers() {
    return boardMemberDataHelper.getActiveBoardMembers();
  }

  createBoardMember(memberData, userId, requestInfo = {}) {
    const { name, position, bio, imageUrl, order, status } = memberData;

    const newMember = boardMemberDataHelper.createBoardMember({
      name,
      position,
      bio,
      imageUrl: imageUrl || '',
      order: order || 0,
      status: status || 'active'
    });

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'BOARD_MEMBER_CREATED',
      entity: 'boardMember',
      entityId: newMember.boardMemberId,
      changes: { name, position },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return newMember;
  }

  updateBoardMember(boardMemberId, updateData, userId, requestInfo = {}) {
    const member = boardMemberDataHelper.getBoardMemberById(boardMemberId);
    if (!member) {
      throw new Error('Board member not found');
    }

    const updatedMember = boardMemberDataHelper.updateBoardMember(boardMemberId, updateData);

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'BOARD_MEMBER_UPDATED',
      entity: 'boardMember',
      entityId: boardMemberId,
      changes: updateData,
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return updatedMember;
  }

  deleteBoardMember(boardMemberId, userId, requestInfo = {}) {
    const member = boardMemberDataHelper.getBoardMemberById(boardMemberId);
    if (!member) {
      throw new Error('Board member not found');
    }

    const success = boardMemberDataHelper.deleteBoardMember(boardMemberId);

    if (success) {
      // Log audit
      auditLogDataHelper.createLog({
        userId,
        action: 'BOARD_MEMBER_DELETED',
        entity: 'boardMember',
        entityId: boardMemberId,
        changes: { name: member.name },
        ipAddress: requestInfo.ipAddress || '',
        userAgent: requestInfo.userAgent || ''
      });
    }

    return success;
  }
}

module.exports = new SiteContentService();

