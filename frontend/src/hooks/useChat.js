import { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socket';
import { chatService } from '../services/chatService';

export const useChat = (currentUserId, selectedConversation) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation?.id) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadMessages = async (conversationId) => {
    try {
      setLoading(true);
      const msgs = await chatService.getMessages(conversationId);
      setMessages(msgs);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (message) => {
      if (message.conversationId === selectedConversation?.id) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleMessageSent = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleTyping = ({ userId, typing: isTyping }) => {
      if (selectedConversation && userId !== currentUserId) {
        setTyping(isTyping);
      }
    };

    socketService.on('message:receive', handleNewMessage);
    socketService.on('message:sent', handleMessageSent);
    socketService.on('typing:indicator', handleTyping);

    return () => {
      socketService.off('message:receive', handleNewMessage);
      socketService.off('message:sent', handleMessageSent);
      socketService.off('typing:indicator', handleTyping);
    };
  }, [selectedConversation, currentUserId]);

  const sendMessage = useCallback((text) => {
    if (!text.trim() || !selectedConversation) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: selectedConversation.otherUserId,
      text: text.trim(),
      conversationId: selectedConversation.id
    };

    socketService.emit('message:send', messageData);
  }, [currentUserId, selectedConversation]);

  const startTyping = useCallback(() => {
    if (selectedConversation) {
      socketService.emit('typing:start', {
        senderId: currentUserId,
        receiverId: selectedConversation.otherUserId
      });
    }
  }, [currentUserId, selectedConversation]);

  const stopTyping = useCallback(() => {
    if (selectedConversation) {
      socketService.emit('typing:stop', {
        senderId: currentUserId,
        receiverId: selectedConversation.otherUserId
      });
    }
  }, [currentUserId, selectedConversation]);

  return {
    messages,
    loading,
    typing,
    sendMessage,
    startTyping,
    stopTyping
  };
};