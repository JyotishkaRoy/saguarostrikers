import { BaseDataHelper } from './BaseDataHelper.js';
import { ContactMessage, MessageStatus } from '../models/types.js';

export class ContactDataHelper extends BaseDataHelper<ContactMessage> {
  constructor() {
    super('contactMessages.json');
  }

  public getMessageById(messageId: string): ContactMessage | null {
    return this.getById(messageId, 'messageId');
  }

  public createMessage(messageData: ContactMessage): ContactMessage {
    return this.add(messageData);
  }

  public updateMessage(
    messageId: string,
    updates: Partial<ContactMessage>
  ): ContactMessage | null {
    return this.updateById(messageId, 'messageId', updates);
  }

  public deleteMessage(messageId: string): boolean {
    return this.deleteById(messageId, 'messageId');
  }

  public getMessagesByStatus(status: MessageStatus): ContactMessage[] {
    return this.findWhere(message => message.status === status);
  }

  public getNewMessages(): ContactMessage[] {
    return this.getMessagesByStatus('new');
  }

  public getRespondedMessages(): ContactMessage[] {
    return this.getMessagesByStatus('responded');
  }

  public markAsResponded(
    messageId: string,
    respondedBy: string,
    response: string
  ): ContactMessage | null {
    return this.updateMessage(messageId, {
      status: 'responded',
      respondedBy,
      respondedAt: new Date().toISOString(),
      response
    });
  }

  public archiveMessage(messageId: string): ContactMessage | null {
    return this.updateMessage(messageId, {
      status: 'archived'
    });
  }

  public countNewMessages(): number {
    return this.countWhere(message => message.status === 'new');
  }
}
