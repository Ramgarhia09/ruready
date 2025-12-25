// src/services/messageService.js

const { db } = require('../config/firebase.config');
const logger = require('../utils/logger'); // We'll create logger.js soon

class MessageService {
  /**
   * Send a message - saves to Firestore and returns the full message with ID
   * @param {Object} data
   * @param {string} data.senderId
   * @param {string} data.receiverId
   * @param {string} data.text
   * @param {string} data.conversationId
   * @returns {Object} message with ID
   */
  static async sendMessage({ senderId, receiverId, text, conversationId }) {
    // Input validation
    if (!senderId || !receiverId || !conversationId) {
      throw new Error('senderId, receiverId, and conversationId are required');
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Message text is required and cannot be empty');
    }

    if (text.trim().length > 5000) {
      throw new Error('Message is too long (max 5000 characters)');
    }

    const trimmedText = text.trim();

    const messageData = {
      senderId,
      receiverId,
      text: trimmedText,
      timestamp: new Date(),
      read: false,
      conversationId,
    };

    try {
      // Save message to Firestore
      const messageRef = await db.collection('messages').add(messageData);
      const messageId = messageRef.id;

      const messageWithId = { id: messageId, ...messageData };

      // Update conversation metadata
      await db.collection('conversations').doc(conversationId).update({
        lastMessage: trimmedText,
        lastMessageTime: new Date(),
        updatedAt: new Date(),
      });

      logger.info('Message saved successfully', {
        messageId,
        conversationId,
        senderId,
        receiverId,
      });

      return messageWithId;
    } catch (error) {
      logger.error('Failed to send message', {
        error: error.message,
        senderId,
        receiverId,
        conversationId,
      });
      throw new Error('Failed to save message'); // Hide internal details
    }
  }

  /**
   * Mark all unread messages as read for a user in a conversation
   * @param {Object} data
   * @param {string} data.conversationId
   * @param {string} data.userId - The receiver who is marking as read
   * @returns {number} Number of messages updated
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
        return 0; // Nothing to update
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();

      const count = snapshot.size;

      logger.info('Messages marked as read', {
        count,
        conversationId,
        userId,
      });

      return count;
    } catch (error) {
      logger.error('Failed to mark messages as read', {
        error: error.message,
        conversationId,
        userId,
      });
      throw new Error('Failed to mark messages as read');
    }
  }
}

module.exports = MessageService;