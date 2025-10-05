import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, MapPin, Users, Clock, AlertCircle, CheckCircle, XCircle, Heart, Star, Camera, Plus, Upload, X, Trash2 } from 'lucide-react';
import { getUserOffers, deleteUserApplication, cancelOfferSignup, getOfferById } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface Application {
  id: string;
  offerId: string;
  offerTitle: string;
  organizationName: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: any;
  rejectionMessage?: string | null;
}

// Completed Action Interface
interface CompletedAction {
  id: number;
  title: string;
  organization: string;
  location: string;
  date: string;
  duration: string;
  description: string;
  photos: { id: number; url: string; caption: string; uploadedAt: string; }[];
  rating?: number;
  feedback?: string;
}

// Mock completed actions
const mockCompletedActions: CompletedAction[] = [
  {
    id: 1,
    title: "Pomoc w schronisku dla zwierząt",
    organization: "Fundacja Przyjaciół Zwierząt",
    location: "Warszawa, Mokotów",
    date: "2024-09-15",
    duration: "3 godziny",
    description: "Pomoc w karmieniu, sprzątaniu i spacerach z psami.",
    photos: [
      {
        id: 1,
        url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
        caption: "Spacer z psami w parku",
        uploadedAt: "2024-09-15T16:30:00"
      },
      {
        id: 2,
        url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
        caption: "Karmienie zwierząt",
        uploadedAt: "2024-09-15T17:00:00"
      }
    ],
    rating: 5,
    feedback: "Wspaniałe doświadczenie! Zwierzęta były bardzo przyjazne."
  },
  {
    id: 2,
    title: "Sprzątanie parku miejskiego",
    organization: "Eko-Warszawa",
    location: "Park Łazienkowski",
    date: "2024-09-08",
    duration: "2 godziny",
    description: "Akcja sprzątania i segregacji śmieci w parku.",
    photos: [],
    rating: 4
  },
  {
    id: 3,
    title: "Pomoc w jadłodajni",
    organization: "Caritas Warszawa",
    location: "Warszawa, Centrum",
    date: "2024-08-30",
    duration: "4 godziny",
    description: "Przygotowywanie i serwowanie posiłków dla potrzebujących.",
    photos: [
      {
        id: 3,
        url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400",
        caption: "Przygotowywanie posiłków",
        uploadedAt: "2024-08-30T14:15:00"
      }
    ],
    rating: 5,
    feedback: "Bardzo potrzebna akcja. Miło było móc pomóc."
  }
];

interface MyApplicationsProps {
  onApplicationChange?: () => void;
  onNavigateToOffers?: () => void;
}

