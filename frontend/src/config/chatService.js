const API_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const chatService = {
  async getConversations(userId) {
    const response = await fetch(`${API_URL}/api/conversations/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return response.json();
  },

  async getMessages(conversationId, limit = 50) {
    const response = await fetch(`${API_URL}/api/messages/${conversationId}?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  async createConversation(userId1, userId2) {
    const response = await fetch(`${API_URL}/api/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId1, userId2 })
    });
    if (!response.ok) throw new Error('Failed to create conversation');
    return response.json();
  }
};