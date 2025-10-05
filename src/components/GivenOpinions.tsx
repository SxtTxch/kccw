import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { StarRating } from './StarRating';
import { UserOpinion } from '../firebase/firestore';

interface GivenOpinionsProps {
  opinions: UserOpinion[];
  totalOpinions: number;
}

export const GivenOpinions: React.FC<GivenOpinionsProps> = ({ 
  opinions, 
  totalOpinions 
}) => {
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

  if (totalOpinions === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Twoje opinie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Nie napisałeś jeszcze żadnych opinii</p>
            <p className="text-sm mt-2">Twoje opinie o innych wolontariuszach pojawią się tutaj.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Twoje opinie</CardTitle>
          <Badge variant="secondary" className="text-sm">
            {totalOpinions} {totalOpinions === 1 ? 'opinia' : 'opinii'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {opinions.map((opinion) => (
            <div key={opinion.id} className="border-b border-gray-100 pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-sm text-gray-900">
                    Opinia od: {opinion.targetUserName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={opinion.rating} size="sm" />
                    <span className="text-xs text-gray-500">
                      {formatDate(opinion.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed">
                {opinion.comment}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
