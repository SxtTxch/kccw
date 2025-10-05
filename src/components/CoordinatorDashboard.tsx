import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Calendar, 
  MessageCircle, 
  FileText, 
  User,
  GraduationCap,
  Filter,
  Bell,
  LogOut,
  ChevronRight,
  CheckCircle,
  Building2,
  Download,
  Eye,
  UserCheck,
  AlertCircle,
  Mail,
  Phone,
  BarChart3,
  FileCheck,
  UserPlus,
  Settings,
  School,
  Award,
  TrendingUp,
  Calendar as CalendarIcon,
  Star,
  Map,
  Shield,
  Target,
  X
} from "lucide-react";
import { MapView } from "./MapView";
import { PrivacySettings } from "./PrivacySettings";
import { ChatButton, Chat } from "./Chat";
import { EditProfile } from "./EditProfile";
import { StudentProfile } from "./StudentProfile";
import { 
  generateMonthlyReport, 
  generateActivityReport, 
  generateOrganizationsReport, 
  generateCertificatesReport 
} from "../utils/reportGenerator";
import { getStudentsBySchool, getAllUsers, getAllOffers } from "../firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import logoVertical from "../assets/images/logos/Mlody_Krakow_LOGO_cmyk_pion.png";
import { useChat } from "../contexts/ChatContext";

interface User {
  id: number;
  email: string;
  userType: string;
  firstName: string;
  lastName: string;
  schoolName: string;
}

interface CoordinatorDashboardProps {
  user: User;
  onLogout: () => void;
}

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

interface Organization {
  id: number;
  name: string;
  type: string;
  contactPerson: string;
  email: string;
  phone: string;
  activeProjects: number;
  rating: number;
  lastContact: string;
  status: 'active' | 'pending' | 'inactive';
}

interface Project {
  id: number;
  title: string;
  organization: string;
  organizationId: number;
  category: string;
  description: string;
  maxStudents: number;
  enrolledStudents: number;
  startDate: string;
  endDate: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  coordinatorApproved: boolean;
}

