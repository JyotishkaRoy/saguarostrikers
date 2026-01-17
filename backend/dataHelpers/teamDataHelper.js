const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB, DB_FILES } = require('../config/database');

class TeamDataHelper {
  getAllTeams() {
    return readDB(DB_FILES.TEAMS);
  }

  getTeamById(teamId) {
    const teams = this.getAllTeams();
    return teams.find(team => team.teamId === teamId);
  }

  getTeamsByCompetition(competitionId) {
    const teams = this.getAllTeams();
    return teams.filter(team => team.competitionId === competitionId);
  }

  createTeam(teamData) {
    const teams = this.getAllTeams();
    const newTeam = {
      teamId: uuidv4(),
      ...teamData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    teams.push(newTeam);
    writeDB(DB_FILES.TEAMS, teams);
    return newTeam;
  }

  updateTeam(teamId, updateData) {
    const teams = this.getAllTeams();
    const index = teams.findIndex(team => team.teamId === teamId);
    
    if (index === -1) return null;
    
    teams[index] = {
      ...teams[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    writeDB(DB_FILES.TEAMS, teams);
    return teams[index];
  }

  deleteTeam(teamId) {
    const teams = this.getAllTeams();
    const filteredTeams = teams.filter(team => team.teamId !== teamId);
    
    if (teams.length === filteredTeams.length) return false;
    
    writeDB(DB_FILES.TEAMS, filteredTeams);
    return true;
  }

  // Team Members
  getAllTeamMembers() {
    return readDB(DB_FILES.TEAM_MEMBERS);
  }

  getTeamMembersByTeam(teamId) {
    const members = this.getAllTeamMembers();
    return members.filter(member => member.teamId === teamId);
  }

  getTeamMembersByUser(userId) {
    const members = this.getAllTeamMembers();
    return members.filter(member => member.userId === userId);
  }

  addTeamMember(memberData) {
    const members = this.getAllTeamMembers();
    const newMember = {
      memberId: uuidv4(),
      ...memberData,
      joinedAt: new Date().toISOString()
    };
    members.push(newMember);
    writeDB(DB_FILES.TEAM_MEMBERS, members);
    return newMember;
  }

  removeTeamMember(memberId) {
    const members = this.getAllTeamMembers();
    const filteredMembers = members.filter(member => member.memberId !== memberId);
    
    if (members.length === filteredMembers.length) return false;
    
    writeDB(DB_FILES.TEAM_MEMBERS, filteredMembers);
    return true;
  }

  removeTeamMembersByTeam(teamId) {
    const members = this.getAllTeamMembers();
    const filteredMembers = members.filter(member => member.teamId !== teamId);
    writeDB(DB_FILES.TEAM_MEMBERS, filteredMembers);
    return true;
  }

  updateTeamMember(memberId, updateData) {
    const members = this.getAllTeamMembers();
    const index = members.findIndex(member => member.memberId === memberId);
    
    if (index === -1) return null;
    
    members[index] = {
      ...members[index],
      ...updateData
    };
    
    writeDB(DB_FILES.TEAM_MEMBERS, members);
    return members[index];
  }
}

module.exports = new TeamDataHelper();

