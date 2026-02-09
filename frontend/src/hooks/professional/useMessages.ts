import { useState, useRef } from 'react';
import { matchingApi } from '../../services/api';

export function useMessages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectConversation = async (conv: any) => {
    setSelectedConversation(conv);
    try {
      const response = await matchingApi.getMessages(conv.id);
      if (response.success) {
        setChatMessages(response.data.messages);
        // Update local state to mark as read
        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
        // Scroll to bottom
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleSendMessage = async (userId: string | undefined) => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage || !userId) return;

    setSendingMessage(true);
    try {
      const response = await matchingApi.sendMessage(selectedConversation.id, { content: newMessage.trim() });
      if (response.success) {
        setChatMessages(prev => [...prev, response.data]);
        setNewMessage('');
        // Update last message in conversations list
        setConversations(prev => prev.map(c =>
          c.id === selectedConversation.id
            ? { ...c, lastMessage: response.data, messages: [...c.messages, response.data] }
            : c
        ));
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await matchingApi.getConversations();
      if (response.success) {
        setConversations(response.data);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  return {
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation,
    chatMessages,
    setChatMessages,
    newMessage,
    setNewMessage,
    sendingMessage,
    messagesEndRef,
    selectConversation,
    handleSendMessage,
    loadConversations,
  };
}
