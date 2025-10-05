import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { StarRating } from './StarRating';
import { addVolunteerRating } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface RatingFormProps {
  volunteerId: string;
  volunteerName: string;
  onRatingAdded?: () => void;
  onCancel?: () => void;
}

export const RatingForm: React.FC<RatingFormProps> = ({ 
  volunteerId, 
  volunteerName, 
  onRatingAdded,
  onCancel 
}) => {
  const { userProfile } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is trying to rate themselves
  const isSelfRating = userProfile?.id === volunteerId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSelfRating) {
      alert('Nie możesz ocenić samego siebie!');
      return;
    }
    
    if (rating === 0) {
      alert('Proszę wybrać ocenę (1-5 gwiazdek)');
      return;
    }

    if (!comment.trim()) {
      alert('Proszę napisać komentarz');
      return;
    }

    if (!userProfile) {
      alert('Musisz być zalogowany, aby dodać ocenę');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get author's badges
      const authorBadges = Object.entries(userProfile.badges || {})
        .filter(([_, badgeData]: [string, any]) => badgeData.earned)
        .map(([badgeName, _]) => badgeName);

      const success = await addVolunteerRating(volunteerId, {
        authorId: userProfile.id!,
        authorName: `${userProfile.firstName} ${userProfile.lastName}`,
        authorBadges,
        comment: comment.trim(),
        rating
      });

      if (success) {
        alert('Ocena została dodana pomyślnie!');
        setRating(0);
        setComment('');
        onRatingAdded?.();
      } else {
        alert('Wystąpił błąd podczas dodawania oceny. Spróbuj ponownie.');
      }
    } catch (error) {
      console.error('Error adding rating:', error);
      alert('Wystąpił błąd podczas dodawania oceny. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show warning if trying to rate self
  if (isSelfRating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-red-600">Nie można ocenić samego siebie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Nie możesz dodać oceny dla samego siebie.
            </p>
            <p className="text-sm text-gray-500">
              Aby ocenić innych wolontariuszy, przejdź do ich profili.
            </p>
            {onCancel && (
              <Button 
                onClick={onCancel}
                className="mt-4"
                variant="outline"
              >
                Zamknij
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Oceń wolontariusza: {volunteerName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ocena (1-5 gwiazdek)
            </label>
            <StarRating 
              rating={rating} 
              interactive 
              onRatingChange={setRating}
              size="lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Komentarz
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Napisz swoją opinię o tym wolontariuszu..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 znaków
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting || rating === 0 || !comment.trim()}
              className="flex-1"
            >
              {isSubmitting ? 'Dodawanie...' : 'Dodaj ocenę'}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Anuluj
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
