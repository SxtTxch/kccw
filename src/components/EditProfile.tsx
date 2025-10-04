import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { updateUserProfileByEmail, getUserProfileByEmail } from "../firebase/firestore";
import { 
  User, 
  Camera, 
  Save, 
  X, 
  Heart, 
  GraduationCap, 
  Building2,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Globe,
  Award,
  Target
} from "lucide-react";

interface User {
  id: number;
  email: string;
  userType: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  schoolName?: string;
  organizationName?: string;
  organizationType?: string;
  krsNumber?: string;
  isMinor?: boolean;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  website?: string;
  experience?: string;
  achievements?: string[];
  volunteerHours?: number;
  profileImage?: string;
}

interface EditProfileProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onCancel: () => void;
}

export function EditProfile({ user, onSave, onCancel }: EditProfileProps) {
  const [formData, setFormData] = useState<User>({
    ...user,
    bio: user.bio || "",
    skills: user.skills || [],
    interests: user.interests || [],
    website: user.website || "",
    experience: user.experience || "",
    achievements: user.achievements || [],
    phone: user.phone || "",
    street: user.street || "",
    houseNumber: user.houseNumber || "",
    postalCode: user.postalCode || "",
    city: user.city || "",
    schoolName: user.schoolName || ""
  });

  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from Firestore when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data from Firestore for:', user.email);
        const userProfile = await getUserProfileByEmail(user.email);
        
        if (userProfile) {
          console.log('User profile fetched:', userProfile);
          
          // Map Firestore data to form data
          const firestoreData: User = {
            id: user.id,
            email: userProfile.email,
            userType: userProfile.userType,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            birthDate: userProfile.birthDate,
            schoolName: userProfile.schoolName,
            organizationName: userProfile.organizationName,
            organizationType: userProfile.organizationType,
            krsNumber: userProfile.krsNumber,
            isMinor: user.isMinor,
            street: userProfile.address?.street || "",
            houseNumber: userProfile.address?.houseNumber || "",
            postalCode: userProfile.address?.postalCode || "",
            city: userProfile.address?.city || "",
            phone: userProfile.phoneNumber || "",
            bio: userProfile.bio || "",
            skills: userProfile.volunteerInfo?.skills || [],
            interests: userProfile.volunteerInfo?.interests || [],
            website: userProfile.website || "",
            experience: userProfile.volunteerInfo?.experience || "",
            achievements: userProfile.volunteerInfo?.achievements || [],
            volunteerHours: userProfile.volunteerHours || 0,
            profileImage: userProfile.profileImage || ""
          };
          
          setFormData(firestoreData);
          console.log('Form data updated with Firestore data:', firestoreData);
        } else {
          console.log('No user profile found in Firestore, using local data');
        }
      } catch (error) {
        console.error('Error fetching user data from Firestore:', error);
        setError('Błąd podczas ładowania danych użytkownika');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user.email, user.id, user.isMinor]);

  const handleInputChange = (field: keyof User, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests?.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...(prev.interests || []), newInterest.trim()]
      }));
      setNewInterest("");
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests?.filter(interest => interest !== interestToRemove) || []
    }));
  };

  const addAchievement = () => {
    if (newAchievement.trim() && !formData.achievements?.includes(newAchievement.trim())) {
      setFormData(prev => ({
        ...prev,
        achievements: [...(prev.achievements || []), newAchievement.trim()]
      }));
      setNewAchievement("");
    }
  };

  const removeAchievement = (achievementToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements?.filter(achievement => achievement !== achievementToRemove) || []
    }));
  };

  const handleSave = async () => {
    try {
      console.log('Starting profile save for user:', formData.email);
      console.log('Form data:', formData);
      
      // Save to Firestore
      await updateUserProfileByEmail(formData.email, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        schoolName: formData.schoolName,
        phoneNumber: formData.phone,
        address: {
          street: formData.street || "",
          houseNumber: formData.houseNumber || "",
          postalCode: formData.postalCode || "",
          city: formData.city || ""
        },
        bio: formData.bio,
        website: formData.website,
        experience: formData.experience,
        volunteerHours: formData.volunteerHours,
        profileImage: formData.profileImage,
        // User type specific data
        ...(user.userType === 'wolontariusz' && {
          volunteerInfo: {
            skills: formData.skills || [],
            interests: formData.interests || [],
            experience: formData.experience || "",
            achievements: formData.achievements || []
          }
        }),
        ...(user.userType === 'koordynator' && {
          coordinatorInfo: {
            schoolInfo: {
              name: formData.schoolName || ""
            }
          }
        }),
        ...(user.userType === 'organizacja' && {
          organizationInfo: {
            organizationName: formData.organizationName || "",
            organizationType: formData.organizationType || "",
            krsNumber: formData.krsNumber || "",
            description: formData.bio || ""
          }
        })
      });
      
      console.log('Profile saved successfully to Firestore');
      
      // Call the original onSave to update local state
      onSave(formData);
    } catch (error) {
      console.error('Error saving profile to Firestore:', error);
      console.error('Error details:', error);
      alert(`Błąd podczas zapisywania profilu: ${error.message || 'Nieznany błąd'}. Sprawdź konsolę dla szczegółów.`);
    }
  };

  const getUserTypeIcon = () => {
    switch (user.userType) {
      case 'wolontariusz': return Heart;
      case 'koordynator': return GraduationCap;
      case 'organizacja': return Building2;
      default: return User;
    }
  };

  const getUserTypeColor = () => {
    switch (user.userType) {
      case 'wolontariusz': return 'from-pink-500 to-pink-600';
      case 'koordynator': return 'from-blue-500 to-blue-600';
      case 'organizacja': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const IconComponent = getUserTypeIcon();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-sm mx-auto py-4 space-y-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Ładowanie danych użytkownika...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-sm mx-auto py-4 space-y-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <X className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Błąd ładowania</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={onCancel} variant="outline">
              Wróć do profilu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-sm mx-auto py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onCancel}
            className="p-2"
          >
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-center">Edycja profilu</h1>
          <Button 
            onClick={handleSave}
            size="sm"
            className={`bg-gradient-to-r ${getUserTypeColor()} text-white`}
          >
            <Save className="h-4 w-4 mr-2" />
            Zapisz
          </Button>
        </div>

        {/* Profile Picture */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="w-20 h-20 mx-auto">
                <AvatarFallback className={`bg-gradient-to-r ${getUserTypeColor()} text-white text-xl`}>
                  {formData.firstName[0]}{formData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="icon"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Dotknij aby zmienić zdjęcie</p>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              Podstawowe informacje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">Imię *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Imię"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nazwisko *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Nazwisko"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+48 123 456 789"
              />
            </div>

            {user.userType === 'wolontariusz' && (
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data urodzenia</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                />
              </div>
            )}

            {(user.userType === 'wolontariusz' || user.userType === 'koordynator') && (
              <div className="space-y-2">
                <Label htmlFor="schoolName">Szkoła</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) => handleInputChange("schoolName", e.target.value)}
                  placeholder="Nazwa szkoły"
                />
              </div>
            )}


            {user.userType === 'organizacja' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Nazwa organizacji *</Label>
                  <Input
                    id="organizationName"
                    value={formData.organizationName || ""}
                    onChange={(e) => handleInputChange("organizationName", e.target.value)}
                    placeholder="Nazwa organizacji"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organizationType">Typ organizacji</Label>
                  <Select 
                    value={formData.organizationType || ""} 
                    onValueChange={(value) => handleInputChange("organizationType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz typ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fundacja">Fundacja</SelectItem>
                      <SelectItem value="stowarzyszenie">Stowarzyszenie</SelectItem>
                      <SelectItem value="ngo">NGO</SelectItem>
                      <SelectItem value="instytucja-publiczna">Instytucja publiczna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="krsNumber">Numer KRS</Label>
                  <Input
                    id="krsNumber"
                    value={formData.krsNumber || ""}
                    onChange={(e) => handleInputChange("krsNumber", e.target.value)}
                    placeholder="0000000000"
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Strona internetowa</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Ulica</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleInputChange("street", e.target.value)}
                placeholder="Nazwa ulicy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="houseNumber">Numer domu</Label>
              <Input
                id="houseNumber"
                value={formData.houseNumber}
                onChange={(e) => handleInputChange("houseNumber", e.target.value)}
                placeholder="12, 12/5, 12A"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Kod pocztowy</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  placeholder="00-000"
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Miasto</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Miasto"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio/Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {user.userType === 'organizacja' ? 'O organizacji' : 'Biogram'}
            </CardTitle>
            <CardDescription>
              {user.userType === 'organizacja' 
                ? 'Opisz misję i działalność organizacji' 
                : 'Opowiedz o sobie i swoich zainteresowaniach'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">
                {user.userType === 'organizacja' ? 'Opis organizacji' : 'Opis'}
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder={
                  user.userType === 'organizacja' 
                    ? 'Opisz działalność, misję i cele organizacji...' 
                    : 'Opowiedz o sobie, swoich zainteresowaniach i motywacjach...'
                }
                rows={4}
                className="resize-none"
              />
            </div>

            {user.userType !== 'organizacja' && (
              <div className="space-y-2">
                <Label htmlFor="experience">Doświadczenie</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  placeholder="Opisz swoje dotychczasowe doświadczenie w wolontariacie..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {user.userType === 'organizacja' ? 'Obszary działania' : 'Umiejętności'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder={
                  user.userType === 'organizacja' 
                    ? 'np. Pomoc dzieciom' 
                    : 'np. Pierwsza pomoc'
                }
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button 
                onClick={addSkill}
                size="icon"
                variant="outline"
                disabled={!newSkill.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {formData.skills?.map((skill, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm flex-1">{skill}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-700"
                    onClick={() => removeSkill(skill)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        {user.userType !== 'organizacja' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Zainteresowania
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="np. Sport, Muzyka, Technologia"
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                />
                <Button 
                  onClick={addInterest}
                  size="icon"
                  variant="outline"
                  disabled={!newInterest.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {formData.interests?.map((interest, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm flex-1">{interest}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-700"
                      onClick={() => removeInterest(interest)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {user.userType === 'organizacja' ? 'Osiągnięcia organizacji' : 'Osiągnięcia'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                placeholder={
                  user.userType === 'organizacja' 
                    ? 'np. Nagroda za działalność społeczną 2024' 
                    : 'np. Wolontariusz roku 2024'
                }
                onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
              />
              <Button 
                onClick={addAchievement}
                size="icon"
                variant="outline"
                disabled={!newAchievement.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {formData.achievements?.map((achievement, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm flex-1">{achievement}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-700"
                    onClick={() => removeAchievement(achievement)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-6">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            Anuluj
          </Button>
          <Button 
            onClick={handleSave}
            className={`flex-1 bg-gradient-to-r ${getUserTypeColor()} text-white`}
          >
            <Save className="h-4 w-4 mr-2" />
            Zapisz zmiany
          </Button>
        </div>
      </div>
    </div>
  );
}