import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  User, 
  X, 
  Heart, 
  GraduationCap,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Award,
  Target,
  Clock,
  Building2,
  CheckCircle,
  School,
  Users,
  Star,
  BarChart3
} from "lucide-react";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  class: string;
  email: string;
  phone: string;
  isMinor: boolean;
  parentConsent: boolean;
  volunteerHours: number;
  activeProjects: number;
  completedProjects: number;
  status: 'active' | 'inactive' | 'pending';
  lastActivity: string;
  birthDate?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  achievements?: string[];
  experience?: string;
  schoolName?: string;
}

interface StudentProfileProps {
  student: Student;
  onClose: () => void;
}

export function StudentProfile({ student, onClose }: StudentProfileProps) {
  const getAge = () => {
    if (!student.birthDate) return null;
    const today = new Date();
    const birthDate = new Date(student.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktywny';
      case 'inactive': return 'Nieaktywny';
      case 'pending': return 'Oczekuje';
      default: return status;
    }
  };

  const age = getAge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-sm mx-auto py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-center">Profil ucznia</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Profile Picture and Basic Info */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="w-20 h-20 mx-auto">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xl">
                  {student.firstName[0]}{student.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <h2 className="mb-1">{student.firstName} {student.lastName}</h2>
            <p className="text-sm text-muted-foreground mb-2">
              Klasa {student.class}
              {age && ` • ${age} lat`}
              {student.isMinor && " (małoletni)"}
            </p>
            <Badge className={`${getStatusColor(student.status)} mb-3`}>
              {getStatusLabel(student.status)}
            </Badge>
            {student.schoolName && (
              <p className="text-sm text-muted-foreground">
                {student.schoolName}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Kontakt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{student.email}</span>
            </div>
            {student.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{student.phone}</span>
              </div>
            )}
            
            {/* Address */}
            {(student.street || student.city) && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  {student.street && student.houseNumber && (
                    <div>{student.street} {student.houseNumber}</div>
                  )}
                  {student.postalCode && student.city && (
                    <div>{student.postalCode} {student.city}</div>
                  )}
                </div>
              </div>
            )}

            {/* Parent Consent Status */}
            <div className="flex gap-2 mt-3">
              {student.isMinor && (
                <Badge variant="outline" className="text-xs">
                  Małoletni
                </Badge>
              )}
              {student.parentConsent ? (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                  Zgoda rodziców
                </Badge>
              ) : student.isMinor && (
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                  Brak zgody rodziców
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Volunteer Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Statystyki wolontariatu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-semibold text-blue-600">{student.volunteerHours}</div>
                <div className="text-xs text-muted-foreground">Godzin wolontariatu</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-semibold text-green-600">{student.completedProjects}</div>
                <div className="text-xs text-muted-foreground">Ukończone projekty</div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Aktywne projekty:</span>
                <span className="font-medium">{student.activeProjects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ostatnia aktywność:</span>
                <span className="font-medium">
                  {new Date(student.lastActivity).toLocaleDateString('pl-PL')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        {student.bio && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                O uczniu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{student.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Skills and Interests */}
        {(student.skills?.length || student.interests?.length) && (
          <Card>
            <CardContent className="p-4 space-y-4">
              {student.skills?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Umiejętności
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {student.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {student.interests?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Zainteresowania
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {student.interests.map((interest, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        {student.achievements?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Osiągnięcia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {student.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{achievement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience */}
        {student.experience && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Doświadczenie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{student.experience}</p>
            </CardContent>
          </Card>
        )}

        {/* Close Button */}
        <div className="pb-6">
          <Button 
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Zamknij profil
          </Button>
        </div>
      </div>
    </div>
  );
}