interface Certificate {
  id: number;
  studentId: number;
  studentName: string;
  projectTitle: string;
  organization: string;
  hours: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'deadline' | 'event' | 'training';
  description: string;
  attendees?: string[];
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const mockStudents: Student[] = [
  {
    id: 1,
    firstName: "Anna",
    lastName: "Kowalska",
    class: "III A",
    email: "anna.kowalska@liceum.edu.pl",
    phone: "123-456-789",
    isMinor: false,
    parentConsent: true,
    volunteerHours: 45,
    activeProjects: 2,
    completedProjects: 3,
    status: 'active',
    lastActivity: "2024-10-03",
    birthDate: "2005-03-15",
    street: "ul. Warsztatowa",
    houseNumber: "12/5",
    postalCode: "02-678",
    city: "Warszawa",
    schoolName: "XV Liceum Ogólnokształcące im. Narcyzy Żmichowskiej",
    bio: "Jestem uczennicą klasy III A. Interesuję się pomocą zwierzętom i pracą z dziećmi. Moim celem jest rozwój osobisty poprzez wolontariat oraz pomoc innym.",
    skills: ["Pierwsza pomoc", "Opieka nad zwierzętami", "Praca z dziećmi", "Komunikacja"],
    interests: ["Fotografia", "Sport", "Książki", "Muzyka"],
    achievements: ["Wolontariusz roku 2023", "Certyfikat pierwszej pomocy", "Ukończenie kursu opieki nad zwierzętami"],
    experience: "Pracuję jako wolontariuszka od 2 lat. Mam doświadczenie w pracy w schronisku dla zwierząt oraz w organizacji eventów charytatywnych."
  },
  {
    id: 2,
    firstName: "Piotr",
    lastName: "Nowak",
    class: "II B",
    email: "piotr.nowak@liceum.edu.pl",
    phone: "123-456-790",
    isMinor: true,
    parentConsent: true,
    volunteerHours: 28,
    activeProjects: 1,
    completedProjects: 1,
    status: 'active',
    lastActivity: "2024-10-04",
    birthDate: "2007-08-22",
    street: "ul. Młodzieżowa",
    houseNumber: "45",
    postalCode: "02-515",
    city: "Warszawa",
    schoolName: "XV Liceum Ogólnokształcące im. Narcyzy Żmichowskiej",
    bio: "Uczeń klasy II B zainteresowany technologią i nauką. Chętnie pomagam w zajęciach komputerowych dla seniorów.",
    skills: ["Informatyka", "Matematyka", "Dydaktyka", "Cierpliwość"],
    interests: ["Programowanie", "Gry komputerowe", "Elektronika", "Nauka"],
    achievements: ["Laureat konkursu informatycznego", "Certyfikat instruktora komputerowego"],
    experience: "Dopiero zaczynam przygodę z wolontariatem, ale jestem bardzo zmotywowany do pomocy."
  },
  {
    id: 3,
    firstName: "Maria",
    lastName: "Wiśniewska",
    class: "I C",
    email: "maria.wisniewska@liceum.edu.pl",
    phone: "123-456-791",
    isMinor: true,
    parentConsent: false,
    volunteerHours: 0,
    activeProjects: 0,
    completedProjects: 0,
    status: 'pending',
    lastActivity: "2024-09-28",
    birthDate: "2008-12-10",
    street: "ul. Szkolna",
    houseNumber: "7A",
    postalCode: "02-425",
    city: "Warszawa",
    schoolName: "XV Liceum Ogólnokształcące im. Narcyzy Żmichowskiej",
    bio: "Uczennica klasy I C. Bardzo chciałabym zacząć wolontariat, ale czekam na zgodę rodziców.",
    skills: ["Języki obce", "Rysowanie", "Organizacja"],
    interests: ["Sztuka", "Literatura", "Podróże", "Kultura"],
    achievements: [],
    experience: "Nie mam jeszcze doświadczenia w wolontariacie, ale bardzo chciałabym zacząć pomagać."
  }
];


const mockProjects: Project[] = [
  {
    id: 1,
    title: "Opieka nad zwierzętami w schronisku",
    organization: "Fundacja Przyjaciół Zwierząt",
    organizationId: 1,
    category: "Opieka nad zwierzętami",
    description: "Pomoc w codziennej opiece nad zwierzętami",
    maxStudents: 8,
    enrolledStudents: 5,
    startDate: "2024-11-01",
    endDate: "2024-12-15",
    status: 'open',
    coordinatorApproved: true
  },
  {
    id: 2,
    title: "Pomoc w jadłodajni",
    organization: "Caritas Warszawa",
    organizationId: 2,
    category: "Pomoc społeczna",
    description: "Przygotowywanie i wydawanie posiłków",
    maxStudents: 12,
    enrolledStudents: 8,
    startDate: "2024-10-15",
    endDate: "2024-11-30",
    status: 'in-progress',
    coordinatorApproved: true
  },
  {
    id: 3,
    title: "Towarzyszenie pacjentom",
    organization: "Hospicjum św. Łazarza",
    organizationId: 3,
    category: "Opieka zdrowotna",
    description: "Towarzyszenie i rozmowa z pacjentami",
    maxStudents: 4,
    enrolledStudents: 2,
    startDate: "2024-11-15",
    endDate: "2024-12-31",
    status: 'open',
    coordinatorApproved: false
  }
];

const mockCertificates: Certificate[] = [
  {
    id: 1,
    studentId: 1,
    studentName: "Anna Kowalska",
    projectTitle: "Pomoc w schronisku dla zwierząt",
    organization: "Fundacja Przyjaciół Zwierząt",
    hours: 20,
    startDate: "2024-09-01",
    endDate: "2024-09-30",
    status: 'pending',
    submittedDate: "2024-10-01"
  },
  {
    id: 2,
    studentId: 2,
    studentName: "Piotr Nowak",
    projectTitle: "Pakowanie paczek żywnościowych",
    organization: "Caritas Warszawa",
    hours: 15,
    startDate: "2024-08-15",
    endDate: "2024-09-15",
    status: 'approved',
    submittedDate: "2024-09-16"
  },
  {
    id: 3,
    studentId: 1,
    studentName: "Anna Kowalska",
    projectTitle: "Zajęcia z dziećmi w świetlicy",
    organization: "Stowarzyszenie Dziecięcy Uśmiech",
    hours: 25,
    startDate: "2024-07-01",
    endDate: "2024-08-31",
    status: 'approved',
    submittedDate: "2024-09-01"
  }
];

const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Spotkanie z Caritas Warszawa",
    date: "2024-10-15",
    time: "14:00",
    type: "meeting",
    description: "Omówienie nowych projektów wolontariackich",
    attendees: ["Ks. Jan Kowalski", "Mgr Anna Kowal"],
    location: "Sala konferencyjna",
    status: 'scheduled'
  },
  {
    id: 2,
    title: "Termin składania zaświadczeń",
    date: "2024-10-30",
    time: "23:59",
    type: "deadline",
    description: "Ostateczny termin składania zaświadczeń za październik",
    status: 'scheduled'
  },
  {
    id: 3,
    title: "Szkolenie koordynatorów",
    date: "2024-11-05",
    time: "10:00",
    type: "training",
    description: "Szkolenie z nowych procedur wolontariatu",
    location: "Kuratorium Oświaty",
    status: 'scheduled'
  },
  {
    id: 4,
    title: "Dzień Wolontariusza",
    date: "2024-12-05",
    time: "09:00",
    type: "event",
    description: "Obchody Międzynarodowego Dnia Wolontariusza",
    location: "Aula szkolna",
    status: 'scheduled'
  }
];

