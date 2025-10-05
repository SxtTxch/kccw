import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { updatePrivacySetting, getDefaultPrivacySettings, updateCookieSetting, getDefaultCookieSettings } from "../firebase/firestore";
import { cookieManager } from "../utils/cookieManager";
import { DataManagement } from "./DataManagement";
import { DeleteAccountButton } from "./DeleteAccountButton";
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
  Settings,
  Globe,
  Smartphone,
  Bell,
  MapPin,
  User,
  Mail,
  Heart,
  Info
} from "lucide-react";

interface PrivacySettingsProps {
  userType: string;
}

export function PrivacySettings({ userType }: PrivacySettingsProps) {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'privacy' | 'data'>('privacy');
  const [dataConsents, setDataConsents] = useState(() => {
    const defaultSettings = getDefaultPrivacySettings();
    return {
      profileVisibility: defaultSettings.profileVisibility,
      locationTracking: defaultSettings.locationTracking,
      dataAnalytics: defaultSettings.dataAnalytics,
      marketingEmails: defaultSettings.marketingEmails,
      notificationsPush: defaultSettings.notificationsPush,
      dataSharing: defaultSettings.dataSharing,
      cookiesAnalytical: defaultSettings.cookiesAnalytical,
      cookiesMarketing: defaultSettings.cookiesMarketing
    };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [cookieSettings, setCookieSettings] = useState(() => {
    const defaultSettings = getDefaultCookieSettings();
    return {
      essential: defaultSettings.essential,
      analytical: defaultSettings.analytical,
      marketing: defaultSettings.marketing
    };
  });

  // Load privacy settings from user profile
  useEffect(() => {
    if (userProfile?.privacySettings) {
      setDataConsents({
        profileVisibility: userProfile.privacySettings.profileVisibility,
        locationTracking: userProfile.privacySettings.locationTracking,
        dataAnalytics: userProfile.privacySettings.dataAnalytics,
        marketingEmails: userProfile.privacySettings.marketingEmails,
        notificationsPush: userProfile.privacySettings.notificationsPush,
        dataSharing: userProfile.privacySettings.dataSharing,
        cookiesAnalytical: userProfile.privacySettings.cookiesAnalytical,
        cookiesMarketing: userProfile.privacySettings.cookiesMarketing
      });
    } else if (userProfile) {
      // Initialize with default settings if none exist
      const defaultSettings = getDefaultPrivacySettings();
      setDataConsents({
        profileVisibility: defaultSettings.profileVisibility,
        locationTracking: defaultSettings.locationTracking,
        dataAnalytics: defaultSettings.dataAnalytics,
        marketingEmails: defaultSettings.marketingEmails,
        notificationsPush: defaultSettings.notificationsPush,
        dataSharing: defaultSettings.dataSharing,
        cookiesAnalytical: defaultSettings.cookiesAnalytical,
        cookiesMarketing: defaultSettings.cookiesMarketing
      });
    }

    // Load cookie settings from user profile
    if (userProfile?.cookieSettings) {
      setCookieSettings({
        essential: userProfile.cookieSettings.essential,
        analytical: userProfile.cookieSettings.analytical,
        marketing: userProfile.cookieSettings.marketing
      });
    } else if (userProfile) {
      // Initialize with default settings if none exist
      const defaultCookieSettings = getDefaultCookieSettings();
      setCookieSettings({
        essential: defaultCookieSettings.essential,
        analytical: defaultCookieSettings.analytical,
        marketing: defaultCookieSettings.marketing
      });
    }
  }, [userProfile]);

  const handleConsentChange = async (key: keyof typeof dataConsents, value: boolean) => {
    if (!user || !userProfile?.id) {
      console.error('No user or user profile available');
      return;
    }

    setIsLoading(true);
    try {
      // Update local state immediately for better UX
      setDataConsents(prev => ({
        ...prev,
        [key]: value
      }));

      // Save to Firestore
      await updatePrivacySetting(userProfile.id, key, value);
      console.log(`Privacy setting ${key} updated to ${value}`);
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      // Revert local state on error
      setDataConsents(prev => ({
        ...prev,
        [key]: !value
      }));
      alert('Błąd podczas zapisywania ustawień. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCookieChange = async (key: keyof typeof cookieSettings, value: boolean) => {
    if (!user || !userProfile?.id) {
      console.error('No user or user profile available');
      return;
    }

    setIsLoading(true);
    try {
      // Update local state immediately for better UX
      setCookieSettings(prev => ({
        ...prev,
        [key]: value
      }));

      // Update cookie manager
      cookieManager.updatePreferences({
        [key]: value
      });

      // Save to Firestore
      await updateCookieSetting(userProfile.id, key, value);
      console.log(`Cookie setting ${key} updated to ${value}`);
    } catch (error) {
      console.error('Error updating cookie setting:', error);
      // Revert local state on error
      setCookieSettings(prev => ({
        ...prev,
        [key]: !value
      }));
      alert('Błąd podczas zapisywania ustawień cookies. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="mb-2">Prywatność i bezpieczeństwo</h2>
        <p className="text-sm text-muted-foreground">Zarządzanie danymi osobowymi zgodnie z RODO</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'privacy' | 'data')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="privacy">Ustawienia prywatności</TabsTrigger>
          <TabsTrigger value="data">Zarządzanie danymi</TabsTrigger>
        </TabsList>

        <TabsContent value="privacy" className="space-y-4">

      {/* GDPR Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-blue-800 mb-1">Ochrona danych osobowych</h4>
              <p className="text-sm text-blue-700">
                Zgodnie z RODO masz pełną kontrolę nad swoimi danymi osobowymi. 
                Możesz w każdej chwili sprawdzić, poprawić, pobrać lub usunąć swoje dane.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Consents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Zgody na przetwarzanie danych
          </CardTitle>
          <CardDescription>
            Możesz w każdej chwili zmienić swoje preferencje dotyczące przetwarzania danych
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm">Widoczność profilu</h4>
              <p className="text-xs text-muted-foreground">
                Pozwól organizacjom zobaczyć Twoje podstawowe informacje
              </p>
            </div>
            <Switch
              checked={dataConsents.profileVisibility}
              onCheckedChange={(checked) => handleConsentChange('profileVisibility', checked)}
              disabled={isLoading}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm">Śledzenie lokalizacji</h4>
              <p className="text-xs text-muted-foreground">
                Umożliwia pokazywanie ofert w Twojej okolicy
              </p>
            </div>
            <Switch
              checked={dataConsents.locationTracking}
              onCheckedChange={(checked) => handleConsentChange('locationTracking', checked)}
              disabled={isLoading}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm">Analityka i statystyki</h4>
              <p className="text-xs text-muted-foreground">
                Pomaga nam ulepszać aplikację (dane anonimowe)
              </p>
            </div>
            <Switch
              checked={dataConsents.dataAnalytics}
              onCheckedChange={(checked) => handleConsentChange('dataAnalytics', checked)}
              disabled={isLoading}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm">Powiadomienia push</h4>
              <p className="text-xs text-muted-foreground">
                Otrzymuj powiadomienia o nowych ofertach
              </p>
            </div>
            <Switch
              checked={dataConsents.notificationsPush}
              onCheckedChange={(checked) => handleConsentChange('notificationsPush', checked)}
              disabled={isLoading}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm">E-maile marketingowe</h4>
              <p className="text-xs text-muted-foreground">
                Otrzymuj newsletter i informacje o promocjach
              </p>
            </div>
            <Switch
              checked={dataConsents.marketingEmails}
              onCheckedChange={(checked) => handleConsentChange('marketingEmails', checked)}
              disabled={isLoading}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm">Udostępnianie danych partnerom</h4>
              <p className="text-xs text-muted-foreground">
                Tylko zweryfikowanym organizacjom wolontariackim
              </p>
            </div>
            <Switch
              checked={dataConsents.dataSharing}
              onCheckedChange={(checked) => handleConsentChange('dataSharing', checked)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cookies Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Ustawienia cookies
          </CardTitle>
          <CardDescription>
            Zarządzanie plikami cookies w aplikacji
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm">Cookies niezbędne</h4>
              <p className="text-xs text-muted-foreground">
                Wymagane do działania aplikacji (nie można wyłączyć)
              </p>
            </div>
            <Badge variant="secondary">Wymagane</Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm">Cookies analityczne</h4>
              <p className="text-xs text-muted-foreground">
                Pomagają nam zrozumieć, jak korzystasz z aplikacji
              </p>
            </div>
            <Switch
              checked={cookieSettings.analytical}
              onCheckedChange={(checked) => handleCookieChange('analytical', checked)}
              disabled={isLoading}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm">Cookies marketingowe</h4>
              <p className="text-xs text-muted-foreground">
                Personalizacja reklam i treści marketingowych
              </p>
            </div>
            <Switch
              checked={cookieSettings.marketing}
              onCheckedChange={(checked) => handleCookieChange('marketing', checked)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>


      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Bezpieczeństwo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm mb-1">Szyfrowanie danych</h4>
              <p className="text-xs text-muted-foreground">
                Wszystkie dane są szyfrowane zarówno podczas przesyłania, jak i przechowywania
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm mb-1">Minimalizacja danych</h4>
              <p className="text-xs text-muted-foreground">
                Zbieramy tylko te dane, które są niezbędne do funkcjonowania aplikacji
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm mb-1">Regularne audyty</h4>
              <p className="text-xs text-muted-foreground">
                Przeprowadzamy regularne audyty bezpieczeństwa i zgodności z RODO
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm mb-1">Prawo do bycia zapomnianym</h4>
              <p className="text-xs text-muted-foreground">
                Możesz w każdej chwili poprosić o usunięcie swoich danych
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact DPO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Kontakt w sprawie danych
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Masz pytania o przetwarzanie danych? Skontaktuj się z naszym Inspektorem Ochrony Danych.
          </p>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Email:</span> {" "}
              <span>iod@wolontariat.gov.pl</span>
            </div>
            <div>
              <span className="text-muted-foreground">Telefon:</span> {" "}
              <span>+48 22 123 45 67</span>
            </div>
            <div>
              <span className="text-muted-foreground">Adres:</span> {" "}
              <span>ul. Przykładowa 1, 00-001 Warszawa</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Strefa niebezpieczna
          </CardTitle>
          <CardDescription>
            Nieodwracalne akcje dotyczące Twojego konta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountButton className="w-full" />
          <p className="text-xs text-muted-foreground mt-2">
            Usunięcie konta spowoduje trwałe usunięcie wszystkich Twoich danych. 
            Ta operacja nie może zostać cofnięta.
          </p>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Informacje o polityce prywatności</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Ostatnia aktualizacja: 4 października 2024</p>
            <p>Wersja polityki prywatności: 2.1</p>
            <p>Administrator danych: System Zarządzania Wolontariatem</p>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <DataManagement userType={userType} />
        </TabsContent>
      </Tabs>
    </div>
  );
}