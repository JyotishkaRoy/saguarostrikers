import { v4 as uuidv4 } from 'uuid';
import { TeamDataHelper, TeamMemberDataHelper } from '../data/TeamDataHelper.js';
import { CompetitionDataHelper } from '../data/CompetitionDataHelper.js';
import { UserDataHelper } from '../data/UserDataHelper.js';
import { Team, TeamMember, CreateTeamData } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';

export class TeamService {
  private teamDataHelper: TeamDataHelper;
  private teamMemberDataHelper: TeamMemberDataHelper;
  private competitionDataHelper: CompetitionDataHelper;
  private userDataHelper: UserDataHelper;

  constructor() {
    this.teamDataHelper = new TeamDataHelper();
    this.teamMemberDataHelper = new TeamMemberDataHelper();
    this.competitionDataHelper = new CompetitionDataHelper();
    this.userDataHelper = new UserDataHelper();
  }

  /**
   * Get all teams
   */
  async getAllTeams(): Promise<Team[]> {
    return this.teamDataHelper.getAll();
  }

  /**
   * Get team by ID
   */
  async getTeamById(teamId: string): Promise<Team> {
    const team = this.teamDataHelper.getTeamById(teamId);
    
    if (!team) {
      throw createError.notFound('Team not found');
    }

    return team;
  }

  /**
   * Get teams for a competition
   */
  async getTeamsByCompetition(competitionId: string): Promise<Team[]> {
    return this.teamDataHelper.getTeamsByCompetition(competitionId);
  }

  /**
   * Create team
   */
  async createTeam(data: CreateTeamData, createdBy: string): Promise<Team> {
    // Verify competition exists
    const competition = this.competitionDataHelper.getCompetitionById(data.competitionId);
    
    if (!competition) {
      throw createError.notFound('Competition not found');
    }

    const team: Team = {
      teamId: uuidv4(),
      competitionId: data.competitionId,
      teamName: data.teamName,
      description: data.description,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.teamDataHelper.createTeam(team);
  }

  /**
   * Update team
   */
  async updateTeam(
    teamId: string,
    updates: {
      teamName?: string;
      description?: string;
    }
  ): Promise<Team> {
    const team = this.teamDataHelper.getTeamById(teamId);
    
    if (!team) {
      throw createError.notFound('Team not found');
    }

    const updatedTeam = this.teamDataHelper.updateTeam(teamId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    if (!updatedTeam) {
      throw createError.internal('Failed to update team');
    }

    return updatedTeam;
  }

  /**
   * Delete team (cascades to members)
   */
  async deleteTeam(teamId: string): Promise<void> {
    const team = this.teamDataHelper.getTeamById(teamId);
    
    if (!team) {
      throw createError.notFound('Team not found');
    }

    // Delete team members
    this.teamMemberDataHelper.removeMembersByTeam(teamId);

    // Delete team
    const deleted = this.teamDataHelper.deleteTeam(teamId);
    
    if (!deleted) {
      throw createError.internal('Failed to delete team');
    }
  }

  /**
   * Add member to team
   */
  async addTeamMember(
    teamId: string,
    userId: string,
    role: string = 'Member'
  ): Promise<TeamMember> {
    // Verify team exists
    const team = this.teamDataHelper.getTeamById(teamId);
    if (!team) {
      throw createError.notFound('Team not found');
    }

    // Verify user exists
    const user = this.userDataHelper.getUserById(userId);
    if (!user) {
      throw createError.notFound('User not found');
    }

    // Check if user is already in team
    if (this.teamMemberDataHelper.isUserInTeam(userId, teamId)) {
      throw createError.conflict('User is already a member of this team');
    }

    const teamMember: TeamMember = {
      memberId: uuidv4(),
      teamId,
      userId,
      role,
      joinedAt: new Date().toISOString()
    };

    return this.teamMemberDataHelper.addMember(teamMember);
  }

  /**
   * Remove member from team
   */
  async removeTeamMember(memberId: string): Promise<void> {
    const member = this.teamMemberDataHelper.getMemberById(memberId);
    
    if (!member) {
      throw createError.notFound('Team member not found');
    }

    const removed = this.teamMemberDataHelper.removeMember(memberId);
    
    if (!removed) {
      throw createError.internal('Failed to remove team member');
    }
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return this.teamMemberDataHelper.getMembersByTeam(teamId);
  }

  /**
   * Get user's teams
   */
  async getUserTeams(userId: string): Promise<TeamMember[]> {
    return this.teamMemberDataHelper.getMembersByUser(userId);
  }

  /**
   * Get team with members (enriched)
   */
  async getTeamWithMembers(teamId: string): Promise<{
    team: Team;
    members: Array<TeamMember & { user?: Omit<import('../models/types.js').User, 'password'> }>;
  }> {
    const team = await this.getTeamById(teamId);
    const members = this.teamMemberDataHelper.getMembersByTeam(teamId);

    // Enrich members with user details
    const enrichedMembers = members.map(member => {
      const user = this.userDataHelper.getUserById(member.userId);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return { ...member, user: userWithoutPassword };
      }
      return member;
    });

    return {
      team,
      members: enrichedMembers
    };
  }
}
