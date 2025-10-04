import React, { createContext, useContext, useState } from 'react';

// Chat contact interface
export interface ChatContact {
  id: number;
  name: string;
  role: string;
  organization?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface ChatContextType {
  isChatOpen: boolean;
  currentContact: ChatContact | null;
  openChat: (contact: ChatContact) => void;
  closeChat: () => void;
}

const ChatContext = createContext(undefined);

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
  const [currentContact, setCurrentContact] = useState(null);

  const openChat = (contact: ChatContact) => {
    setCurrentContact(contact);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setCurrentContact(null);
  };

  const value: ChatContextType = {
    isChatOpen,
    currentContact,
    openChat,
    closeChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
