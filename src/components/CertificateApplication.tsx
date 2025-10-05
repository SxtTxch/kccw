import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  School,
  Award
} from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

interface CertificateApplicationProps {
  userProfile: any;
  onApplicationSubmitted: () => void;
}

interface CertificateApplicationData {
  studentName: string;
  studentEmail: string;
  schoolName: string;
  projectTitle: string;
  projectDescription: string;
  volunteerHours: number;
  startDate: string;
  endDate: string;
  supervisorName: string;
  supervisorContact: string;
  achievements: string;
  skills: string[];
  additionalInfo: string;
}

export const CertificateApplication: React.FC<CertificateApplicationProps> = ({ 
  userProfile, 
  onApplicationSubmitted 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CertificateApplicationData>({
    studentName: `${userProfile.firstName} ${userProfile.lastName}`,
    studentEmail: userProfile.email,
    schoolName: userProfile.schoolName || '',
    projectTitle: '',
    projectDescription: '',
    volunteerHours: userProfile.volunteerHours || 0,
    startDate: '',
    endDate: '',
    supervisorName: '',
    supervisorContact: '',
    achievements: '',
    skills: [],
    additionalInfo: ''
  });

  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.projectTitle || !formData.projectDescription || !formData.startDate || !formData.endDate) {
        throw new Error('Wszystkie pola są wymagane');
      }

      if (formData.volunteerHours < 1) {
        throw new Error('Liczba godzin wolontariatu musi być większa niż 0');
      }

      // Create certificate application
      const applicationData = {
        studentId: userProfile.id,
        studentName: formData.studentName,
        studentEmail: formData.studentEmail,
        schoolName: formData.schoolName,
        projectTitle: formData.projectTitle,
        projectDescription: formData.projectDescription,
        volunteerHours: formData.volunteerHours,
        startDate: formData.startDate,
        endDate: formData.endDate,
        supervisorName: formData.supervisorName,
        supervisorContact: formData.supervisorContact,
        achievements: formData.achievements,
        skills: formData.skills,
        additionalInfo: formData.additionalInfo,
        status: 'pending',
        submittedAt: serverTimestamp(),
        coordinatorId: null, // Will be set when coordinator processes it
        processedAt: null,
        rejectionReason: null
      };

      // Save to Firebase
      const applicationsRef = collection(db, 'certificateApplications');
      await addDoc(applicationsRef, applicationData);

      setSubmitted(true);
      onApplicationSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas składania wniosku');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Wniosek o zaświadczenie został złożony!
          </h3>
          <p className="text-sm text-green-700 mb-4">
            Twój wniosek został przesłany do koordynatora szkoły. Otrzymasz powiadomienie o decyzji.
          </p>
          <Badge className="bg-green-100 text-green-800">
            Oczekuje na zatwierdzenie
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Wniosek o zaświadczenie o wolontariacie
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Wypełnij poniższy formularz, aby złożyć wniosek o zaświadczenie o wolontariacie.
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Dane ucznia
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentName">Imię i nazwisko</Label>
                <Input
                  id="studentName"
                  value={formData.studentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="studentEmail">Email</Label>
                <Input
                  id="studentEmail"
                  type="email"
                  value={formData.studentEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentEmail: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="schoolName">Szkoła</Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Project Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Informacje o projekcie
            </h4>
            <div>
              <Label htmlFor="projectTitle">Tytuł projektu *</Label>
              <Input
                id="projectTitle"
                value={formData.projectTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
                placeholder="Np. Pomoc w schronisku dla zwierząt"
                required
              />
            </div>
            <div>
              <Label htmlFor="projectDescription">Opis projektu *</Label>
              <Textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                placeholder="Opisz szczegółowo, co robiłeś podczas wolontariatu..."
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="volunteerHours">Liczba godzin *</Label>
                <Input
                  id="volunteerHours"
                  type="number"
                  min="1"
                  value={formData.volunteerHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, volunteerHours: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startDate">Data rozpoczęcia *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">Data zakończenia *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Supervisor Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <School className="h-4 w-4" />
              Opiekun projektu
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supervisorName">Imię i nazwisko opiekuna</Label>
                <Input
                  id="supervisorName"
                  value={formData.supervisorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, supervisorName: e.target.value }))}
                  placeholder="Np. Jan Kowalski"
                />
              </div>
              <div>
                <Label htmlFor="supervisorContact">Kontakt do opiekuna</Label>
                <Input
                  id="supervisorContact"
                  value={formData.supervisorContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, supervisorContact: e.target.value }))}
                  placeholder="Email lub telefon"
                />
              </div>
            </div>
          </div>

          {/* Skills and Achievements */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Umiejętności i osiągnięcia</h4>
            <div>
              <Label htmlFor="achievements">Osiągnięcia</Label>
              <Textarea
                id="achievements"
                value={formData.achievements}
                onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                placeholder="Opisz swoje osiągnięcia podczas wolontariatu..."
                rows={3}
              />
            </div>
            <div>
              <Label>Umiejętności</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Dodaj umiejętność"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  Dodaj
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <Label htmlFor="additionalInfo">Dodatkowe informacje</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
              placeholder="Dodatkowe informacje, które mogą być przydatne..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Składanie wniosku...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Złóż wniosek
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