export function CoordinatorDashboard({ user, onLogout }: CoordinatorDashboardProps) {
  const { userProfile } = useAuth();
  const { openChat } = useChat();
  const [activeTab, setActiveTab] = useState("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [students, setStudents] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [offers, setOffers] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [projects] = useState<Project[]>(mockProjects);
  const [certificates] = useState<Certificate[]>(mockCertificates);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loadingCalendarEvents, setLoadingCalendarEvents] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch students from Firebase
  useEffect(() => {
    const fetchStudents = async () => {
      if (!userProfile?.schoolName) {
        console.log('No school name found for coordinator');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const studentsData = await getStudentsBySchool(userProfile.schoolName);
        setStudents(studentsData);
        console.log('Fetched students:', studentsData);
        console.log('First student data structure:', studentsData[0]);
        console.log('Student volunteer hours field:', (studentsData[0] as any)?.volunteerHours);
        console.log('Student total projects field:', (studentsData[0] as any)?.totalProjects);
        console.log('All student fields:', Object.keys(studentsData[0] || {}));
        console.log('Student data sample:', {
          volunteerHours: (studentsData[0] as any)?.volunteerHours,
          totalProjects: (studentsData[0] as any)?.totalProjects,
          firstName: (studentsData[0] as any)?.firstName,
          lastName: (studentsData[0] as any)?.lastName
        });
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [userProfile?.schoolName]);

  // Fetch organizations from Firebase
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoadingOrganizations(true);
        const allUsers = await getAllUsers();
        
        // Filter for organization users
        const organizationUsers = allUsers.filter(user => user.userType === 'organizacja');
        
        // Convert to Organization interface format
        const organizationsData: Organization[] = organizationUsers.map((user, index) => ({
          id: parseInt(user.id || '0') || index + 1, // Convert to number for Organization interface
          name: user.organizationName || user.firstName + ' ' + user.lastName,
          type: user.organizationType || 'Organizacja',
          contactPerson: user.organizationName || user.firstName + ' ' + user.lastName,
          email: user.email,
          phone: user.phoneNumber || 'Brak numeru',
          activeProjects: user.totalProjects || 0,
          rating: 4.5, // Default rating since we don't have this in user profile
          lastContact: user.lastLoginAt ? 
            (user.lastLoginAt.toDate ? user.lastLoginAt.toDate().toISOString().split('T')[0] : new Date(user.lastLoginAt).toISOString().split('T')[0]) : 
            new Date().toISOString().split('T')[0],
          status: user.isActive ? 'active' : 'inactive'
        }));
        
        console.log('Fetched organizations:', organizationsData);
        setOrganizations(organizationsData);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoadingOrganizations(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Fetch offers from Firebase
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoadingOffers(true);
        const offersData = await getAllOffers();
        console.log('Fetched offers for calendar:', offersData);
        setOffers(offersData);
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoadingOffers(false);
      }
    };

    fetchOffers();
  }, []);

  // Fetch calendar events from Firebase
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        setLoadingCalendarEvents(true);
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');
        
        const eventsRef = collection(db, 'calendarEvents');
        const querySnapshot = await getDocs(eventsRef);
        
        const events: CalendarEvent[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          events.push({
            id: parseInt(doc.id) || Math.random(),
            title: data.title,
            date: data.date,
            time: data.time,
            type: data.type || 'event',
            description: data.description,
            attendees: data.attendees || [],
            location: data.location,
            status: data.status || 'scheduled'
          });
        });
        
        console.log('Fetched calendar events:', events);
        setCalendarEvents(events);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      } finally {
        setLoadingCalendarEvents(false);
      }
    };

    fetchCalendarEvents();
  }, []);

  // Helper functions
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace('.0', '') + ' mil';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return num.toString();
  };

  // Get dates that have offers
  const getOfferDates = () => {
    return offers.map(offer => new Date(offer.startDate));
  };

  // Get offers for a specific date
  const getOffersForDate = (date: Date) => {
    const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
    return offers.filter(offer => {
      const offerDate = new Date(offer.startDate).toLocaleDateString('en-CA');
      return offerDate === dateStr;
    });
  };

  // Handle calendar date click
  const handleCalendarDateClick = (date: Date) => {
    setSelectedDate(date);
    // Events will be displayed below calendar automatically
  };

  const getStudentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStudentStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktywny';
      case 'inactive': return 'Nieaktywny';
      case 'pending': return 'Oczekuje';
      default: return status;
    }
  };

  const getOrganizationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificateStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
      case 'event': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'training': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => event.date === dateStr);
  };

  // Get upcoming events (next 7 days) from offers and calendar events
  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Get upcoming offers
    const upcomingOffers = offers
      .filter(offer => {
        const offerDate = new Date(offer.startDate);
        return offerDate >= today && offerDate <= nextWeek;
      })
      .map(offer => ({
        id: offer.id,
        title: offer.title,
        date: offer.startDate,
        time: '09:00', // Default time for offers
        type: 'offer' as const,
        description: offer.description,
        location: offer.location,
        organization: offer.organization,
        participants: offer.currentParticipants,
        maxParticipants: offer.maxParticipants
      }));
    
    // Get upcoming calendar events
    const upcomingCalendarEvents = calendarEvents
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .map(event => ({
        id: event.id.toString(),
        title: event.title,
        date: event.date,
        time: event.time,
        type: event.type,
        description: event.description,
        location: event.location,
        attendees: event.attendees
      }));
    
    // Combine and sort by date
    return [...upcomingOffers, ...upcomingCalendarEvents]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const handleProfileSave = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    setIsEditingProfile(false);
  };

  if (isEditingProfile) {
    return (
      <EditProfile 
        user={currentUser}
        onSave={handleProfileSave}
        onCancel={() => setIsEditingProfile(false)}
      />
    );
  }

  if (selectedStudent) {
    return (
      <StudentProfile 
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    );
  }

  // Filtered data
  const filteredStudents = students.filter(student => {
    const matchesSearch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (student.schoolName && student.schoolName.toLowerCase().includes(searchQuery.toLowerCase()));
    const studentStatus = student.status || 'active';
    const matchesFilter = selectedFilter === "all" || studentStatus === selectedFilter || (selectedFilter === "active" && (studentStatus === 'active' || student.isActive));
    return matchesSearch && matchesFilter;
  });

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || org.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const pendingCertificates = certificates.filter(cert => cert.status === 'pending');

  // Statistics - all connected to real Firebase data
  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => (s.status || 'active') === 'active' || s.isActive).length,
    totalHours: students.reduce((sum, s) => sum + (s.volunteerHours || 0), 0),
    pendingCertificates: pendingCertificates.length,
    activeOrganizations: organizations.filter(o => o.status === 'active').length,
    activeProjects: offers.filter(o => o.status === 'active').length, // Use real offers instead of mock projects
    totalOffers: offers.length,
    completedProjects: students.reduce((sum, s) => sum + (s.totalProjects || 0), 0),
    averageRating: students.length > 0 ? 
      students.reduce((sum, s) => sum + (s.ratings?.averageRating || 0), 0) / students.length : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src={logoVertical} 
                alt="Młody Kraków Logo" 
                className="h-10 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg">Cześć, {user.firstName}!</h1>
              <p className="text-sm text-muted-foreground">{user.schoolName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openChat();
              }}
              title="Otwórz chat"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-sm mx-auto p-4 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="mb-2">Zarządzanie uczniami</h2>
              <p className="text-sm text-muted-foreground">Uczniowie biorący udział w wolontariacie</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-semibold text-blue-600">{formatNumber(stats.activeStudents)}</div>
                  <div className="text-xs text-muted-foreground">{stats.activeStudents === 1 ? 'Aktywny uczeń' : stats.activeStudents === 0 || stats.activeStudents >= 5 ? 'Aktywnych uczniów' : 'Aktywni uczniowie'}</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj uczniów..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszyscy</SelectItem>
                    <SelectItem value="active">Aktywni</SelectItem>
                    <SelectItem value="pending">Oczekujący</SelectItem>
                    <SelectItem value="inactive">Nieaktywni</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Students List */}
            {loading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Ładowanie uczniów...</p>
                </CardContent>
              </Card>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <Card key={student.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">
                          {student.firstName} {student.lastName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mb-2">
                          <School className="h-4 w-4" />
                          {student.schoolName || 'Brak informacji o szkole'}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStudentStatusColor(student.status || 'active')} border flex items-center gap-1`}>
                        <div className={`w-2 h-2 rounded-full ${
                          (student.status || 'active') === 'active' ? 'bg-green-500' :
                          (student.status || 'active') === 'pending' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        {getStudentStatusLabel(student.status || 'active')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatNumber(student.volunteerHours || 0)} godzin
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {formatNumber(student.totalProjects || 0)} {(student.totalProjects || 0) === 1 ? 'projekt' : (student.totalProjects || 0) === 0 || (student.totalProjects || 0) >= 5 ? 'projektów' : 'projekty'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {student.birthDate ? new Date(student.birthDate).toLocaleDateString('pl-PL') : 'Brak danych'}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{student.email}</span>
                      </div>
                      {student.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{student.phoneNumber}</span>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-2">
                        {student.isMinor && (
                          <Badge variant="outline" className="text-xs">
                            Małoletni
                          </Badge>
                        )}
                        {student.parentConsent && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            Zgoda rodziców
                          </Badge>
                        )}
                        {student.isMinor && !student.parentConsent && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                            Brak zgody rodziców
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Szczegóły
                      </Button>
                      <ChatButton 
                        contact={{
                          id: student.id,
                          name: `${student.firstName} ${student.lastName}`,
                          role: "Uczeń",
                          organization: `Klasa ${student.class}`,
                          isOnline: student.status === 'active',
                          lastSeen: student.status !== 'active' ? "1 dzień temu" : undefined
                        }}
                        userType="koordynator"
                        variant="inline"
                        className="text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nie znaleziono uczniów</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="mb-2">Organizacje</h2>
              <p className="text-sm text-muted-foreground">Współpracujące organizacje pozarządowe</p>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj organizacji..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie</SelectItem>
                    <SelectItem value="active">Aktywne</SelectItem>
                    <SelectItem value="pending">Oczekujące</SelectItem>
                    <SelectItem value="inactive">Nieaktywne</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Organizations List */}
            {loadingOrganizations ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Ładowanie organizacji...</p>
                </CardContent>
              </Card>
            ) : filteredOrganizations.length > 0 ? (
              filteredOrganizations.map(org => (
                <Card key={org.id} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{org.name}</CardTitle>
                        <CardDescription className="mb-2">{org.type}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`${getOrganizationStatusColor(org.status)}`}>
                          {org.status === 'active' ? 'Aktywna' : org.status === 'pending' ? 'Oczekuje' : 'Nieaktywna'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-muted-foreground">{org.rating}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="mb-3">
                      <div className="text-sm mb-2">
                        <span className="text-muted-foreground">Instytucja:</span>
                        <br />
                        <span>{org.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">{org.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">{org.phone}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {org.activeProjects} projektów
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(org.lastContact).toLocaleDateString('pl-PL')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <ChatButton 
                        contact={{
                          id: org.id.toString(), // Convert to string for ChatContact
                          name: org.contactPerson,
                          email: org.email,
                          role: "Przedstawiciel organizacji",
                          organization: org.name,
                          isOnline: org.status === 'active',
                          lastSeen: org.status !== 'active' ? "12 godz. temu" : undefined
                        }}
                        userType="koordynator"
                        variant="inline"
                        className="text-sm flex-1"
                      />
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Projekty
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nie znaleziono organizacji</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="mb-2">Kalendarz ofert</h2>
              <p className="text-sm text-muted-foreground">Kliknij na podświetlone daty, aby zobaczyć oferty</p>
            </div>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Nadchodzące wydarzenia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getUpcomingEvents().length > 0 ? (
                  <div className="space-y-3">
                    {getUpcomingEvents().map(event => (
                      <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium">{event.title}</h4>
                          <Badge className={`${event.type === 'offer' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-green-100 text-green-800 border-green-200'} text-xs`}>
                            {event.type === 'offer' ? 'Oferta' : 
                             event.type === 'meeting' ? 'Spotkanie' : 
                             event.type === 'training' ? 'Szkolenie' : 'Wydarzenie'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.date).toLocaleDateString('pl-PL')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                          {event.type === 'offer' && (event as any).participants !== undefined && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {(event as any).participants}/{(event as any).maxParticipants} osób
                            </span>
                          )}
                        </div>
                        {event.type === 'offer' && (event as any).organization && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium">Organizacja:</span> {(event as any).organization}
                          </div>
                        )}
                        {event.type !== 'offer' && (event as any).attendees && (event as any).attendees.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium">Uczestnicy:</span> {(event as any).attendees.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Brak nadchodzących wydarzeń</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calendar Component */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Kalendarz</CardTitle>
                <CardDescription>Kliknij na podświetlone daty, aby zobaczyć oferty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        handleCalendarDateClick(date);
                      }
                    }}
                    className="rounded-md border"
                    modifiers={{
                      hasOffers: getOfferDates()
                    }}
                    modifiersStyles={{
                      hasOffers: {
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        color: '#22c55e',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Selected Date Offers */}
            {selectedDate && getOffersForDate(selectedDate).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Oferty na {selectedDate.toLocaleDateString('pl-PL')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getOffersForDate(selectedDate).map(offer => (
                      <div 
                        key={offer.id} 
                        className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setSelectedOffer(offer);
                          setShowOfferModal(true);
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium">{offer.title}</h4>
                          <Badge className={`${getUrgencyColor(offer.urgency)} border text-xs`}>
                            {offer.urgency === 'high' ? 'Pilne' : offer.urgency === 'medium' ? 'Średnie' : 'Niskie'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{offer.organization}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(offer.startDate).toLocaleDateString('pl-PL')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{offer.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{offer.currentParticipants}/{offer.maxParticipants}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{offer.category}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="mb-2">Zaświadczenia</h2>
              <p className="text-sm text-muted-foreground">Zatwierdzanie zaświadczeń o wolontariacie</p>
            </div>

            {/* Pending Certificates Alert */}
            {pendingCertificates.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h4 className="text-yellow-800 mb-1">Oczekujące zaświadczenia</h4>
                      <p className="text-sm text-yellow-700">
                        {pendingCertificates.length} zaświadczenie{pendingCertificates.length > 1 ? 'ń' : ''} oczekuje na zatwierdzenie
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certificates List */}
            {certificates.length > 0 ? (
              certificates.map(cert => (
                <Card key={cert.id} className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{cert.studentName}</CardTitle>
                        <CardDescription className="mb-2">{cert.projectTitle}</CardDescription>
                      </div>
                      <Badge className={`${getCertificateStatusColor(cert.status)}`}>
                        {cert.status === 'pending' ? 'Oczekuje' : 
                         cert.status === 'approved' ? 'Zatwierdzone' : 'Odrzucone'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {cert.organization}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {cert.hours} godzin
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(cert.startDate).toLocaleDateString('pl-PL')} - {new Date(cert.endDate).toLocaleDateString('pl-PL')}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {new Date(cert.submittedDate).toLocaleDateString('pl-PL')}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      {cert.status === 'pending' ? (
                        <>
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Zatwierdź
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                            Odrzuć
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            Podgląd
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Brak zaświadczeń do przeglądu</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Management Tab (Reports, Certificates, Map) */}
          <TabsContent value="reports" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="mb-2">Zarządzanie</h2>
              <p className="text-sm text-muted-foreground">Raporty, zaświadczenia i mapa inicjatyw</p>
            </div>

            {/* Management Navigation */}
            <Card>
              <CardContent className="p-2">
                <Tabs defaultValue="reports-section">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="reports-section">Raporty</TabsTrigger>
                    <TabsTrigger value="certificates-section">Zaświadczenia</TabsTrigger>
                    <TabsTrigger value="map-section">Mapa</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="reports-section" className="mt-4 space-y-4">

                    {/* Statistics Overview */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <Card>
                        <CardContent className="p-3 text-center">
                          <div className="text-2xl font-semibold text-blue-600">{stats.totalStudents}</div>
                          <div className="text-xs text-muted-foreground">Łącznie uczniów</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <div className="text-2xl font-semibold text-green-600">{stats.activeProjects}</div>
                          <div className="text-xs text-muted-foreground">Aktywne oferty</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <div className="text-2xl font-semibold text-purple-600">{formatNumber(stats.totalHours)}</div>
                          <div className="text-xs text-muted-foreground">Łączne godziny</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <div className="text-2xl font-semibold text-orange-600">{stats.activeOrganizations}</div>
                          <div className="text-xs text-muted-foreground">Organizacje</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <div className="text-2xl font-semibold text-cyan-600">{stats.completedProjects}</div>
                          <div className="text-xs text-muted-foreground">Ukończone projekty</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <div className="text-2xl font-semibold text-pink-600">{stats.totalOffers}</div>
                          <div className="text-xs text-muted-foreground">Wszystkie oferty</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Report Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Generowanie raportów
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => generateMonthlyReport(students, offers, organizations, stats)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Raport miesięczny
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => generateActivityReport(students)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Raport aktywności uczniów
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => generateOrganizationsReport(organizations)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Raport organizacji partnerskich
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => generateCertificatesReport(certificates)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Raport zaświadczeń
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Activity Trends */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Trendy aktywności
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Aktywni uczniowie</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div className="w-3/4 h-2 bg-blue-500 rounded-full"></div>
                              </div>
                              <span className="text-sm text-muted-foreground">75%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Realizacja celów</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div className="w-4/5 h-2 bg-green-500 rounded-full"></div>
                              </div>
                              <span className="text-sm text-muted-foreground">80%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Współpraca z organizacjami</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div className="w-2/3 h-2 bg-purple-500 rounded-full"></div>
                              </div>
                              <span className="text-sm text-muted-foreground">67%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="certificates-section" className="mt-4">
                    {/* Zaświadczenia zostają przeniesione z oryginalnej sekcji */}
                    {pendingCertificates.length > 0 && (
                      <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <div>
                              <h4 className="text-yellow-800 mb-1">Oczekujące zaświadczenia</h4>
                              <p className="text-sm text-yellow-700">
                                {pendingCertificates.length} zaświadczenie{pendingCertificates.length > 1 ? 'ń' : ''} oczekuje na zatwierdzenie
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Pełna funkcjonalność zaświadczeń dostępna wkrótce</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="map-section" className="mt-4">
                    <MapView userType="koordynator" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>



          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="text-center mb-6">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xl">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <h2 className="mb-1">{currentUser.firstName} {currentUser.lastName}</h2>
              <p className="text-sm text-muted-foreground">Koordynator Wolontariatu</p>
              <p className="text-sm text-muted-foreground">{currentUser.schoolName}</p>
            </div>

            {/* Bio Section */}
            {currentUser.bio && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    O mnie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{currentUser.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Skills and Experience */}
            {((currentUser.skills?.length || 0) > 0 || (currentUser.achievements?.length || 0) > 0) && (
              <Card className="mb-4">
                <CardContent className="p-4 space-y-4">
                  {currentUser.skills?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Umiejętności
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {currentUser.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentUser.achievements?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Osiągnięcia
                      </h4>
                      <div className="space-y-2">
                        {currentUser.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <span>{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {currentUser.experience && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Doświadczenie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{currentUser.experience}</p>
                </CardContent>
              </Card>
            )}

            {/* Profile/Privacy Toggle */}
            <Card>
              <CardContent className="p-2">
                <Tabs defaultValue="profile-info">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile-info">Informacje</TabsTrigger>
                    <TabsTrigger value="privacy-settings">Prywatność</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile-info" className="mt-4 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <School className="h-5 w-5" />
                          Informacje o szkole
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nazwa:</span>
                            <span>{user.schoolName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{user.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rola:</span>
                            <span>Koordynator Wolontariatu</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <Button 
                          variant="outline" 
                          className="w-full mb-3"
                          onClick={() => setIsEditingProfile(true)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Edytuj profil
                        </Button>
                        <Button variant="outline" className="w-full" onClick={onLogout}>
                          <LogOut className="h-4 w-4 mr-2" />
                          Wyloguj się
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="privacy-settings" className="mt-4">
                    <PrivacySettings userType="koordynator" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
        <div className="max-w-sm mx-auto">
          <div className="grid grid-cols-5 h-16">
            <button
              onClick={() => setActiveTab("students")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "students" 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="h-4 w-4" />
              <span className="text-xs">Uczniowie</span>
            </button>
            
            <button
              onClick={() => setActiveTab("organizations")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "organizations" 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span className="text-xs">Organizacje</span>
            </button>
            
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "calendar" 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="text-xs">Kalendarz</span>
            </button>
            
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "reports" || activeTab === "certificates" || activeTab === "map"
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Zarządzanie</span>
            </button>
            
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "profile" || activeTab === "privacy"
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User className="h-4 w-4" />
              <span className="text-xs">Profil</span>
            </button>
          </div>
        </div>
      </div>
      
      <Chat userType={user.userType as "wolontariusz" | "koordynator" | "organizacja"} />

      {/* Offer Modal */}
      {showOfferModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{selectedOffer.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOfferModal(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${getUrgencyColor(selectedOffer.urgency)} border`}>
                    {selectedOffer.urgency === 'high' ? 'Pilne' : selectedOffer.urgency === 'medium' ? 'Średnie' : 'Niskie'}
                  </Badge>
                  <Badge variant="outline">
                    {selectedOffer.category}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Organizacja:</span>
                    <span>{selectedOffer.organization}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Data:</span>
                    <span>{new Date(selectedOffer.startDate).toLocaleDateString('pl-PL')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Lokalizacja:</span>
                    <span>{selectedOffer.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Uczestnicy:</span>
                    <span>{selectedOffer.currentParticipants}/{selectedOffer.maxParticipants}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Opis:</h4>
                  <p className="text-sm text-muted-foreground">{selectedOffer.description}</p>
                </div>
                
                {selectedOffer.requirements && selectedOffer.requirements.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Wymagania:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {selectedOffer.requirements.map((req: string, index: number) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedOffer.benefits && selectedOffer.benefits.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Korzyści:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {selectedOffer.benefits.map((benefit: string, index: number) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Kontakt:</span>
                  <span>{selectedOffer.contactEmail}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}