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
  Smile
} from "lucide-react";
import { useChat, ChatContact } from "../contexts/ChatContext";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'contact' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface ChatProps {
  userType: 'wolontariusz' | 'koordynator' | 'organizacja';
}

export function Chat({ userType }: ChatProps) {
  const { isChatOpen, currentContact, closeChat } = useChat();
  const [isMinimized, setIsMinimized] = useState(false);

  // Don't render if chat is not open or no contact
  if (!isChatOpen || !currentContact) {
    return null;
  }

  const contact = currentContact;
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Cześć! Dziękuję za zainteresowanie naszą ofertą wolontariatu. W czym mogę Ci pomóc?",
      sender: 'contact',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      status: 'read'
    },
    {
      id: 2,
      text: "Dzień dobry! Chciałbym dowiedzieć się więcej o wymaganiach i terminach.",
      sender: 'user',
      timestamp: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
      status: 'read'
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now(),
        text: newMessage.trim(),
        sender: 'user',
        timestamp: new Date(),
        status: 'sending'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage("");
      
      // Simulate message being sent
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id ? { ...msg, status: 'sent' } : msg
          )
        );
      }, 500);

      // Simulate contact typing response
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const responses = [
            "Świetnie! Wymagania to podstawowa znajomość pracy z dziećmi. Czy masz jakieś doświadczenie?",
            "Projekt rozpoczyna się 15 listopada. Potrzebujemy Cię na 3 godziny tygodniowo.",
            "Oczywiście! Chętnie opowiem więcej. Czy możemy umówić się na krótką rozmowę?",
            "To brzmi doskonale! Prześlę Ci szczegółowe informacje na email.",
            "Dziękuję za zainteresowanie! Czy masz pytania dotyczące lokalizacji?"
          ];
          
          const responseMessage: Message = {
            id: Date.now() + 1,
            text: responses[Math.floor(Math.random() * responses.length)],
            sender: 'contact',
            timestamp: new Date(),
            status: 'read'
          };
          
          setMessages(prev => [...prev, responseMessage]);
        }, 2000);
      }, 1000);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
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
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-white text-pink-600 text-sm">
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 max-w-[50%]">
                <h3 className="text-sm font-medium break-words">{contact.name}</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${contact.isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <p className="text-xs opacity-90 truncate">
                    {contact.isOnline ? 'Online' : contact.lastSeen || 'Offline'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
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

        {/* Messages */}
        <CardContent className="p-0 h-80 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%]">
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm ${
                      message.sender === 'user'
                        ? 'bg-pink-600 text-white'
                        : message.sender === 'system'
                        ? 'bg-gray-100 text-gray-600 text-center'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.text}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.timestamp)}
                    {message.sender === 'user' && (
                      <span className="ml-1 text-pink-600">
                        {getStatusIcon(message.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="bg-gray-100 text-gray-800 rounded-2xl px-3 py-2 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {contact.name} pisze...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
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
              {contact.organization && (
                <Badge variant="secondary" className="text-xs">
                  {contact.organization}
                </Badge>
              )}
            </div>
          </div>
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

  if (variant === 'icon') {
    return (
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => openChat(contact)}
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
        onClick={() => openChat(contact)}
        className={`flex-1 ${className}`}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Kontakt
      </Button>
    );
  }

  return (
    <Button 
      onClick={() => openChat(contact)}
      className={`bg-gradient-to-r from-pink-500 to-pink-600 hover:opacity-90 text-white ${className}`}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Napisz wiadomość
    </Button>
  );
}