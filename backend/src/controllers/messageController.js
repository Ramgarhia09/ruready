// src/services/messageService.js

const { db } = require('../config/firebase.config');
const logger = require('../utils/logger'); // We'll create this soon

class MessageService {
  /**
   * Send a message - saves to Firestore and returns enriched message
   */
  static async sendMessage({ senderId, receiverId, text, conversationId }) {
    if (!senderId || !receiverId || !text?.trim() || !conversationId) {
      throw new Error('Missing required fields: senderId, receiverId, text, conversationId');
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      throw new Error('Message text cannot be empty');
    }

    if (trimmedText.length > 5000) { // Optional: limit message size
      throw new Error('Message too long');
    }

    const messageData = {
      senderId,
      receiverId,
      text: trimmedText,
      timestamp: new Date(),
      read: false,
      conversationId,
    };

    try {
      // Save message
      const messageRef = await db.collection('messages').add(messageData);
      const messageId = messageRef.id;

      const messageWithId = { id: messageId, ...messageData };

      // Update conversation
      await db
        .collection('conversations')
        .doc(conversationId)
        .update({
          lastMessage: trimmedText,
          lastMessageTime: new Date(),
          updatedAt: new Date(),
        });

      logger.info('Message saved to Firestore', { messageId, conversationId });

      return messageWithId;
    } catch (error) {
      logger.error('Failed to save message to Firestore', {
        error: error.message,
        senderId,
        conversationId,
      });
      throw error; // Re-throw for socket handler to catch
    }
  }

  /**
   * Mark messages as read for a user in a conversation
   */
  static async markAsRead({ conversationId, userId }) {
    if (!conversationId || !userId) {
      throw new Error('conversationId and userId are required');
    }

    try {
      const snapshot = await db
        .collection('messages')
        .where('conversationId', '==', conversationId)
        .where('receiverId', '==', userId)
        .where('read', '==', false)
        .get();

      if (snapshot.empty) {
        return 0; // No messages to update
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();

      const count = snapshot.size;
      logger.info('Messages marked as read', { count, conversationId, userId });

      return count;
    } catch (error) {
      logger.error('Failed to mark messages as read', {
        error: error.message,
        conversationId,
        userId,
      });
      throw error;
    }
  }
}

module.exports = MessageService;