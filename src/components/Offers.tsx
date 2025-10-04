import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  Phone, 
  Mail, 
  MessageCircle,
  UserPlus,
  UserMinus,
  Building2,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getAllOffers, signUpForOffer, cancelOfferSignup, Offer } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export function Offers() {
  const { user, userProfile } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [signingUp, setSigningUp] = useState(null);

  const categories = [
    'Pomoc społeczna',
    'Opieka nad zwierzętami',
    'Edukacja',
    'Ekologia',
    'Kultura',
    'Sport',
    'Zdrowie'
  ];

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const offersData = await getAllOffers();
      setOffers(offersData);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (offerId: string) => {
    if (!user) return;
    
    setSigningUp(offerId);
    try {
      const success = await signUpForOffer(offerId, user.uid);
      if (success) {
        // Refresh offers to update participant count
        await fetchOffers();
      } else {
        alert('Nie udało się zapisać na ofertę. Sprawdź czy nie jesteś już zapisany lub czy oferta nie jest pełna.');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Wystąpił błąd podczas zapisywania się na ofertę.');
    } finally {
      setSigningUp(null);
    }
  };

  const handleCancelSignup = async (offerId: string) => {
    if (!user) return;
    
    setSigningUp(offerId);
    try {
      const success = await cancelOfferSignup(offerId, user.uid);
      if (success) {
        // Refresh offers to update participant count
        await fetchOffers();
      } else {
        alert('Nie udało się anulować zapisu na ofertę.');
      }
    } catch (error) {
      console.error('Error canceling signup:', error);
      alert('Wystąpił błąd podczas anulowania zapisu.');
    } finally {
      setSigningUp(null);
    }
  };

  const handleChat = (offer: Offer) => {
    // Open email client with pre-filled message
    const subject = `Zapytanie dotyczące oferty: ${offer.title}`;
    const body = `Dzień dobry,\n\nInteresuje mnie oferta "${offer.title}" organizowana przez ${offer.organization}.\n\nProszę o więcej informacji.\n\nPozdrawiam`;
    const mailtoLink = `mailto:${offer.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || offer.category === selectedCategory;
    const matchesUrgency = selectedUrgency === 'all' || offer.urgency === selectedUrgency;
    
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Pilne';
      case 'medium': return 'Średnie';
      case 'low': return 'Niskie';
      default: return urgency;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Pomoc społeczna': return Users;
      case 'Opieka nad zwierzętami': return Star;
      case 'Edukacja': return Building2;
      case 'Ekologia': return Star;
      case 'Kultura': return Star;
      case 'Sport': return Star;
      case 'Zdrowie': return Star;
      default: return Star;
    }
  };

  const isUserSignedUp = (offer: Offer) => {
    return user && offer.participants.includes(user.uid);
  };

  const isOfferFull = (offer: Offer) => {
    return offer.currentParticipants >= offer.maxParticipants;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="mb-2">Oferty</h2>
          <p className="text-sm text-muted-foreground">Ładowanie ofert...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="mb-2">Oferty</h2>
        <p className="text-sm text-muted-foreground">Znajdź oferty wolontariatu w Twojej okolicy</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj ofert..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kategoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
              <SelectTrigger>
                <SelectValue placeholder="Pilność" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="high">Pilne</SelectItem>
                <SelectItem value="medium">Średnie</SelectItem>
                <SelectItem value="low">Niskie</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchOffers}>
              Odśwież
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offers List */}
      <div className="space-y-4">
        {filteredOffers.length > 0 ? (
          filteredOffers.map(offer => {
            const IconComponent = getCategoryIcon(offer.category);
            const isSignedUp = isUserSignedUp(offer);
            const isFull = isOfferFull(offer);
            
            return (
              <Card key={offer.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{offer.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mb-2">
                        <Building2 className="h-4 w-4" />
                        {offer.organization}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`${getUrgencyColor(offer.urgency)} border text-xs`}>
                        {getUrgencyLabel(offer.urgency)}
                      </Badge>
                      {isFull && (
                        <Badge variant="destructive" className="text-xs">
                          Pełne
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {offer.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {offer.currentParticipants}/{offer.maxParticipants}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(offer.startDate).toLocaleDateString('pl-PL')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(offer.endDate).toLocaleDateString('pl-PL')}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="mb-4 max-h-96 overflow-y-auto">
                    <Badge variant="secondary" className="mb-2">{offer.category}</Badge>
                    <p className="text-sm mb-3">{offer.description}</p>
                    
                    {offer.requirements.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-1">Wymagania:</h4>
                        <ul className="text-xs text-muted-foreground list-disc list-inside max-h-16 overflow-y-auto">
                          {offer.requirements.map((req, index) => (
                            <li key={index} className="break-words leading-tight">{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {offer.benefits.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-1">Korzyści:</h4>
                        <ul className="text-xs text-muted-foreground list-disc list-inside max-h-16 overflow-y-auto">
                          {offer.benefits.map((benefit, index) => (
                            <li key={index} className="break-words leading-tight">{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">{offer.contactEmail}</span>
                      </div>
                      {offer.contactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs">{offer.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {user && (
                      <>
                        {isSignedUp ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCancelSignup(offer.id)}
                            disabled={signingUp === offer.id}
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            {signingUp === offer.id ? 'Anulowanie...' : 'Anuluj zapis'}
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handleSignUp(offer.id)}
                            disabled={isFull || signingUp === offer.id}
                            className="flex-1"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {signingUp === offer.id ? 'Zapisywanie...' : 
                             isFull ? 'Oferta pełna' : 'Zapisz się'}
                          </Button>
                        )}
                      </>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleChat(offer)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nie znaleziono ofert spełniających kryteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
