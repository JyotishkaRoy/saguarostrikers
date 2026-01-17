const contactMessageDataHelper = require('../dataHelpers/contactMessageDataHelper');
const auditLogDataHelper = require('../dataHelpers/auditLogDataHelper');

class ContactService {
  createContactMessage(messageData, requestInfo = {}) {
    const { name, email, subject, message } = messageData;

    const newMessage = contactMessageDataHelper.createMessage({
      name,
      email,
      subject,
      message
    });

    // Log audit (using system user for public contact)
    auditLogDataHelper.createLog({
      userId: 'public',
      action: 'CONTACT_MESSAGE_CREATED',
      entity: 'contactMessage',
      entityId: newMessage.messageId,
      changes: { email, subject },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return newMessage;
  }

  getAllMessages(userId) {
    return contactMessageDataHelper.getAllMessages();
  }

  getMessageById(messageId) {
    return contactMessageDataHelper.getMessageById(messageId);
  }

  getMessagesByStatus(status) {
    return contactMessageDataHelper.getMessagesByStatus(status);
  }

  markAsResponded(messageId, respondedBy, response, requestInfo = {}) {
    const message = contactMessageDataHelper.getMessageById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    const updatedMessage = contactMessageDataHelper.markAsResponded(messageId, respondedBy, response);

    // Log audit
    auditLogDataHelper.createLog({
      userId: respondedBy,
      action: 'CONTACT_MESSAGE_RESPONDED',
      entity: 'contactMessage',
      entityId: messageId,
      changes: { status: 'responded' },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return updatedMessage;
  }

  archiveMessage(messageId, userId, requestInfo = {}) {
    const message = contactMessageDataHelper.getMessageById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    const updatedMessage = contactMessageDataHelper.updateMessage(messageId, { status: 'archived' });

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'CONTACT_MESSAGE_ARCHIVED',
      entity: 'contactMessage',
      entityId: messageId,
      changes: { status: 'archived' },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return updatedMessage;
  }

  deleteMessage(messageId, userId, requestInfo = {}) {
    const message = contactMessageDataHelper.getMessageById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    const success = contactMessageDataHelper.deleteMessage(messageId);

    if (success) {
      // Log audit
      auditLogDataHelper.createLog({
        userId,
        action: 'CONTACT_MESSAGE_DELETED',
        entity: 'contactMessage',
        entityId: messageId,
        changes: { email: message.email },
        ipAddress: requestInfo.ipAddress || '',
        userAgent: requestInfo.userAgent || ''
      });
    }

    return success;
  }
}

module.exports = new ContactService();

