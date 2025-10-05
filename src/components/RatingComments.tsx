import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { StarRating } from './StarRating';
import { RatingComment } from '../firebase/firestore';
import { 
  Star, 
  Heart, 
  Target, 
  Award, 
  Trophy, 
  Medal, 
  Crown,
  Zap,
  Shield,
  Flame
} from 'lucide-react';

interface RatingCommentsProps {
  comments: RatingComment[];
  averageRating: number;
  totalRatings: number;
}

export const RatingComments: React.FC<RatingCommentsProps> = ({ 
  comments, 
  averageRating, 
  totalRatings 
}) => {
  // Map badge names to icons with colors
  const getBadgeIcon = (badgeName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'witaj': <Star className="h-3 w-3 text-yellow-500" />,
      'pierwszyKrok': <Target className="h-3 w-3 text-blue-500" />,
      'zaangazowany': <Heart className="h-3 w-3 text-pink-500" />,
      'wytrwaly': <Medal className="h-3 w-3 text-purple-500" />,
      'bohater': <Crown className="h-3 w-3 text-yellow-600" />,
      'debiutant': <Star className="h-3 w-3 text-indigo-500" />,
      'aktywny': <Heart className="h-3 w-3 text-red-500" />,
      'mistrz': <Trophy className="h-3 w-3 text-amber-500" />,
      'konsekwentny': <Award className="h-3 w-3 text-teal-500" />,
      'niezlomny': <Crown className="h-3 w-3 text-cyan-500" />,
      'mentor': <Shield className="h-3 w-3 text-blue-600" />,
      'ambasador': <Flame className="h-3 w-3 text-purple-600" />,
      'pomocnik': <Heart className="h-3 w-3 text-emerald-500" />,
      'zmiana': <Zap className="h-3 w-3 text-red-600" />
    };
    return iconMap[badgeName] || <Star className="h-3 w-3 text-gray-500" />;
  };

  // Map badge names to background colors
  const getBadgeBackground = (badgeName: string) => {
    const backgroundMap: { [key: string]: string } = {
      'witaj': 'bg-yellow-100',
      'pierwszyKrok': 'bg-blue-100',
      'zaangazowany': 'bg-pink-100',
      'wytrwaly': 'bg-purple-100',
      'bohater': 'bg-yellow-100',
      'debiutant': 'bg-indigo-100',
      'aktywny': 'bg-red-100',
      'mistrz': 'bg-amber-100',
      'konsekwentny': 'bg-teal-100',
      'niezlomny': 'bg-cyan-100',
      'mentor': 'bg-blue-100',
      'ambasador': 'bg-purple-100',
      'pomocnik': 'bg-emerald-100',
      'zmiana': 'bg-red-100'
    };
    return backgroundMap[badgeName] || 'bg-gray-100';
  };

  // Map badge names to information and requirements
  const getBadgeInfo = (badgeName: string) => {
    const infoMap: { [key: string]: { name: string; description: string; requirement: string } } = {
      'witaj': { 
        name: 'Witaj!', 
        description: 'Odznaka powitalna', 
        requirement: 'Automatycznie przyznawana przy rejestracji' 
      },
      'pierwszyKrok': { 
        name: 'Pierwszy Krok', 
        description: 'Rozpoczęcie przygody z wolontariatem', 
        requirement: '1 godzina wolontariatu' 
      },
      'zaangazowany': { 
        name: 'Zaangażowany', 
        description: 'Aktywny uczestnik działań', 
        requirement: '10 godzin wolontariatu' 
      },
      'wytrwaly': { 
        name: 'Wytrwały', 
        description: 'Długoterminowe zaangażowanie', 
        requirement: '50 godzin wolontariatu' 
      },
      'bohater': { 
        name: 'Bohater', 
        description: 'Wzorowy wolontariusz', 
        requirement: '100 godzin wolontariatu' 
      },
      'debiutant': { 
        name: 'Debutant', 
        description: 'Pierwszy projekt', 
        requirement: '1 ukończony projekt' 
      },
      'aktywny': { 
        name: 'Aktywny', 
        description: 'Regularny uczestnik projektów', 
        requirement: '5 ukończonych projektów' 
      },
      'mistrz': { 
        name: 'Mistrz', 
        description: 'Ekspert w dziedzinie wolontariatu', 
        requirement: '15 ukończonych projektów' 
      },
      'konsekwentny': { 
        name: 'Konsekwentny', 
        description: 'Regularne uczestnictwo', 
        requirement: '3 tygodnie z rzędu' 
      },
      'niezlomny': { 
        name: 'Niezlomny', 
        description: 'Nieprzerwane zaangażowanie', 
        requirement: '7 tygodni z rzędu' 
      },
      'mentor': { 
        name: 'Mentor', 
        description: 'Pomoc innym wolontariuszom', 
        requirement: '1 przeprowadzone szkolenie' 
      },
      'ambasador': { 
        name: 'Ambasador', 
        description: 'Rekrutowanie nowych wolontariuszy', 
        requirement: '3 zrekrutowanych wolontariuszy' 
      },
      'pomocnik': { 
        name: 'Pomocnik', 
        description: 'Wpływ na społeczność', 
        requirement: '100 punktów wpływu' 
      },
      'zmiana': { 
        name: 'Zmiana', 
        description: 'Znaczący wpływ na społeczność', 
        requirement: '500 punktów wpływu' 
      }
    };
    return infoMap[badgeName] || { name: 'Nieznana odznaka', description: '', requirement: '' };
  };
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Nieznana data';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBadgeColor = (badgeName: string) => {
    const badgeColors: { [key: string]: string } = {
      'Witaj!': 'bg-green-100 text-green-800',
      'Pierwszy Krok': 'bg-blue-100 text-blue-800',
      'Zaangażowany': 'bg-indigo-100 text-indigo-800',
      'Wytrwały': 'bg-purple-100 text-purple-800',
      'Bohater': 'bg-yellow-100 text-yellow-800',
      'Debiutant': 'bg-teal-100 text-teal-800',
      'Aktywny': 'bg-cyan-100 text-cyan-800',
      'Mistrz': 'bg-lime-100 text-lime-800',
      'Konsekwentny': 'bg-orange-100 text-orange-800',
      'Niezłomny': 'bg-red-100 text-red-800',
      'Mentor': 'bg-blue-700 text-white',
      'Ambasador': 'bg-purple-700 text-white',
      'Pomocnik': 'bg-yellow-100 text-yellow-800',
      'Zmiana': 'bg-red-700 text-white'
    };
    
    return badgeColors[badgeName] || 'bg-gray-100 text-gray-800';
  };

  if (totalRatings === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Oceny i opinie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Brak ocen i opinii</p>
            <p className="text-sm mt-2">Ten wolontariusz nie otrzymał jeszcze żadnych ocen.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Oceny i opinie</CardTitle>
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} size="md" showValue />
            <span className="text-sm text-gray-600">
              ({totalRatings} {totalRatings === 1 ? 'ocena' : 'ocen'})
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-20">
          {comments.map((comment) => (
            <div key={comment.id} className="pb-20 last:pb-0">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-pink-100 text-pink-600">
                    {comment.authorName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-sm">{comment.authorName}</h4>
                    <div className="flex gap-1">
                      {comment.authorBadges.slice(0, 5).map((badge, index) => {
                        const badgeInfo = getBadgeInfo(badge);
                        return (
                          <div key={index} className="relative group">
                            <Badge 
                              variant="secondary" 
                              className={`p-1 ${getBadgeBackground(badge)} cursor-help`}
                            >
                              {getBadgeIcon(badge)}
                            </Badge>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-6 py-4 bg-white border-2 border-gray-800 text-gray-900 text-sm rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 min-w-max max-w-xs">
                              <div className="font-bold text-gray-900 mb-1">{badgeInfo.name}</div>
                              <div className="text-gray-700 text-xs mb-2">{badgeInfo.description}</div>
                              <div className="text-blue-600 font-medium text-xs bg-blue-50 px-2 py-1 rounded-md">{badgeInfo.requirement}</div>
                              {/* Arrow pointing down */}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white"></div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-0.5 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-800"></div>
                            </div>
                          </div>
                        );
                      })}
                      {comment.authorBadges.length > 5 && (
                        <Badge variant="secondary" className="p-1 bg-gray-100 text-gray-600">
                          +{comment.authorBadges.length - 5}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={comment.rating} size="sm" />
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed p-1 mb-4">
                    {comment.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