const MyApplications = ({ onApplicationChange, onNavigateToOffers }: MyApplicationsProps) => {
  const { userProfile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedActions, setCompletedActions] = useState(mockCompletedActions);
  const [selectedActionForPhotos, setSelectedActionForPhotos] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
  const [offerDetails, setOfferDetails] = useState<{[key: string]: any}>({});

  // Helper functions for photo management
  const handlePhotoUpload = (actionId: number, files: FileList | null) => {
    if (!files) return;
    
    const newPhotos = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      caption: "",
      uploadedAt: new Date().toISOString()
    }));
    
    setCompletedActions(prev => 
      prev.map(action => 
        action.id === actionId 
          ? { ...action, photos: [...action.photos, ...newPhotos] }
          : action
      )
    );
  };

  const removePhoto = (actionId: number, photoId: number) => {
    setCompletedActions(prev => 
      prev.map(action => 
        action.id === actionId 
          ? { ...action, photos: action.photos.filter(photo => photo.id !== photoId) }
          : action
      )
    );
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (!userProfile?.id) return;
    
    try {
      // Find the application to get the offerId
      const application = applications.find((app: any) => app.id === applicationId);
      if (!application) {
        console.log('Application not found');
        return;
      }
      
      console.log('Found application:', application);
      console.log('Offer ID:', application.offerId);

      // Cancel the offer signup (remove from offer's participants)
      // This might fail if the user was never actually added to the offer's participants
      // We'll continue with the deletion even if this fails
      const cancelSuccess = await cancelOfferSignup(application.offerId, userProfile.id);
      if (!cancelSuccess) {
        console.log('Failed to cancel offer signup - user may not have been in offer participants, continuing with application deletion');
      }

      // Remove from user's applications
      const deleteSuccess = await deleteUserApplication(userProfile.id, applicationId);
      if (deleteSuccess) {
        console.log('Successfully deleted application from user document');
        
        // Immediately update local state to remove the application
        setApplications(prev => prev.filter((app: any) => app.id !== applicationId));
        
        // Also refresh from database to ensure consistency
        try {
          const updatedApplications = await getUserOffers(userProfile.id);
          console.log('Refreshed applications from database:', updatedApplications);
          setApplications(updatedApplications);
        } catch (error) {
          console.error('Error refreshing applications:', error);
        }
        
        setShowDeleteConfirm(false);
        setApplicationToDelete(null);
        console.log('Successfully canceled application and offer signup');
        
        // Notify parent component to refresh offers
        if (onApplicationChange) {
          onApplicationChange();
        }
      } else {
        console.log('Failed to delete application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      console.log('Error occurred while deleting application');
    }
  };

  const handleDeleteClick = (applicationId: string) => {
    console.log('Delete button clicked for application:', applicationId);
    console.log('Current applications:', applications);
    console.log('User profile ID:', userProfile?.id);
    setApplicationToDelete(applicationId);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setApplicationToDelete(null);
  };

  useEffect(() => {
    const fetchApplications = async () => {
      console.log('Fetching applications for user:', userProfile?.id);
      if (!userProfile?.id) {
        console.log('No user profile ID available');
        return;
      }
      
      try {
        setLoading(true);
        const userApplications = await getUserOffers(userProfile.id);
        console.log('Fetched applications:', userApplications);
        console.log('Number of applications:', userApplications.length);
        setApplications(userApplications);
        
        // Fetch offer details for each application
        const offerDetailsMap: {[key: string]: any} = {};
        for (const app of userApplications) {
          try {
            const offer = await getOfferById(app.offerId);
            if (offer) {
              offerDetailsMap[app.offerId] = offer;
            }
          } catch (error) {
            console.error(`Error fetching offer ${app.offerId}:`, error);
          }
        }
        setOfferDetails(offerDetailsMap);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [userProfile?.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Oczekuje';
      case 'accepted':
        return 'Zaakceptowane';
      case 'rejected':
        return 'Odrzucone';
      default:
        return 'Nieznany';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Nieznana data';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Nieznana data';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="mb-2">Moja aktywność</h2>
        <p className="text-sm text-muted-foreground">Twoje zgłoszenia i zakończone akcje</p>
      </div>
      
      {/* Inner Tabs for Applications and History */}
      <Card>
        <CardContent className="p-2">
          <Tabs defaultValue="applications">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="applications">Zgłoszenia</TabsTrigger>
              <TabsTrigger value="history">Historia</TabsTrigger>
            </TabsList>
            
            {/* Applications Tab */}
            <TabsContent value="applications" className="mt-4 space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Ładowanie zgłoszeń...</p>
                </div>
              ) : applications.length > 0 ? (
                applications.map((application, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                            {application.offerTitle}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Users className="w-4 h-4" />
                            <span>{application.organizationName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {offerDetails[application.offerId]?.startDate 
                                ? `Data wydarzenia: ${new Date(offerDetails[application.offerId].startDate).toLocaleDateString('pl-PL')}`
                                : `Zgłoszono: ${formatDate(application.appliedAt)}`
                              }
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`flex items-center gap-1 ${getStatusColor(application.status)}`}
                          >
                            {getStatusIcon(application.status)}
                            {getStatusText(application.status)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(application.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {application.status === 'rejected' && application.rejectionMessage && (
                      <CardContent className="pt-0">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-red-800 mb-1">Powód odrzucenia:</h4>
                              <p className="text-red-700 text-sm">{application.rejectionMessage}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}

                    {application.status === 'accepted' && (
                      <CardContent className="pt-0">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-green-800 mb-1">Gratulacje!</h4>
                              <p className="text-green-700 text-sm">
                                Twoje zgłoszenie zostało zaakceptowane. Skontaktuj się z organizatorem, aby uzyskać więcej informacji.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}

                    {application.status === 'pending' && (
                      <CardContent className="pt-0">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <Clock className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-yellow-800 mb-1">Oczekuje na rozpatrzenie</h4>
                              <p className="text-yellow-700 text-sm">
                                Twoje zgłoszenie zostało wysłane i oczekuje na rozpatrzenie przez organizatora.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Nie masz jeszcze żadnych zgłoszeń</p>
                    <Button 
                      variant="outline"
                      onClick={onNavigateToOffers}
                    >
                      Przeglądaj oferty
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-4 space-y-4">
              {/* Completed Actions */}
              <div className="space-y-4">
                {completedActions.map(action => (
                  <Card key={action.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{action.title}</CardTitle>
                          <CardDescription>{action.organization}</CardDescription>
                        </div>
                        {action.rating && (
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star 
                                key={star} 
                                className={`h-4 w-4 ${
                                  star <= action.rating! 
                                    ? "text-yellow-400 fill-yellow-400" 
                                    : "text-gray-300"
                                }`} 
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Action Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{new Date(action.date).toLocaleDateString('pl-PL')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{action.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{action.location}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">{action.description}</p>

                      {action.feedback && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800">{action.feedback}</p>
                        </div>
                      )}

                      {/* Photos Section */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            Zdjęcia z akcji ({action.photos.length})
                          </h4>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(action.id, e.target.files)}
                            />
                            <div className="flex items-center gap-1 text-xs text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200 hover:bg-pink-100 transition-colors">
                              <Plus className="h-3 w-3" />
                              Dodaj zdjęcia
                            </div>
                          </label>
                        </div>

                        {/* Photo Grid */}
                        {action.photos.length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {action.photos.map(photo => (
                              <div key={photo.id} className="relative group">
                                <img
                                  src={photo.url}
                                  alt={photo.caption || "Zdjęcie z akcji"}
                                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                />
                                
                                {/* Photo Actions */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => removePhoto(action.id, photo.id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Caption */}
                                {photo.caption && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 rounded-b-lg">
                                    {photo.caption}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add first photo prompt */}
                        {action.photos.length === 0 && (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(action.id, e.target.files)}
                            />
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 hover:bg-pink-50 transition-colors">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 mb-1">Dodaj zdjęcia z tej akcji</p>
                              <p className="text-xs text-gray-500">Kliknij lub przeciągnij pliki tutaj</p>
                            </div>
                          </label>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State for History */}
              {completedActions.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">Brak zakończonych akcji</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Gdy zakończysz swoje pierwsze akcje wolontariackie, pojawią się tutaj
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-pink-500 to-pink-600"
                      onClick={onNavigateToOffers}
                    >
                      Przeglądaj oferty
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Anuluj zgłoszenie</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Czy na pewno chcesz anulować to zgłoszenie?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Co się stanie po anulowaniu:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Twoje zgłoszenie zostanie usunięte z systemu</li>
                      <li>Organizator nie będzie mógł skontaktować się z Tobą w sprawie tej oferty</li>
                      <li>Możesz ponownie zgłosić się na tę ofertę w przyszłości</li>
                      <li>Twoja historia zgłoszeń zostanie zaktualizowana</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="px-4 py-2"
              >
                Anuluj
              </Button>
              <Button
                variant="destructive"
                onClick={() => applicationToDelete && handleDeleteApplication(applicationToDelete)}
                className="px-4 py-2"
              >
                Tak, anuluj zgłoszenie
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
