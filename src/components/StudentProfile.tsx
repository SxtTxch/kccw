import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
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
  BarChart3,
  Trophy,
  Flame,
  Zap,
  Crown,
  Medal,
  BookOpen,
  Handshake,
  TrendingUp,
  Lock
} from "lucide-react";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  volunteerHours?: number;
  totalProjects?: number;
  status?: 'active' | 'inactive' | 'pending';
  birthDate?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  achievements?: string[];
  experience?: string;
  schoolName?: string;
  badges?: any;
  // Legacy fields for compatibility
  class?: string;
  isMinor?: boolean;
  parentConsent?: boolean;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
}

interface StudentProfileProps {
  student: Student;
  onClose: () => void;
}

export function StudentProfile({ student, onClose }: StudentProfileProps) {
  const [userBadges, setUserBadges] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user badges from Firestore
  useEffect(() => {
    const fetchUserBadges = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', student.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserBadges(userData.badges || {});
        }
      } catch (error) {
        console.error('Error fetching user badges:', error);
        setUserBadges({});
      } finally {
        setLoading(false);
      }
    };

    fetchUserBadges();
  }, [student.id]);

  // Helper function to format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace('.0', '') + ' mil';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return num.toString();
  };

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
              {student.class && `Klasa ${student.class}`}
              {age && ` • ${age} lat`}
              {student.isMinor && " (małoletni)"}
            </p>
            <Badge className={`${getStatusColor(student.status || 'active')} mb-3`}>
              {getStatusLabel(student.status || 'active')}
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
            {student.phoneNumber && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{student.phoneNumber}</span>
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
                <div className="text-2xl font-semibold text-blue-600">{formatNumber(student.volunteerHours || 0)}</div>
                <div className="text-xs text-muted-foreground">Godzin wolontariatu</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-semibold text-green-600">{formatNumber(student.totalProjects || 0)}</div>
                <div className="text-xs text-muted-foreground">Ukończone projekty</div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium">{getStatusLabel(student.status || 'active')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        {loading ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Odznaki
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">Ładowanie odznak...</div>
            </CardContent>
          </Card>
        ) : userBadges && Object.keys(userBadges).length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Odznaki
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(userBadges)
                  .filter(([badgeKey, badgeData]: [string, any]) => {
                    // Only show badges that are earned/unlocked
                    return badgeData.isUnlocked || badgeData.earned;
                  })
                  .map(([badgeKey, badgeData]: [string, any]) => {
                    // Get icon based on badge name/key (matching VolunteerDashboard)
                    const getBadgeIcon = (badgeName: string) => {
                      switch (badgeName.toLowerCase()) {
                        case 'witaj': return Star;
                        case 'pierwszykrok': return Target;
                        case 'zaangazowany': return Heart;
                        case 'wytrwaly': return Medal;
                        case 'bohater': return Crown;
                        case 'debiutant': return Star;
                        case 'aktywny': return Heart;
                        case 'mistrz': return Trophy;
                        case 'konsekwentny': return Medal;
                        case 'niezdomny': return Crown;
                        case 'mentor': return Star;
                        case 'ambasador': return Heart;
                        case 'pomocnik': return Medal;
                        case 'zmiana': return Trophy;
                        default: return Star;
                      }
                    };

                    const IconComponent = getBadgeIcon(badgeKey);

                    // Get badge color based on badge name/key
                    const getBadgeColor = (badgeName: string) => {
                      switch (badgeName.toLowerCase()) {
                        case 'witaj': return 'from-green-500 to-green-600';
                        case 'pierwszykrok': return 'from-blue-500 to-blue-600';
                        case 'zaangazowany': return 'from-pink-500 to-pink-600';
                        case 'wytrwaly': return 'from-purple-500 to-purple-600';
                        case 'bohater': return 'from-yellow-500 to-orange-500';
                        case 'debiutant': return 'from-indigo-500 to-indigo-600';
                        case 'aktywny': return 'from-red-500 to-red-600';
                        case 'mistrz': return 'from-amber-500 to-amber-600';
                        case 'konsekwentny': return 'from-teal-500 to-teal-600';
                        case 'niezdomny': return 'from-cyan-500 to-cyan-600';
                        case 'mentor': return 'from-blue-600 to-blue-800';
                        case 'ambasador': return 'from-purple-600 to-purple-800';
                        case 'pomocnik': return 'from-emerald-500 to-emerald-600';
                        case 'zmiana': return 'from-red-600 to-red-800';
                        default: return 'from-gray-500 to-gray-600';
                      }
                    };

                    // Get proper badge name with exclamation marks
                    const getBadgeName = (badgeName: string) => {
                      switch (badgeName.toLowerCase()) {
                        case 'witaj': return 'Witaj!';
                        case 'pierwszykrok': return 'Pierwszy Krok';
                        case 'zaangazowany': return 'Zaangażowany';
                        case 'wytrwaly': return 'Wytrwały';
                        case 'bohater': return 'Bohater';
                        case 'debiutant': return 'Debiutant';
                        case 'aktywny': return 'Aktywny';
                        case 'mistrz': return 'Mistrz';
                        case 'konsekwentny': return 'Konsekwentny';
                        case 'niezdomny': return 'Niezłomny';
                        case 'mentor': return 'Mentor';
                        case 'ambasador': return 'Ambasador';
                        case 'pomocnik': return 'Pomocnik';
                        case 'zmiana': return 'Zmiana';
                        default: return badgeData.name || badgeKey;
                      }
                    };

                    const badgeColor = getBadgeColor(badgeKey);
                    const badgeName = getBadgeName(badgeKey);

                    return (
                      <div key={badgeKey} className="text-center p-2">
                        <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 relative bg-gradient-to-r ${badgeColor} shadow-lg`}>
                          <IconComponent className={`h-6 w-6 ${
                            badgeName === 'Mentor' || badgeName === 'Ambasador' || badgeName === 'Zmiana' ||
                            badgeColor.includes('yellow') || badgeColor.includes('orange') || badgeColor.includes('amber') || 
                            badgeColor.includes('lime') || badgeColor.includes('cyan') || badgeColor.includes('emerald') ||
                            badgeColor.includes('yellow-') || badgeColor.includes('orange-') || badgeColor.includes('amber-')
                            ? 'text-gray-800' 
                            : 'text-white'
                          }`} />
                        </div>
                        <div className="text-xs font-medium">{badgeName}</div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ) : null}

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
        {((student.skills && student.skills.length > 0) || (student.interests && student.interests.length > 0)) && (
          <Card>
            <CardContent className="p-4 space-y-4">
              {student.skills && student.skills.length > 0 && (
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

              {student.interests && student.interests.length > 0 && (
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
        {student.achievements && student.achievements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Osiągnięcia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {student.achievements?.map((achievement, index) => (
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