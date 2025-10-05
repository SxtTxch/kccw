import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  getDocs,
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
  openChat: (contact: ChatContact) => void;
  closeChat: () => void;
  sendMessage: (text: string, receiverId: string) => Promise<void>;
  searchUserByEmail: (email: string) => Promise<ChatContact | null>;
  loadContacts: () => Promise<void>;
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unsubscribeMessages, setUnsubscribeMessages] = useState<(() => void) | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
      setCurrentUserId(userId);
    }
    
    // Cleanup on unmount
    return () => {
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
    };
  }, [unsubscribeMessages]);

  const openChat = (contact: ChatContact) => {
    console.log('Opening chat with:', contact);
    
    // Clean up previous message listener
    if (unsubscribeMessages) {
      unsubscribeMessages();
    }
    
    setCurrentContact(contact);
    setIsChatOpen(true);
    const unsubscribe = loadMessages(contact.id);
    setUnsubscribeMessages(() => unsubscribe);
  };

  const closeChat = () => {
    // Clean up message listener
    if (unsubscribeMessages) {
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

  const searchUserByEmail = async (email: string): Promise<ChatContact | null> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        return {
          id: userDoc.id,
          name: userData.firstName + ' ' + userData.lastName,
          email: userData.email,
          role: userData.userType || 'wolontariusz',
          organization: userData.organizationName,
          avatar: userData.avatar,
          isOnline: true, // For now, assume all users are online
          lastSeen: 'Online'
        };
      }
      return null;
    } catch (error) {
      console.error('Error searching user:', error);
      return null;
    }
  };

  const loadMessages = (contactId: string) => {
    if (!currentUserId) {
      console.log('No currentUserId, cannot load messages');
      return;
    }

    console.log('Loading messages between:', currentUserId, 'and', contactId);

    const messagesRef = collection(db, 'messages');
    
    // Use a simpler approach - get all messages and filter client-side
    const q = query(
      messagesRef,
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('All messages snapshot received:', snapshot.size, 'total messages');
      const messagesData: Message[] = [];
      
      snapshot.forEach((doc) => {
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
      
      console.log('Filtered messages for this conversation:', messagesData.length);
      console.log('Setting messages:', messagesData);
      setMessages(messagesData);
    }, (error) => {
      console.error('Error loading messages:', error);
    });

    return unsubscribe;
  };

  const loadContacts = async () => {
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
  };

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
    openChat,
    closeChat,
    sendMessage,
    searchUserByEmail,
    loadContacts,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};