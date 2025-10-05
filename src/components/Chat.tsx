import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  MessageCircle, 
  Send, 
  X, 
  Maximize2,
  Phone,
  Info,
  MoreVertical,
  Paperclip,
  Smile,
  Search,
  UserPlus,
  Users,
  RefreshCw
} from "lucide-react";
import { useChat, ChatContact, Message } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";

interface ChatProps {
  userType: 'wolontariusz' | 'koordynator' | 'organizacja';
}

export function Chat({ userType }: ChatProps) {
  const { 
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
    markMessagesAsRead
  } = useChat();
  const { userProfile } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [searchResults, setSearchResults] = useState<ChatContact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userProfile?.id) {
      localStorage.setItem('currentUserId', userProfile.id);
      loadContacts();
    }
  }, [userProfile, loadContacts]);

  // Load conversations when chat is opened
  useEffect(() => {
    if (isChatOpen && !currentContact) {
      loadConversations();
    }
  }, [isChatOpen, currentContact, loadConversations]);

  // Load messages when a contact is selected
  useEffect(() => {
    if (currentContact) {
      loadMessages(currentContact.id);
    }
  }, [currentContact, loadMessages]);

  // Mark messages as read when they are displayed
  useEffect(() => {
    if (currentContact && messages.length > 0) {
      markMessagesAsRead(currentContact.id);
    }
  }, [currentContact, messages, markMessagesAsRead]);

  // Removed automatic loading to prevent spam requests
  // useEffect(() => {
  //   if (isChatOpen && !currentContact) {
  //     loadConversations();
  //   }
  // }, [isChatOpen, currentContact, loadConversations]);

  // useEffect(() => {
  //   console.log('Conversations updated:', conversations);
  // }, [conversations]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log('Messages updated:', messages);
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && currentContact) {
      console.log('Sending message to:', currentContact.id, 'Text:', newMessage.trim());
      await sendMessage(newMessage.trim(), currentContact.id);
      setNewMessage("");
    }
  };

  const handleSearchUser = async (email: string) => {
    if (email.trim()) {
      setIsSearching(true);
      try {
        const users = await searchUserByEmail(email.trim());
        setSearchResults(users);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Debounced search function
  const handleSearchInputChange = (value: string) => {
    setSearchEmail(value);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      handleSearchUser(value);
    }, 500); // 500ms delay
    
    setSearchTimeout(timeout);
  };

  const handleStartChat = (contact: ChatContact) => {
    console.log('Starting chat with:', contact);
    
    // Prevent users from chatting with themselves
    if (contact.id === userProfile?.id) {
      console.log('Cannot chat with yourself');
      return;
    }
    
    setShowSearch(false);
    setSearchEmail("");
    setSearchResults([]);
    // Open chat with the selected contact
    openChat(contact);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('pl-PL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending': return '⏳';
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  };

  // Don't render if chat is not open
  if (!isChatOpen) {
    return null;
  }


  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="h-12 w-12 rounded-full bg-pink-600 hover:bg-pink-700 text-white shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-xl border-0 bg-white">
        {/* Header */}
        <CardHeader className="p-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
              {currentContact ? (
                <>
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-white text-pink-600 text-sm">
                      {currentContact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 max-w-[50%]">
                    <h3 className="text-sm font-medium break-words">{currentContact.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${currentContact.isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                      <p className="text-xs opacity-90 truncate">
                        {currentContact.isOnline ? 'Online' : currentContact.lastSeen || 'Offline'}
                      </p>
                    </div>
                  </div>
                </>
              ) : showSearch ? (
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  <h3 className="text-sm font-medium">Szukaj użytkowników</h3>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <h3 className="text-sm font-medium">Konwersacje</h3>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (currentContact) {
                    loadMessages(currentContact.id);
                  } else {
                    loadConversations();
                  }
                }}
                className="h-8 w-8 text-white hover:bg-white/20"
                title="Odśwież"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (currentContact) {
                    setShowSearch(!showSearch);
                  } else {
                    setShowSearch(!showSearch);
                  }
                }}
                className="h-8 w-8 text-white hover:bg-white/20"
                title={showSearch ? "Wróć do konwersacji" : "Szukaj użytkownika"}
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeChat}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-0 h-80 flex flex-col">
          {!currentContact ? (
            showSearch ? (
              /* Search Interface */
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Wpisz email użytkownika..."
                        value={searchEmail}
                        onChange={(e) => handleSearchInputChange(e.target.value)}
                        className="pr-8"
                      />
                      {isSearching && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                        </div>
                      )}
                    </div>
                    <Button 
                      onClick={() => handleSearchUser(searchEmail)} 
                      size="sm"
                      variant="outline"
                      disabled={isSearching}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {isSearching ? (
                    <div className="text-center text-gray-500 py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600 mx-auto mb-2"></div>
                      Szukanie użytkowników...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2 w-full">
                      {searchResults.map((user) => (
                        <div key={user.id} className="border rounded-lg p-3 bg-gray-50 w-full min-w-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="w-10 h-10 flex-shrink-0">
                              <AvatarFallback className="bg-pink-100 text-pink-600">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{user.name}</h4>
                              <p className="text-sm text-gray-600 truncate" title={user.email}>{user.email}</p>
                              <p className="text-xs text-gray-500 truncate">{user.role}</p>
                            </div>
                            <Button 
                              onClick={() => handleStartChat(user)}
                              size="sm"
                              className="bg-pink-600 hover:bg-pink-700 flex-shrink-0"
                              disabled={user.id === userProfile?.id}
                              title={user.id === userProfile?.id ? "Nie możesz pisać do siebie" : "Rozpocznij czat"}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Chat
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchEmail && searchResults.length === 0 && !isSearching ? (
                    <div className="text-center text-gray-500 py-4">
                      Nie znaleziono użytkowników
                    </div>
                  ) : !searchEmail ? (
                    <div className="text-center text-gray-400 py-4">
                      Wpisz email użytkownika aby wyszukać
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              /* Conversations List */
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2">
                {conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <div 
                      key={conversation.id} 
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200"
                      onClick={() => handleStartChat(conversation)}
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-pink-100 text-pink-600">
                            {conversation.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{conversation.name}</h4>
                          <span className="text-xs text-gray-500">
                            {conversation.lastMessage?.timestamp?.toDate ? 
                              conversation.lastMessage.timestamp.toDate().toLocaleTimeString('pl-PL', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              }) : 
                              'Teraz'
                            }
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage?.text || 'Brak wiadomości'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {conversation.role}
                          </Badge>
                          <div className={`w-2 h-2 rounded-full ${conversation.isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Brak konwersacji</p>
                    <p className="text-sm">Nie masz jeszcze żadnych wiadomości</p>
                    <div className="flex gap-2 justify-center mt-4">
                      <Button 
                        onClick={() => setShowSearch(true)}
                        className="bg-pink-600 hover:bg-pink-700"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Znajdź użytkowników
                      </Button>
                      <Button 
                        onClick={() => {
                          console.log('Manually refreshing conversations...');
                          loadConversations();
                        }}
                        variant="outline"
                        className="text-xs"
                      >
                        Odśwież
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : currentContact ? (
            /* Messages */
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  Brak wiadomości. Napisz pierwszą wiadomość!
                </div>
              ) : (
                messages.map((message) => {
                  const isCurrentUser = message.senderId === userProfile?.id;
                  console.log('Rendering message:', message, 'isCurrentUser:', isCurrentUser);
                  return (
                    <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[80%]">
                        <div
                          className={`rounded-2xl px-3 py-2 text-sm ${
                            isCurrentUser
                              ? 'bg-pink-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {message.text}
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                          {formatTime(message.timestamp)}
                          {isCurrentUser && (
                            <span className="ml-1 text-pink-600">
                              {getStatusIcon(message.status)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : null}

          {/* Input - only show when chatting with someone */}
          {currentContact && (
            <div className="border-t p-3">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Napisz wiadomość..."
                    className="border-gray-200 focus:border-pink-500 resize-none"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-pink-600 hover:bg-pink-700 text-white h-10 w-10 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Naciśnij Enter aby wysłać</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Chat Button Component for triggering chat
interface ChatButtonProps {
  contact: ChatContact;
  userType: 'wolontariusz' | 'koordynator' | 'organizacja';
  variant?: 'default' | 'icon' | 'inline';
  className?: string;
}

export function ChatButton({ contact, userType, variant = 'default', className = '' }: ChatButtonProps) {
  const { openChat } = useChat();

  const handleClick = () => {
    openChat(contact);
  };

  if (variant === 'icon') {
    return (
      <Button 
        variant="outline" 
        size="icon"
        onClick={handleClick}
        className={className}
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
    );
  }

  if (variant === 'inline') {
    return (
      <Button 
        variant="outline" 
        onClick={handleClick}
        className={`flex-1 ${className}`}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Kontakt
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleClick}
      className={`bg-gradient-to-r from-pink-500 to-pink-600 hover:opacity-90 text-white ${className}`}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Napisz wiadomość
    </Button>
  );
}