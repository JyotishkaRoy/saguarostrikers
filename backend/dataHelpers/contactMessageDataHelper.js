const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB, DB_FILES } = require('../config/database');

class ContactMessageDataHelper {
  getAllMessages() {
    return readDB(DB_FILES.CONTACT_MESSAGES);
  }

  getMessageById(messageId) {
    const messages = this.getAllMessages();
    return messages.find(msg => msg.messageId === messageId);
  }

  createMessage(messageData) {
    const messages = this.getAllMessages();
    const newMessage = {
      messageId: uuidv4(),
      ...messageData,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    writeDB(DB_FILES.CONTACT_MESSAGES, messages);
    return newMessage;
  }

  updateMessage(messageId, updateData) {
    const messages = this.getAllMessages();
    const index = messages.findIndex(msg => msg.messageId === messageId);
    
    if (index === -1) return null;
    
    messages[index] = {
      ...messages[index],
      ...updateData
    };
    
    writeDB(DB_FILES.CONTACT_MESSAGES, messages);
    return messages[index];
  }

  deleteMessage(messageId) {
    const messages = this.getAllMessages();
    const filteredMessages = messages.filter(msg => msg.messageId !== messageId);
    
    if (messages.length === filteredMessages.length) return false;
    
    writeDB(DB_FILES.CONTACT_MESSAGES, filteredMessages);
    return true;
  }

  getMessagesByStatus(status) {
    const messages = this.getAllMessages();
    return messages.filter(msg => msg.status === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  markAsResponded(messageId, respondedBy, response) {
    return this.updateMessage(messageId, {
      status: 'responded',
      respondedBy,
      respondedAt: new Date().toISOString(),
      response
    });
  }
}

module.exports = new ContactMessageDataHelper();

