import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  getDocs,
  getDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Chat contact interface
export interface ChatContact {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

// Message interface
export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  timestamp: any;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
}

interface ChatContextType {
  isChatOpen: boolean;
  currentContact: ChatContact | null;
  messages: Message[];
  contacts: ChatContact[];
  conversations: ChatContact[];
  openChat: (contact?: ChatContact) => void;
  closeChat: () => void;
  sendMessage: (text: string, receiverId: string) => Promise<void>;
  searchUserByEmail: (email: string) => Promise<ChatContact[]>;
  loadContacts: () => Promise<void>;
  loadConversations: () => Promise<void>;
  loadMessages: (contactId: string) => Promise<void>;
  markMessagesAsRead: (contactId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: any;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [conversations, setConversations] = useState<ChatContact[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unsubscribeMessages, setUnsubscribeMessages] = useState<(() => void) | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    console.log('ChatContext: currentUserId from localStorage:', userId);
    if (userId) {
      setCurrentUserId(userId);
    }
    
    // Cleanup on unmount
    return () => {
      if (unsubscribeMessages && typeof unsubscribeMessages === 'function') {
        unsubscribeMessages();
      }
    };
  }, [unsubscribeMessages]);

  const openChat = (contact?: ChatContact) => {
    console.log('Opening chat with:', contact);
    
    // Prevent multiple rapid calls
    if (isChatOpen && !contact && !currentContact) {
      console.log('Chat already open without contact, ignoring duplicate call');
      return;
    }
    
    // Clean up previous message listener
    if (unsubscribeMessages && typeof unsubscribeMessages === 'function') {
      unsubscribeMessages();
    }
    
    // If no contact provided, open chat without target
    if (!contact) {
      setCurrentContact(null);
      setIsChatOpen(true);
      setMessages([]);
      return;
    }
    
    setCurrentContact(contact);
    setIsChatOpen(true);
    const unsubscribe = loadMessages(contact.id);
    setUnsubscribeMessages(() => unsubscribe);
  };

  const closeChat = () => {
    // Clean up message listener
    if (unsubscribeMessages && typeof unsubscribeMessages === 'function') {
      unsubscribeMessages();
      setUnsubscribeMessages(null);
    }
    
    setIsChatOpen(false);
    setCurrentContact(null);
    setMessages([]);
  };

  const sendMessage = async (text: string, receiverId: string) => {
    if (!currentUserId || !text.trim()) {
      console.log('Cannot send message - missing currentUserId or empty text');
      return;
    }

    try {
      // Get sender name from current user profile
      const senderName = localStorage.getItem('currentUserName') || 'Unknown';
      
      const messageData = {
        text: text.trim(),
        senderId: currentUserId,
        senderName: senderName,
        receiverId: receiverId,
        timestamp: serverTimestamp(),
        status: 'sent',
        type: 'text'
      };

      console.log('Sending message to Firebase:', messageData);
      const docRef = await addDoc(collection(db, 'messages'), messageData);
      console.log('Message sent successfully with ID:', docRef.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const searchUserByEmail = async (email: string): Promise<ChatContact[]> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '>=', email), where('email', '<=', email + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      
      const results: ChatContact[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        // Don't include current user in search results
        if (doc.id !== currentUserId) {
          results.push({
            id: doc.id,
            name: userData.firstName + ' ' + userData.lastName,
            email: userData.email,
            role: userData.userType || 'wolontariusz',
            organization: userData.organizationName,
            avatar: userData.avatar,
            isOnline: true, // For now, assume all users are online
            lastSeen: 'Online'
          });
        }
      });
      
      console.log('Search results for:', email, 'found:', results.length, 'users');
      return results;
    } catch (error) {
      console.error('Error searching user:', error);
      return [];
    }
  };

  const loadMessages = useCallback(async (contactId: string) => {
    if (!currentUserId) {
      console.log('No currentUserId, cannot load messages');
      return;
    }

    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        orderBy('timestamp', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const messagesData: Message[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Filter messages between current user and contact
        if ((data.senderId === currentUserId && data.receiverId === contactId) ||
            (data.senderId === contactId && data.receiverId === currentUserId)) {
          messagesData.push({
            id: doc.id,
            text: data.text,
            senderId: data.senderId,
            senderName: data.senderName || 'Unknown',
            receiverId: data.receiverId,
            timestamp: data.timestamp,
            status: data.status || 'sent',
            type: data.type || 'text'
          });
        }
      });
      
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [currentUserId]);


  const loadContacts = useCallback(async () => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const contactsData: ChatContact[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (doc.id !== currentUserId) { // Don't include current user
          contactsData.push({
            id: doc.id,
            name: userData.firstName + ' ' + userData.lastName,
            email: userData.email,
            role: userData.userType || 'wolontariusz',
            organization: userData.organizationName,
            avatar: userData.avatar,
            isOnline: true,
            lastSeen: 'Online'
          });
        }
      });
      
      console.log('Loaded contacts:', contactsData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }, [currentUserId]);

  const loadConversations = useCallback(async () => {
    if (!currentUserId) {
      console.log('No currentUserId, cannot load conversations');
      return;
    }
    
    if (isLoadingConversations) {
      console.log('Already loading conversations, skipping...');
      return;
    }
    
    console.log('Loading conversations for user:', currentUserId);
    setIsLoadingConversations(true);
    
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'desc'));
      
      const querySnapshot = await getDocs(q);
      
      console.log('Found', querySnapshot.size, 'total messages');
      
      // Get all unique conversation partners
      const conversationMap = new Map<string, { contact: ChatContact, lastMessage: Message, unreadCount: number }>();
      
      // First, collect all unique user IDs from messages
      const userIds = new Set<string>();
      querySnapshot.forEach((doc) => {
        const messageData = doc.data();
        const senderId = messageData.senderId;
        const receiverId = messageData.receiverId;
        
        // console.log('Message:', doc.id, 'sender:', senderId, 'receiver:', receiverId, 'currentUser:', currentUserId);
        
        if (senderId !== currentUserId) userIds.add(senderId);
        if (receiverId !== currentUserId) userIds.add(receiverId);
      });
      
      console.log('Unique user IDs found:', Array.from(userIds));
      
      // Filter out invalid user IDs (numbers, 'chat', empty strings, etc.)
      const validUserIds = Array.from(userIds).filter(userId => 
        typeof userId === 'string' && 
        userId.length > 0 && 
        userId !== 'chat' && 
        userId !== '0' &&
        !isNaN(Number(userId)) === false // Keep string IDs, filter out pure numbers
      );
      
      console.log('Valid user IDs after filtering:', validUserIds);
      
      // Get all user data at once
      const userPromises = validUserIds.map(async (userId) => {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            id: userId,
            name: userData.firstName + ' ' + userData.lastName,
            email: userData.email,
            role: userData.userType === 'koordynator' ? 'Koordynator' : (userData.userType || 'wolontariusz'),
            organization: userData.organizationName,
            avatar: userData.avatar,
            isOnline: true,
            lastSeen: 'Online'
          };
        }
        return null;
      });
      
      const users = (await Promise.all(userPromises)).filter(Boolean) as ChatContact[];
      const userMap = new Map(users.map(user => [user.id, user]));
      
      // Now process messages
      querySnapshot.forEach((doc) => {
        const messageData = doc.data();
        const message: Message = {
          id: doc.id,
          text: messageData.text,
          senderId: messageData.senderId,
          senderName: messageData.senderName || 'Unknown',
          receiverId: messageData.receiverId,
          timestamp: messageData.timestamp,
          status: messageData.status || 'sent',
          type: messageData.type || 'text'
        };
        
        console.log(`Processing message: ${message.id} from ${message.senderId} to ${message.receiverId}, status: ${message.status}, currentUserId: ${currentUserId}`);
        
        // Determine the other participant in the conversation
        const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
        
        if (otherUserId !== currentUserId && userMap.has(otherUserId)) {
          const user = userMap.get(otherUserId)!;
          
          if (!conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, {
              contact: user,
              lastMessage: message,
              unreadCount: 0
            });
          }
          
          // Update unread count if message is sent TO current user, not FROM current user, and not read
          if (message.receiverId === currentUserId && message.senderId !== currentUserId && message.status !== 'read') {
            const conversation = conversationMap.get(otherUserId);
            if (conversation) {
              conversation.unreadCount++;
              console.log(`Incrementing unread count for ${otherUserId}: ${conversation.unreadCount} (message from ${message.senderId} to ${message.receiverId}, status: ${message.status})`);
            }
          }
        }
      });
      
      // Convert to array and sort by unread count first, then by last message timestamp
      const conversationsData = Array.from(conversationMap.values())
        .map(item => ({
          ...item.contact,
          lastMessage: item.lastMessage,
          unreadCount: item.unreadCount
        }))
        .sort((a, b) => {
          // First sort by unread count (descending)
          if (a.unreadCount !== b.unreadCount) {
            return b.unreadCount - a.unreadCount;
          }
          // Then sort by last message timestamp (descending)
          return b.lastMessage.timestamp.toDate().getTime() - a.lastMessage.timestamp.toDate().getTime();
        });
      
      setConversations(conversationsData);
      
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [currentUserId]);

  const markMessagesAsRead = useCallback(async (contactId: string) => {
    if (!currentUserId) return;

    try {
      // Get all messages between current user and contact
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const updatePromises: Promise<void>[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Filter messages between current user and contact that are unread
        if (data.receiverId === currentUserId && 
            data.senderId === contactId && 
            data.status !== 'read') {
          updatePromises.push(updateDoc(doc.ref, { status: 'read' }));
        }
      });

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        
        // Reload conversations to update unread counts
        loadConversations();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [currentUserId, loadConversations]);

  // Debug function to add test message
  const addTestMessage = async (contactId: string) => {
    if (!currentUserId) return;
    
    const testMessage = {
      text: 'Test message from ' + new Date().toLocaleTimeString(),
      senderId: currentUserId,
      senderName: localStorage.getItem('currentUserName') || 'Test User',
      receiverId: contactId,
      timestamp: serverTimestamp(),
      status: 'sent',
      type: 'text'
    };
    
    try {
      console.log('Adding test message:', testMessage);
      await addDoc(collection(db, 'messages'), testMessage);
      console.log('Test message added successfully');
    } catch (error) {
      console.error('Error adding test message:', error);
    }
  };

  const value: ChatContextType = {
    isChatOpen,
    currentContact,
    messages,
    contacts,
    conversations,
    openChat,
    closeChat,
    sendMessage,
    searchUserByEmail,
    loadContacts,
    loadConversations,
    loadMessages,
    markMessagesAsRead,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};