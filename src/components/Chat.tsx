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
  Minimize2, 
  Maximize2,
  Phone,
  Info,
  MoreVertical,
  Paperclip,
  Smile,
  Search,
  UserPlus,
  Users
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
    openChat,
    closeChat, 
    sendMessage, 
    searchUserByEmail,
    loadContacts 
  } = useChat();
  const { userProfile } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResult, setSearchResult] = useState<ChatContact | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userProfile?.id) {
      localStorage.setItem('currentUserId', userProfile.id);
      loadContacts();
    }
  }, [userProfile, loadContacts]);

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

  const handleSearchUser = async () => {
    if (searchEmail.trim()) {
      const user = await searchUserByEmail(searchEmail.trim());
      setSearchResult(user);
    }
  };

  const handleStartChat = (contact: ChatContact) => {
    console.log('Starting chat with:', contact);
    setShowSearch(false);
    setSearchEmail("");
    setSearchResult(null);
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
              ) : (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <h3 className="text-sm font-medium">Kontakty</h3>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
                className="h-8 w-8 text-white hover:bg-white/20"
                title="Szukaj użytkownika"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <Minimize2 className="h-4 w-4" />
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
          {showSearch ? (
            /* Search Interface */
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Wpisz email użytkownika..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearchUser} size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                {searchResult ? (
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-pink-100 text-pink-600">
                          {searchResult.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{searchResult.name}</h4>
                        <p className="text-sm text-gray-600">{searchResult.email}</p>
                        <p className="text-xs text-gray-500">{searchResult.role}</p>
                      </div>
                      <Button 
                        onClick={() => handleStartChat(searchResult)}
                        size="sm"
                        className="bg-pink-600 hover:bg-pink-700"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </div>
                ) : searchEmail && !searchResult ? (
                  <div className="text-center text-gray-500 py-4">
                    Nie znaleziono użytkownika
                  </div>
                ) : null}
              </div>
            </div>
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
          ) : (
            /* Contact List */
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-pink-100 text-pink-600">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{contact.name}</h4>
                    <p className="text-sm text-gray-600 truncate">{contact.email}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {contact.role}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${contact.isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleStartChat(contact)}
                    size="sm"
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

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
                <div className="flex items-center gap-2">
                  <span>Naciśnij Enter aby wysłać</span>
                  <Button
                    onClick={() => {
                      // Add test message for debugging
                      const testMessage = {
                        text: 'Test message from ' + new Date().toLocaleTimeString(),
                        senderId: userProfile?.id || 'test',
                        senderName: userProfile?.firstName + ' ' + userProfile?.lastName || 'Test User',
                        receiverId: currentContact.id,
                        timestamp: new Date(),
                        status: 'sent',
                        type: 'text'
                      };
                      console.log('Adding test message:', testMessage);
                    }}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    Test
                  </Button>
                </div>
                {currentContact.organization && (
                  <Badge variant="secondary" className="text-xs">
                    {currentContact.organization}
                  </Badge>
                )}
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