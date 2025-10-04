import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  Download, 
  Eye, 
  Edit, 
  Shield, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Info,
  Database,
  User,
  Mail,
  MapPin,
  Calendar,
  Phone,
  Building,
  School,
  Heart
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { generateUserDataPDF, generateDataCollectionInfo, UserDataForPDF } from "../utils/pdfGenerator";

interface DataManagementProps {
  userType: string;
}

export function DataManagement({ userType }: DataManagementProps) {
  const { userProfile } = useAuth();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showDataInfo, setShowDataInfo] = useState(false);

  const handleDownloadData = async () => {
    if (!userProfile) {
      console.error('No user profile available');
      alert('Brak danych użytkownika. Zaloguj się ponownie.');
      return;
    }

    console.log('Starting PDF generation for user:', userProfile.email);
    setIsGeneratingPDF(true);
    
    try {
      const userData: UserDataForPDF = {
        personalInfo: {
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
          birthDate: userProfile.birthDate,
          phoneNumber: userProfile.phoneNumber
        },
        address: userProfile.address,
        userType: userProfile.userType,
        privacySettings: userProfile.privacySettings,
        cookieSettings: userProfile.cookieSettings,
        volunteerInfo: userProfile.volunteerInfo,
        coordinatorInfo: userProfile.coordinatorInfo,
        organizationInfo: userProfile.organizationInfo,
        createdAt: userProfile.createdAt ? new Date(userProfile.createdAt.seconds * 1000).toLocaleString('pl-PL') : 'Nie podano',
        lastLoginAt: userProfile.lastLoginAt ? new Date(userProfile.lastLoginAt.seconds * 1000).toLocaleString('pl-PL') : 'Nie podano'
      };

      console.log('User data prepared:', userData);
      console.log('Calling generateUserDataPDF...');
      
      generateUserDataPDF(userData);
      
      console.log('PDF generation completed successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Błąd podczas generowania PDF. Sprawdź konsolę przeglądarki dla szczegółów.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShowDataInfo = () => {
    setShowDataInfo(!showDataInfo);
  };

  const dataCollectionInfo = generateDataCollectionInfo();

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="mb-2">Zarządzanie danymi</h2>
        <p className="text-sm text-muted-foreground">Twoje prawa zgodnie z RODO</p>
      </div>

      {/* Download Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Pobierz moje dane (RODO)
          </CardTitle>
          <CardDescription>
            Pobierz wszystkie swoje dane osobowe w formacie PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium">Eksport danych osobowych</h4>
              <p className="text-xs text-muted-foreground">
                Zgodnie z RODO masz prawo do otrzymania kopii swoich danych
              </p>
            </div>
            <Button 
              onClick={handleDownloadData}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generowanie...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Pobierz PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Collection Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Zobacz jakie dane zbieramy
          </CardTitle>
          <CardDescription>
            Pełna informacja o zbieranych danych osobowych
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium">Informacja o zbieranych danych</h4>
              <p className="text-xs text-muted-foreground">
                Zgodnie z RODO informujemy o wszystkich zbieranych danych
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={handleShowDataInfo}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showDataInfo ? 'Ukryj' : 'Pokaż'} informacje
            </Button>
          </div>

          {showDataInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                {dataCollectionInfo}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Personal Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Twoje dane osobowe
          </CardTitle>
          <CardDescription>
            Zaktualizuj swoje dane osobowe i kontaktowe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Dane osobowe
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Imię:</span>
                  <span>{userProfile?.firstName || 'Nie podano'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nazwisko:</span>
                  <span>{userProfile?.lastName || 'Nie podano'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{userProfile?.email || 'Nie podano'}</span>
                </div>
                {userProfile?.birthDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data urodzenia:</span>
                    <span>{userProfile.birthDate}</span>
                  </div>
                )}
                {userProfile?.phoneNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Telefon:</span>
                    <span>{userProfile.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adres
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ulica:</span>
                  <span>{userProfile?.address?.street || 'Nie podano'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numer:</span>
                  <span>{userProfile?.address?.houseNumber || 'Nie podano'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kod pocztowy:</span>
                  <span>{userProfile?.address?.postalCode || 'Nie podano'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Miasto:</span>
                  <span>{userProfile?.address?.city || 'Nie podano'}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* User Type Specific Information */}
          {userProfile?.userType === 'wolontariusz' && userProfile?.volunteerInfo && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Informacje wolontariusza
              </h4>
              <div className="space-y-2 text-sm">
                {userProfile.volunteerInfo.skills && userProfile.volunteerInfo.skills.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Umiejętności:</span>
                    <span>{userProfile.volunteerInfo.skills.join(', ')}</span>
                  </div>
                )}
                {userProfile.volunteerInfo.interests && userProfile.volunteerInfo.interests.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zainteresowania:</span>
                    <span>{userProfile.volunteerInfo.interests.join(', ')}</span>
                  </div>
                )}
                {userProfile.volunteerInfo.experience && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Doświadczenie:</span>
                    <span>{userProfile.volunteerInfo.experience}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {userProfile?.userType === 'koordynator' && userProfile?.coordinatorInfo && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <School className="h-4 w-4" />
                Informacje koordynatora
              </h4>
              <div className="space-y-2 text-sm">
                {userProfile.coordinatorInfo.schoolInfo?.name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Szkoła:</span>
                    <span>{userProfile.coordinatorInfo.schoolInfo.name}</span>
                  </div>
                )}
                {userProfile.coordinatorInfo.department && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Departament:</span>
                    <span>{userProfile.coordinatorInfo.department}</span>
                  </div>
                )}
                {userProfile.coordinatorInfo.position && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stanowisko:</span>
                    <span>{userProfile.coordinatorInfo.position}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {userProfile?.userType === 'organizacja' && userProfile?.organizationInfo && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Informacje organizacji
              </h4>
              <div className="space-y-2 text-sm">
                {userProfile.organizationInfo.organizationName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nazwa organizacji:</span>
                    <span>{userProfile.organizationInfo.organizationName}</span>
                  </div>
                )}
                {userProfile.organizationInfo.organizationType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Typ organizacji:</span>
                    <span>{userProfile.organizationInfo.organizationType}</span>
                  </div>
                )}
                {userProfile.organizationInfo.krsNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Numer KRS:</span>
                    <span>{userProfile.organizationInfo.krsNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Zmień email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RODO Rights */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-blue-800 mb-2">Twoje prawa zgodnie z RODO</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• <strong>Prawo dostępu</strong> - możesz żądać informacji o przetwarzaniu Twoich danych</p>
                <p>• <strong>Prawo do sprostowania</strong> - możesz żądać poprawienia nieprawidłowych danych</p>
                <p>• <strong>Prawo do usunięcia</strong> - możesz żądać usunięcia swoich danych</p>
                <p>• <strong>Prawo do ograniczenia przetwarzania</strong> - możesz żądać ograniczenia przetwarzania</p>
                <p>• <strong>Prawo do przenoszenia danych</strong> - możesz otrzymać swoje dane w formacie przenośnym</p>
                <p>• <strong>Prawo sprzeciwu</strong> - możesz sprzeciwić się przetwarzaniu danych</p>
                <p>• <strong>Prawo do cofnięcia zgody</strong> - możesz w każdej chwili cofnąć zgodę</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
