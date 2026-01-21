import { BaseDataHelper } from './BaseDataHelper.js';
import { BoardMember, User } from '../models/types.js';
import { UserDataHelper } from './UserDataHelper.js';

export class BoardMemberDataHelper extends BaseDataHelper<BoardMember> {
  private userDataHelper: UserDataHelper;

  constructor() {
    super('boardMembers.json');
    this.userDataHelper = new UserDataHelper();
  }

  public getAll(): BoardMember[] {
    const members = super.getAll();
    return this.enrichWithUserProfileImages(members);
  }

  public getBoardMemberById(boardMemberId: string): BoardMember | null {
    return this.getById(boardMemberId, 'boardMemberId');
  }

  public createBoardMember(memberData: BoardMember): BoardMember {
    return this.add(memberData);
  }

  public updateBoardMember(
    boardMemberId: string,
    updates: Partial<BoardMember>
  ): BoardMember | null {
    return this.updateById(boardMemberId, 'boardMemberId', updates);
  }

  public deleteBoardMember(boardMemberId: string): boolean {
    return this.deleteById(boardMemberId, 'boardMemberId');
  }

  public getActiveBoardMembers(): BoardMember[] {
    const members = this.findWhere(member => member.status === 'active').sort(
      (a, b) => a.order - b.order
    );
    return this.enrichWithUserProfileImages(members);
  }

  // Helper method to enrich board members with user profile pictures
  private enrichWithUserProfileImages(members: BoardMember[]): BoardMember[] {
    return members.map(member => {
      // If board member has no image, try to use user's profile picture
      if (!member.imageUrl || member.imageUrl.trim() === '') {
        const users: User[] = this.userDataHelper.getAll();
        const user = users.find((u: User) => u.email === member.email);
        if (user?.profileImageUrl) {
          return { ...member, imageUrl: user.profileImageUrl };
        }
      }
      return member;
    });
  }

  public getBoardMembersByStatus(status: 'active' | 'inactive'): BoardMember[] {
    return this.findWhere(member => member.status === status);
  }

  public reorderBoardMembers(orderedIds: string[]): void {
    this.loadData();
    
    orderedIds.forEach((id, index) => {
      const member = this.data.find(m => m.boardMemberId === id);
      if (member) {
        member.order = index;
      }
    });
    
    this.saveData();
  }
}
