import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Heart, GraduationCap, Building2, ChevronRight } from "lucide-react";
import { VolunteerDashboard } from "./components/VolunteerDashboard";
import { CoordinatorDashboard } from "./components/CoordinatorDashboard";
import { OrganizationDashboard } from "./components/OrganizationDashboard";
import { MobileMetaTags } from "./components/MobileMetaTags";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import { createUserProfile, UserProfile } from "./firebase/firestore";
import { usePageTracking } from "./hooks/useAnalytics";
import { Chat } from "./components/Chat";

function AppContent() {
  const { user, userProfile, loading, signIn, signUp, logout, validateUserType } = useAuth();
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [isRegistration, setIsRegistration] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  
  // Track page views
  usePageTracking('main-app');
  
  // Global keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + A for accessibility info
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = 'Skróty klawiaturowe: Alt+A - dostępność, Tab - nawigacja, Enter - aktywacja, Escape - zamknij';
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 3000);
      }
      
      // Alt + H for high contrast toggle
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        setHighContrast(!highContrast);
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = highContrast ? 'Wysoki kontrast wyłączony' : 'Wysoki kontrast włączony';
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 2000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [highContrast]);
  
  // Check user type validation after login
  useEffect(() => {
    if (user && userProfile && selectedUserType) {
      if (!validateUserType(selectedUserType)) {
        alert(`Błąd: To konto nie jest typu ${selectedUserType}. Proszę wybrać odpowiedni typ użytkownika.`);
        logout();
        setSelectedUserType(null);
      }
    }
  }, [user, userProfile, selectedUserType, validateUserType, logout]);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [registrationData, setRegistrationData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    // Volunteer specific fields
    birthDate: "",
    street: "",
    houseNumber: "",
    postalCode: "",
    city: "",
    schoolName: "",
    // Organization specific fields
    organizationName: "",
    krsNumber: "",
    organizationType: ""
  });

  const handleLoginInputChange = (field: string, value: string) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegistrationInputChange = (field: string, value: string) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async () => {
    try {
      await signIn(loginData.email, loginData.password);
      // Authentication state will be handled by the AuthContext
    } catch (error) {
      console.error('Login error:', error);
      alert("Błąd logowania. Sprawdź dane i spróbuj ponownie.");
    }
  };

  const handleRegistration = async () => {
    try {
      // Validate age for volunteers
      if (selectedUserType === "wolontariusz" && registrationData.birthDate) {
        const today = new Date();
        const birthDate = new Date(registrationData.birthDate);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Check if birthday hasn't occurred this year
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
          ? age - 1 
          : age;
        
        if (actualAge < 13) {
          alert('Musisz mieć co najmniej 13 lat, aby się zarejestrować');
          return;
        }
        
        if (actualAge > 120) {
          alert('Wiek nie może przekraczać 120 lat');
          return;
        }
      }
      
      // Check Firebase initialization
      const { checkFirebaseInitialization } = await import('./firebase/config');
      const firebaseStatus = checkFirebaseInitialization();
      console.log('Firebase initialization status:', firebaseStatus);
      
      // Test Firestore connection first
      const { testFirestoreConnection } = await import('./firebase/firestore');
      const isConnected = await testFirestoreConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to Firestore database');
      }
      
      // Create Firebase user account
      await signUp(registrationData.email, registrationData.password);
      
      // Create user profile in Firestore with comprehensive metadata
      const userProfileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
        email: registrationData.email,
        userType: selectedUserType as 'wolontariusz' | 'koordynator' | 'organizacja',
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        birthDate: registrationData.birthDate,
        ...(selectedUserType === "koordynator" && { schoolName: registrationData.schoolName }),
        ...(selectedUserType === "organizacja" && { 
          organizationName: registrationData.organizationName,
          organizationType: registrationData.organizationType,
          krsNumber: registrationData.krsNumber
        }),
        address: {
          street: registrationData.street,
          houseNumber: registrationData.houseNumber,
          postalCode: registrationData.postalCode,
          city: registrationData.city
        },
        // Additional metadata
        isVerified: false,
        isActive: true,
        lastLoginAt: null,
        preferences: {
          notifications: true,
          emailUpdates: true,
          smsUpdates: false,
          language: 'pl'
        },
        // Initialize default privacy settings
        privacySettings: {
          profileVisibility: false,
          locationTracking: false,
          dataAnalytics: false,
          marketingEmails: false,
          notificationsPush: false,
          dataSharing: false,
          cookiesAnalytical: false,
          cookiesMarketing: false,
          lastUpdated: new Date()
        },
        // Initialize default cookie settings
        cookieSettings: {
          essential: true,        // Always true, cannot be disabled
          analytical: false,     // Default to false for privacy
          marketing: false,       // Default to false for privacy
          lastUpdated: new Date()
        },
        // User type specific metadata
        ...(selectedUserType === "wolontariusz" && {
          volunteerInfo: {
            skills: [],
            interests: [],
            availability: [],
            experience: "beginner"
          }
        }),
        ...(selectedUserType === "koordynator" && {
          coordinatorInfo: {
            schoolInfo: {
              name: registrationData.schoolName || "",
              address: `${registrationData.street} ${registrationData.houseNumber}, ${registrationData.postalCode} ${registrationData.city}`,
              phone: ""
            },
            department: "",
            position: "Koordynator Wolontariatu"
          }
        }),
        ...(selectedUserType === "organizacja" && {
          organizationInfo: {
            description: "",
            website: "",
            contactPerson: {
              name: `${registrationData.firstName} ${registrationData.lastName}`,
              position: "Osoba kontaktowa",
              phone: "",
              email: registrationData.email
            }
          }
        })
      };
      
      console.log('Creating user profile with data:', userProfileData);
      const profileId = await createUserProfile(userProfileData);
      console.log('User profile created successfully with ID:', profileId);
      
      // Verify the profile was created
      const { getUserProfile } = await import('./firebase/firestore');
      const createdProfile = await getUserProfile(profileId);
      console.log('Verified created profile:', createdProfile);
      
      // Authentication state will be handled by the AuthContext
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error details:', error);
      // Handle registration error (you might want to show a toast or error message)
      alert(`Błąd rejestracji: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    }
  };

  const handleBackToSelection = async () => {
    await logout();
    setSelectedUserType(null);
    setIsRegistration(false);
    setLoginData({ email: "", password: "" });
    setRegistrationData({ email: "", password: "", confirmPassword: "", firstName: "", lastName: "", birthDate: "", street: "", houseNumber: "", postalCode: "", city: "", schoolName: "", organizationName: "", krsNumber: "", organizationType: "" });
  };

  const userTypes = [
    {
      id: "wolontariusz",
      title: "Wolontariusz",
      description: "Osoby pomagające w akcjach wolontariackich",
      icon: Heart,
      gradient: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
      borderColor: "border-pink-200"
    },
    {
      id: "koordynator",
      title: "Szkolny Koordynator Wolontariatu", 
      description: "Koordynatorzy wolontariatu w szkołach",
      icon: GraduationCap,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      id: "organizacja",
      title: "Organizacja",
      description: "Instytucje i organizacje pozarządowe",
      icon: Building2,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200"
    }
  ];

  const currentUserType = userTypes.find(type => type.id === selectedUserType);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Ładowanie...</p>
        </div>
      </div>
    );
  }

  // Show dashboard if logged in
  if (user) {
    if (!userProfile) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center max-w-sm mx-auto p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="mb-2">Ładowanie profilu użytkownika...</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Jeśli to trwa zbyt długo, sprawdź konsolę przeglądarki.
            </p>
            <div className="space-y-2">
              <Button onClick={handleBackToSelection} variant="outline" className="w-full">
                Wróć do wyboru typu konta
              </Button>
              <Button onClick={() => window.location.reload()} variant="ghost" className="w-full">
                Odśwież stronę
              </Button>
            </div>
          </div>
        </div>
      );
    }
    console.log('User profile:', userProfile); // Debug log
    console.log('User type:', userProfile.userType); // Debug log
    
    // Additional security check - ensure user type matches selected type
    if (selectedUserType && userProfile.userType !== selectedUserType) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center max-w-sm mx-auto p-4">
            <h2 className="text-xl font-bold text-red-600 mb-4">Błąd dostępu</h2>
            <p className="text-gray-600 mb-4">
              To konto nie jest typu {selectedUserType}. Proszę wybrać odpowiedni typ użytkownika.
            </p>
            <Button onClick={handleBackToSelection} className="w-full">
              Wróć do wyboru typu konta
            </Button>
          </div>
        </div>
      );
    }

    if (userProfile.userType === "wolontariusz") {
      return (
        <VolunteerDashboard user={userProfile} onLogout={handleBackToSelection} />
      );
    }
    if (userProfile.userType === "koordynator") {
      return (
        <CoordinatorDashboard user={userProfile} onLogout={handleBackToSelection} />
      );
    }
    if (userProfile.userType === "organizacja") {
      return (
        <OrganizationDashboard user={userProfile} onLogout={handleBackToSelection} />
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-sm mx-auto py-4 text-center">
          <h1>Dashboard dla {userProfile.userType || 'nieznany'}</h1>
          <p>Nieznany typ użytkownika: {userProfile.userType}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Sprawdź konsolę przeglądarki dla szczegółów debugowania.
          </p>
          <Button onClick={handleBackToSelection} className="mt-4">Wróć</Button>
        </div>
      </div>
    );
  }

  if (!selectedUserType) {
    return (
      <>
        <MobileMetaTags />
        <div className={`min-h-screen p-4 overflow-y-auto mobile-scroll ${highContrast ? 'bg-black text-white' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
          <div className={`max-w-sm mx-auto py-4 ${highContrast ? 'text-white' : ''}`}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h1 className="mb-2">Witamy</h1>
              <p className="text-muted-foreground">Wybierz typ konta, aby kontynuować</p>
            </div>

            {/* User Type Selection */}
            <div className="space-y-4 mb-8">
              {userTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-95 border-2 ${type.borderColor}`}
                    onClick={() => setSelectedUserType(type.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full ${type.bgColor} flex items-center justify-center`}>
                            <IconComponent className={`h-6 w-6 ${type.iconColor}`} />
                          </div>
                          <div>
                            <h3 className="mb-1">{type.title}</h3>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Potrzebujesz pomocy z dostępem do konta?{" "}
                <a href="#" className="text-primary hover:underline">
                  Skontaktuj się z pomocą
                </a>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MobileMetaTags />
      <div className={`min-h-screen p-4 overflow-y-auto mobile-scroll ${highContrast ? 'bg-black text-white' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
        <div className={`max-w-sm mx-auto py-4 ${highContrast ? 'text-white' : ''}`}>
          {/* Header with Back Button */}
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackToSelection}
              className="mr-2 p-2"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <div className="flex-1 text-center">
              <h1>{isRegistration ? "Zarejestruj się" : "Zaloguj się"}</h1>
            </div>
          </div>

          {/* User Type Header */}
          {currentUserType && (
            <div className={`p-6 rounded-2xl border-2 ${currentUserType.borderColor} ${currentUserType.bgColor} text-center mb-6`}>
              <currentUserType.icon className={`h-12 w-12 mx-auto mb-3 ${currentUserType.iconColor}`} />
              <h2 className="mb-1">{currentUserType.title}</h2>
              <p className="text-sm text-muted-foreground">{currentUserType.description}</p>
            </div>
          )}

          {/* Auth Toggle */}
          <Card className="mb-6">
            <CardContent className="p-2">
              <Tabs value={isRegistration ? "register" : "login"} onValueChange={(value) => setIsRegistration(value === "register")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Logowanie</TabsTrigger>
                  <TabsTrigger value="register">Rejestracja</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Auth Form */}
          <Card className="mb-6">
            <CardContent className="p-6 space-y-6">
              {!isRegistration ? (
                // Login Form
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Adres email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Wprowadź swój email"
                      value={loginData.email}
                      onChange={(e) => handleLoginInputChange("email", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          document.getElementById('password')?.focus();
                        }
                      }}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Hasło *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Wprowadź swoje hasło"
                      value={loginData.password}
                      onChange={(e) => handleLoginInputChange("password", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleLogin();
                        }
                      }}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="text-right">
                    <a href="#" className="text-sm text-primary hover:underline">
                      Zapomniałeś hasła?
                    </a>
                  </div>

                  <Button
                    onClick={handleLogin}
                    className={`w-full h-12 text-white bg-gradient-to-r ${currentUserType?.gradient} hover:opacity-90 transition-opacity`}
                  >
                    Zaloguj jako {currentUserType?.title}
                  </Button>
                </>
              ) : (
                // Registration Form
                <>
                  {/* Organization specific fields at the top */}
                  {selectedUserType === "organizacja" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="organizationName">Nazwa organizacji *</Label>
                        <Input
                          id="organizationName"
                          type="text"
                          placeholder="Wprowadź nazwę organizacji"
                          value={registrationData.organizationName}
                          onChange={(e) => handleRegistrationInputChange("organizationName", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              document.getElementById('organizationType')?.focus();
                            }
                          }}
                          className="h-12"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="organizationType">Typ organizacji *</Label>
                        <Select value={registrationData.organizationType} onValueChange={(value) => handleRegistrationInputChange("organizationType", value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Wybierz typ organizacji" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fundacja">Fundacja</SelectItem>
                            <SelectItem value="stowarzyszenie">Stowarzyszenie</SelectItem>
                            <SelectItem value="ngo">Organizacja pozarządowa (NGO)</SelectItem>
                            <SelectItem value="spolka-non-profit">Spółka non-profit</SelectItem>
                            <SelectItem value="instytucja-publiczna">Instytucja publiczna</SelectItem>
                            <SelectItem value="inna">Inna</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="krsNumber">Numer KRS *</Label>
                        <Input
                          id="krsNumber"
                          type="text"
                          placeholder="Wprowadź numer KRS (10 cyfr)"
                          value={registrationData.krsNumber}
                          onChange={(e) => handleRegistrationInputChange("krsNumber", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              document.getElementById('firstName')?.focus();
                            }
                          }}
                          className="h-12"
                          pattern="[0-9]{10}"
                          maxLength={10}
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="firstName">{selectedUserType === "organizacja" ? "Imię rejestrującego" : "Imię"} *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder={selectedUserType === "organizacja" ? "Imię osoby rejestrującej organizację" : "Wprowadź swoje imię"}
                      value={registrationData.firstName}
                      onChange={(e) => handleRegistrationInputChange("firstName", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          document.getElementById('lastName')?.focus();
                        }
                      }}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">{selectedUserType === "organizacja" ? "Nazwisko rejestrującego" : "Nazwisko"} *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder={selectedUserType === "organizacja" ? "Nazwisko osoby rejestrującej organizację" : "Wprowadź swoje nazwisko"}
                      value={registrationData.lastName}
                      onChange={(e) => handleRegistrationInputChange("lastName", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          document.getElementById('regEmail')?.focus();
                        }
                      }}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regEmail">Adres email *</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      placeholder="Wprowadź swój email"
                      value={registrationData.email}
                      onChange={(e) => handleRegistrationInputChange("email", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          document.getElementById('regPassword')?.focus();
                        }
                      }}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regPassword">Hasło *</Label>
                    <Input
                      id="regPassword"
                      type="password"
                      placeholder="Wprowadź hasło"
                      value={registrationData.password}
                      onChange={(e) => handleRegistrationInputChange("password", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          document.getElementById('confirmPassword')?.focus();
                        }
                      }}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Potwierdź hasło *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Potwierdź hasło"
                      value={registrationData.confirmPassword}
                      onChange={(e) => handleRegistrationInputChange("confirmPassword", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          document.getElementById('street')?.focus();
                        }
                      }}
                      className="h-12"
                      required
                    />
                  </div>

                  {/* Address fields for all user types */}
                  <div className="space-y-2">
                    <Label htmlFor="street">Ulica *</Label>
                    <Input
                      id="street"
                      type="text"
                      placeholder="Nazwa ulicy"
                      value={registrationData.street}
                      onChange={(e) => handleRegistrationInputChange("street", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          document.getElementById('houseNumber')?.focus();
                        }
                      }}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="houseNumber">Numer domu/mieszkania *</Label>
                    <Input
                      id="houseNumber"
                      type="text"
                      placeholder="np. 12, 12/5, 12A"
                      value={registrationData.houseNumber}
                      onChange={(e) => handleRegistrationInputChange("houseNumber", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          document.getElementById('postalCode')?.focus();
                        }
                      }}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Kod pocztowy *</Label>
                      <Input
                        id="postalCode"
                        type="text"
                        placeholder="00-000"
                        value={registrationData.postalCode}
                        onChange={(e) => handleRegistrationInputChange("postalCode", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            document.getElementById('city')?.focus();
                          }
                        }}
                        className="h-12"
                        pattern="[0-9]{2}-[0-9]{3}"
                        maxLength={6}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Miasto *</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="Nazwa miasta"
                        value={registrationData.city}
                        onChange={(e) => handleRegistrationInputChange("city", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            // Focus on next field based on user type
                            if (selectedUserType === "wolontariusz") {
                              document.getElementById('birthDate')?.focus();
                            } else if (selectedUserType === "koordynator") {
                              document.getElementById('coordinatorSchoolName')?.focus();
                            } else {
                              // For organization, submit the form
                              handleRegistration();
                            }
                          }
                        }}
                        className="h-12"
                        required
                      />
                    </div>
                  </div>

                  {/* User type specific fields */}
                  {selectedUserType === "wolontariusz" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Data urodzenia *</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={registrationData.birthDate}
                          onChange={(e) => {
                            const selectedDate = e.target.value;
                            const today = new Date();
                            const birthDate = new Date(selectedDate);
                            const age = today.getFullYear() - birthDate.getFullYear();
                            const monthDiff = today.getMonth() - birthDate.getMonth();
                            
                            // Check if birthday hasn't occurred this year
                            const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
                              ? age - 1 
                              : age;
                            
                            // Validate age
                            if (selectedDate && (actualAge < 0 || actualAge > 120)) {
                              alert('Wiek musi być między 0 a 120 lat');
                              return;
                            }
                            
                            if (selectedDate && actualAge < 13) {
                              alert('Musisz mieć co najmniej 13 lat, aby się zarejestrować');
                              return;
                            }
                            
                            handleRegistrationInputChange("birthDate", selectedDate);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              document.getElementById('volunteerSchoolName')?.focus();
                            }
                          }}
                          className="h-12"
                          required
                          max={new Date().toISOString().split('T')[0]} // Cannot select future dates
                        />
                        <p className="text-xs text-gray-500">
                          Musisz mieć co najmniej 13 lat, aby się zarejestrować
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="volunteerSchoolName">Nazwa szkoły (opcjonalne)</Label>
                        <Input
                          id="volunteerSchoolName"
                          type="text"
                          placeholder="Podaj nazwę swojej szkoły"
                          value={registrationData.schoolName}
                          onChange={(e) => handleRegistrationInputChange("schoolName", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleRegistration();
                            }
                          }}
                          className="h-12"
                        />
                      </div>
                    </>
                  )}

                  {selectedUserType === "koordynator" && (
                    <div className="space-y-2">
                      <Label htmlFor="coordinatorSchoolName">Nazwa szkoły *</Label>
                      <Input
                        id="coordinatorSchoolName"
                        type="text"
                        placeholder="Podaj nazwę szkoły, w której pracujesz"
                        value={registrationData.schoolName}
                        onChange={(e) => handleRegistrationInputChange("schoolName", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRegistration();
                          }
                        }}
                        className="h-12"
                        required
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleRegistration}
                    className={`w-full h-12 text-white bg-gradient-to-r ${currentUserType?.gradient} hover:opacity-90 transition-opacity`}
                  >
                    Zarejestruj jako {currentUserType?.title}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Heart className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800">
                  Twoje logowanie jest zabezpieczone szyfrowaniem. Nigdy nie udostępniaj swoich danych logowania.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {!isRegistration ? (
                <>
                  Nie masz konta?{" "}
                  <button 
                    onClick={() => setIsRegistration(true)}
                    className="text-primary hover:underline"
                  >
                    Zarejestruj się
                  </button>
                </>
              ) : (
                <>
                  Masz już konto?{" "}
                  <button 
                    onClick={() => setIsRegistration(false)}
                    className="text-primary hover:underline"
                  >
                    Zaloguj się
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  // return <Gmaps/>
  return (
    <>
      
      <AuthProvider>
        <ChatProvider children={<AppContent />} />
      </AuthProvider>
    </>
  );
}

// Gmaps component removed - Google Maps is now implemented in MapView.tsx