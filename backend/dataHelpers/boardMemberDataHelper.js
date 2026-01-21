const { generateId } = require('../utils/idGenerator.cjs');
const { readDB, writeDB, DB_FILES } = require('../config/database');

class BoardMemberDataHelper {
  getAllBoardMembers() {
    return readDB(DB_FILES.BOARD_MEMBERS);
  }

  getBoardMemberById(boardMemberId) {
    const members = this.getAllBoardMembers();
    return members.find(member => member.boardMemberId === boardMemberId);
  }

  getActiveBoardMembers() {
    const members = this.getAllBoardMembers();
    return members.filter(member => member.status === 'active')
      .sort((a, b) => a.order - b.order);
  }

  createBoardMember(memberData) {
    const members = this.getAllBoardMembers();
    const newMember = {
      boardMemberId: generateId(),
      ...memberData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    members.push(newMember);
    writeDB(DB_FILES.BOARD_MEMBERS, members);
    return newMember;
  }

  updateBoardMember(boardMemberId, updateData) {
    const members = this.getAllBoardMembers();
    const index = members.findIndex(member => member.boardMemberId === boardMemberId);
    
    if (index === -1) return null;
    
    members[index] = {
      ...members[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    writeDB(DB_FILES.BOARD_MEMBERS, members);
    return members[index];
  }

  deleteBoardMember(boardMemberId) {
    const members = this.getAllBoardMembers();
    const filteredMembers = members.filter(member => member.boardMemberId !== boardMemberId);
    
    if (members.length === filteredMembers.length) return false;
    
    writeDB(DB_FILES.BOARD_MEMBERS, filteredMembers);
    return true;
  }
}

module.exports = new BoardMemberDataHelper();

