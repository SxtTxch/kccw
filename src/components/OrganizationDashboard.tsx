import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Calendar, 
  MessageCircle, 
  FileText, 
  User,
  Building2,
  Filter,
  Bell,
  LogOut,
  ChevronRight,
  CheckCircle,
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
  Award,
  TrendingUp,
  Calendar as CalendarIcon,
  Star,
  Plus,
  Edit,
  Trash2,
  X,
  Send,
  UserX,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Copy,
  ExternalLink,
  Target,
  DollarSign,
  Activity,
  Users2,
  ClipboardList,
  PieChart,
  BarChart,
  BookOpen,
  Heart,
  Handshake,
  Map,
  Shield
} from "lucide-react";
import { MapView } from "./MapView";
import { PrivacySettings } from "./PrivacySettings";
import { ChatButton, Chat } from "./Chat";
import { EditProfile } from "./EditProfile";
import { useChat } from "../contexts/ChatContext";
import { getOffersByOrganization, createOffer, getVolunteersFromOffers, getOfferApplications, updateApplicationStatus, deleteOffer } from "../firebase/firestore";
import logoVertical from "../assets/images/logos/Mlody_Krakow_LOGO_cmyk_pion.png";

interface User {
  id: number;
  email: string;
  userType: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  organizationType: string;
  krsNumber: string;
}

interface OrganizationDashboardProps {
  user: User;
  onLogout: () => void;
}

interface Offer {
  id: number;
  title: string;
  category: string;
  description: string;
  requirements: string[];
  location: string;
  startDate: string;
  endDate: string;
  duration: string;
  maxParticipants: number;
  appliedVolunteers: number;
  acceptedVolunteers: number;
  status: 'draft' | 'published' | 'in-progress' | 'completed' | 'cancelled';
  urgency: 'low' | 'medium' | 'high';
  createdDate: string;
}

interface Volunteer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  school: string;
  experience: string;
  skills: string[];
  availableHours: number;
  completedHours: number;
  rating: number;
  status: 'active' | 'pending' | 'inactive';
  joinDate: string;
  lastActivity: string;
  currentProjects: string[];
  completedProjects: number;
}

interface Application {
  id: number;
  offerId: number;
  offerTitle: string;
  volunteerId: number;
  volunteerName: string;
  volunteerEmail: string;
  appliedDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string;
  rating?: number;
  feedback?: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'activity' | 'training' | 'deadline';
  description: string;
  assignedVolunteers: string[];
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}


interface Review {
  id: number;
  volunteerId: number;
  volunteerName: string;
  projectTitle: string;
  rating: number;
  review: string;
  skills: string[];
  date: string;
  isPublic: boolean;
}

interface OrganizationMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
  isActive: boolean;
  permissions: string[];
  phone?: string;
}


const mockVolunteers: Volunteer[] = [
  {
    id: 1,
    firstName: "Anna",
    lastName: "Kowalska",
    email: "anna.kowalska@email.com",
    age: 17,
    school: "XV LO Warszawa",
    experience: "6 miesięcy",
    skills: ["Praca z dziećmi", "Języki obce", "Pierwsza pomoc"],
    availableHours: 8,
    completedHours: 45,
    rating: 4.8,
    status: 'active',
    joinDate: "2024-04-15",
    lastActivity: "2024-10-03",
    currentProjects: ["Opieka nad zwierzętami", "Zajęcia z dziećmi"],
    completedProjects: 3
  },
  {
    id: 2,
    firstName: "Piotr",
    lastName: "Nowak",
    email: "piotr.nowak@email.com",
    age: 19,
    school: "Politechnika Warszawska",
    experience: "1 rok",
    skills: ["Technologia", "Grafika", "Social media"],
    availableHours: 12,
    completedHours: 78,
    rating: 4.9,
    status: 'active',
    joinDate: "2024-01-10",
    lastActivity: "2024-10-04",
    currentProjects: ["Zajęcia komputerowe", "Pomoc w organizacji"],
    completedProjects: 5
  },
  {
    id: 3,
    firstName: "Maria",
    lastName: "Wiśniewska",
    email: "maria.wisniewska@email.com",
    age: 16,
    school: "Gimnazjum nr 5",
    experience: "Nowy wolontariusz",
    skills: ["Kreatywność", "Rysowanie", "Muzyka"],
    availableHours: 4,
    completedHours: 8,
    rating: 4.5,
    status: 'pending',
    joinDate: "2024-09-15",
    lastActivity: "2024-09-28",
    currentProjects: [],
    completedProjects: 0
  }
];

const mockApplications: Application[] = [
  {
    id: 1,
    offerId: 1,
    offerTitle: "Opieka nad zwierzętami w schronisku",
    volunteerId: 4,
    volunteerName: "Katarzyna Nowak",
    volunteerEmail: "katarzyna.nowak@email.com",
    appliedDate: "2024-10-05",
    status: 'pending',
    message: "Bardzo chciałabym pomóc zwierzętom. Mam doświadczenie w opiece nad psami."
  },
  {
    id: 2,
    offerId: 2,
    offerTitle: "Pakowanie paczek świątecznych",
    volunteerId: 5,
    volunteerName: "Jakub Kowalczyk",
    volunteerEmail: "jakub.kowalczyk@email.com",
    appliedDate: "2024-10-04",
    status: 'accepted',
    message: "Jestem dostępny w weekendy i chętnie pomogę w przygotowaniu paczek.",
    rating: 4.7
  },
  {
    id: 3,
    offerId: 1,
    offerTitle: "Opieka nad zwierzętami w schronisku",
    volunteerId: 6,
    volunteerName: "Aleksandra Zielińska",
    volunteerEmail: "aleksandra.zielinska@email.com",
    appliedDate: "2024-10-03",
    status: 'completed',
    message: "Uwielbiam zwierzęta i mam dużo czasu.",
    rating: 5.0,
    feedback: "Świetnie się sprawdziła, bardzo odpowiedzialna."
  }
];

const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Szkolenie nowych wolontariuszy",
    date: "2024-10-20",
    time: "10:00",
    type: "training",
    description: "Wprowadzenie dla nowych wolontariuszy",
    assignedVolunteers: ["Anna Kowalska", "Maria Wiśniewska"],
    location: "Biuro organizacji",
    status: 'scheduled'
  },
  {
    id: 2,
    title: "Akcja pakowania paczek",
    date: "2024-12-15",
    time: "09:00",
    type: "activity",
    description: "Start akcji pakowania paczek świątecznych",
    assignedVolunteers: ["Piotr Nowak", "Jakub Kowalczyk", "Anna Kowalska"],
    location: "Magazyn",
    status: 'scheduled'
  },
  {
    id: 3,
    title: "Spotkanie ewaluacyjne",
    date: "2024-11-30",
    time: "15:00",
    type: "meeting",
    description: "Podsumowanie miesięcznych działań",
    assignedVolunteers: ["Wszyscy aktywni wolontariusze"],
    location: "Online",
    status: 'scheduled'
  }
];


const mockReviews: Review[] = [
  {
    id: 1,
    volunteerId: 1,
    volunteerName: "Anna Kowalska",
    projectTitle: "Opieka nad zwierzętami",
    rating: 5,
    review: "Anna jest wyjątkowo odpowiedzialną i zaangażowaną wolontariuszką. Zwierzęta jej ufają, a jej praca jest zawsze wykonana na najwyższym poziomie.",
    skills: ["Odpowiedzialność", "Empatia", "Punktualność", "Praca z zwierzętami"],
    date: "2024-09-30",
    isPublic: true
  },
  {
    id: 2,
    volunteerId: 2,
    volunteerName: "Piotr Nowak",
    projectTitle: "Zajęcia komputerowe dla seniorów",
    rating: 5,
    review: "Piotr wykazał się ogromną cierpliwością i umiejętnościami dydaktycznymi. Seniorzy są nim zachwyceni.",
    skills: ["Dydaktyka", "Cierpliwość", "Komunikacja", "Technologia"],
    date: "2024-09-15",
    isPublic: true
  }
];

const mockOrganizationMembers: OrganizationMember[] = [
  {
    id: 1,
    firstName: "Jan",
    lastName: "Kowalski",
    email: "jan.kowalski@fundacja.pl",
    role: "Dyrektor",
    department: "Zarząd",
    joinDate: "2020-01-15",
    isActive: true,
    permissions: ["admin", "manage_offers", "manage_volunteers", "view_reports"],
    phone: "+48 123 456 789"
  },
  {
    id: 2,
    firstName: "Maria",
    lastName: "Nowak",
    email: "maria.nowak@fundacja.pl",
    role: "Koordynator wolontariatu",
    department: "Programy",
    joinDate: "2021-03-10",
    isActive: true,
    permissions: ["manage_volunteers", "view_reports"],
    phone: "+48 987 654 321"
  },
  {
    id: 3,
    firstName: "Piotr",
    lastName: "Wiśniewski",
    email: "piotr.wisniewski@fundacja.pl",
    role: "Specjalista ds. projektów",
    department: "Programy",
    joinDate: "2022-06-01",
    isActive: true,
    permissions: ["manage_offers", "view_reports"]
  }
];

export function OrganizationDashboard({ user, onLogout }: OrganizationDashboardProps) {
  const { openChat } = useChat();
  
  // Debug: Check if organization user has proper ID
  useEffect(() => {
    console.log('OrganizationDashboard - User ID:', user.id);
    console.log('OrganizationDashboard - User Type:', user.userType);
    console.log('OrganizationDashboard - localStorage currentUserId:', localStorage.getItem('currentUserId'));
  }, [user]);
  const [activeTab, setActiveTab] = useState("offers");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loadingVolunteers, setLoadingVolunteers] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loadingCalendarEvents, setLoadingCalendarEvents] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [showVolunteerProfile, setShowVolunteerProfile] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);
  const [reviews] = useState<Review[]>(mockReviews);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  // Map organization data from user prop to currentUser state
  useEffect(() => {
    if (user) {
      const mappedUser = {
        ...user,
        // Map organization fields from Firebase structure if needed
        organizationName: user.organizationName || user.organizationInfo?.organizationName || '',
        organizationType: user.organizationType || user.organizationInfo?.organizationType || '',
        krsNumber: user.krsNumber || user.organizationInfo?.krsNumber || '',
        bio: user.bio || user.organizationInfo?.description || '',
        skills: user.skills || [],
        achievements: user.achievements || [],
        website: user.website || ''
      };
      setCurrentUser(mappedUser);
    }
  }, [user]);

  // Fetch offers created by this organization
  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          setLoadingOffers(true);
          setLoadingVolunteers(true);
          
          // Fetch offers and volunteers in parallel
          const [organizationOffers, organizationVolunteers] = await Promise.all([
            getOffersByOrganization(user.id.toString()),
            getVolunteersFromOffers(user.id.toString())
          ]);
          
          setOffers(organizationOffers);
          setVolunteers(organizationVolunteers);
          console.log('Fetched organization offers:', organizationOffers);
          console.log('Fetched organization volunteers:', organizationVolunteers);
        } catch (error) {
          console.error('Error fetching organization data:', error);
        } finally {
          setLoadingOffers(false);
          setLoadingVolunteers(false);
        }
      }
    };

    fetchData();
  }, [user?.id]);

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

  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>(mockOrganizationMembers);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    department: "",
    phone: "",
    permissions: [] as string[]
  });
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'view' | 'edit' | 'applications'>('list');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [editOfferData, setEditOfferData] = useState<any>({});
  const [volunteerView, setVolunteerView] = useState<'list' | 'profile' | 'review'>('list');
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    recommendation: true
  });
  const [newOfferData, setNewOfferData] = useState({
    title: "",
    category: "",
    description: "",
    requirements: "",
    startDate: "",
    duration: "",
    maxParticipants: "",
    contactEmail: user.email,
    bountyAmount: "",
    hasBounty: false
  });

  // Helper functions
  const getOfferStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOfferStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Szkic';
      case 'published': return 'Opublikowana';
      case 'in-progress': return 'W trakcie';
      case 'completed': return 'Zakończona';
      case 'cancelled': return 'Anulowana';
      case 'active': return 'Aktywny';
      default: return status;
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

  const getVolunteerStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'dyrektor': return 'bg-purple-100 text-purple-800';
      case 'koordynator wolontariatu': return 'bg-blue-100 text-blue-800';
      case 'specjalista ds. projektów': return 'bg-green-100 text-green-800';
      case 'asystent': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const addMember = () => {
    if (newMember.firstName && newMember.lastName && newMember.email && newMember.role) {
      const member: OrganizationMember = {
        id: Date.now(),
        ...newMember,
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true
      };
      setOrganizationMembers(prev => [...prev, member]);
      setNewMember({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        department: "",
        phone: "",
        permissions: []
      });
      setIsAddingMember(false);
    }
  };

  const toggleMemberStatus = (memberId: number) => {
    setOrganizationMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, isActive: !member.isActive }
          : member
      )
    );
  };

  const removeMember = (memberId: number) => {
    setOrganizationMembers(prev => prev.filter(member => member.id !== memberId));
  };

  const handleCreateOffer = () => {
    setIsCreatingOffer(true);
  };

  const handleOfferInputChange = (field: string, value: string) => {
    setNewOfferData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const submitOffer = async () => {
    try {
      console.log("Creating new offer:", newOfferData);
      
      // Prepare offer data for Firebase
      const offerData = {
        title: newOfferData.title,
        description: newOfferData.description,
        organization: user.organizationName,
        organizationId: user.id.toString(),
        category: newOfferData.category,
        location: "Kraków",
        startDate: newOfferData.startDate,
        endDate: newOfferData.startDate,
        duration: newOfferData.duration,
        maxParticipants: parseInt(newOfferData.maxParticipants) || 0,
        requirements: newOfferData.requirements ? newOfferData.requirements.split(',').map(r => r.trim()) : [],
        benefits: [], // Can be added later
        contactEmail: newOfferData.contactEmail,
        status: 'active' as const,
        urgency: 'medium' as const,
        // Bounty system fields
        hasBounty: newOfferData.hasBounty,
        bountyAmount: newOfferData.hasBounty && newOfferData.bountyAmount ? parseInt(newOfferData.bountyAmount) : undefined
      };

      // Create offer in Firebase
      const offerId = await createOffer(offerData);
      
      if (offerId) {
        console.log("Offer created successfully with ID:", offerId);
        
        // Refresh offers list
        const organizationOffers = await getOffersByOrganization(user.id.toString());
        setOffers(organizationOffers);
        
        // Reset formularza
        setNewOfferData({
          title: "",
          category: "",
          description: "",
          requirements: "",
          startDate: "",
          duration: "",
          maxParticipants: "",
          contactEmail: user.email,
          bountyAmount: "",
          hasBounty: false
        });
        setIsCreatingOffer(false);
      } else {
        console.error("Failed to create offer");
      }
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const cancelCreateOffer = () => {
    setIsCreatingOffer(false);
    setNewOfferData({
      title: "",
      category: "",
      description: "",
      requirements: "",
      startDate: "",
      duration: "",
      maxParticipants: "",
      contactEmail: user.email,
      contactPhone: ""
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'activity': return 'bg-green-100 text-green-800 border-green-200';
      case 'training': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Offer view handlers
  const handleViewOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setCurrentView('view');
  };

  const handleEditOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setEditOfferData({
      title: offer.title,
      category: offer.category,
      description: offer.description,
      requirements: offer.requirements.join(', '),
      location: offer.location,
      startDate: offer.startDate,
      endDate: offer.endDate,
      duration: offer.duration || '',
      maxParticipants: offer.maxParticipants.toString(),
      contactEmail: user.email,
      contactPhone: ""
    });
    setCurrentView('edit');
  };

  const handleViewApplications = async (offer: Offer) => {
    setSelectedOffer(offer);
    setCurrentView('applications');
    setLoadingApplications(true);
    
    try {
      const offerApplications = await getOfferApplications(offer.id.toString());
      setApplications(offerApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleBackToOffers = () => {
    setCurrentView('list');
    setSelectedOffer(null);
    setEditOfferData({});
  };

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      const success = await updateApplicationStatus(applicationId, 'accepted');
      if (success) {
        // Refresh applications
        if (selectedOffer) {
          const updatedApplications = await getOfferApplications(selectedOffer.id);
          setApplications(updatedApplications);
        }
      }
    } catch (error) {
      console.error('Error accepting application:', error);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      console.log('Rejecting application:', applicationId);
      const success = await updateApplicationStatus(applicationId, 'rejected');
      console.log('Rejection result:', success);
      if (success) {
        // Refresh applications
        if (selectedOffer) {
          console.log('Refreshing applications for offer:', selectedOffer.id);
          const updatedApplications = await getOfferApplications(selectedOffer.id);
          console.log('Updated applications:', updatedApplications);
          setApplications(updatedApplications);
        }
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const handleDeleteOffer = async (offer: Offer) => {
    if (!deleteConfirmation || offerToDelete?.id !== offer.id) {
      // First click - show "Na pewno?" confirmation
      setOfferToDelete(offer);
      setDeleteConfirmation(true);
      return;
    }

    // Second click - actually delete
    try {
      const success = await deleteOffer(offer.id.toString());
      if (success) {
        // Refresh offers list
        const organizationOffers = await getOffersByOrganization(user.id.toString());
        setOffers(organizationOffers);
        setOfferToDelete(null);
        setDeleteConfirmation(false);
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  const cancelDeleteOffer = () => {
    setOfferToDelete(null);
    setDeleteConfirmation(false);
  };

  const handleViewVolunteerProfile = async (volunteerId: string) => {
    try {
      // Close the applications view
      setCurrentView('list');
      
      // Fetch volunteer data from Firebase
      const { doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');
      
      const userRef = doc(db, 'users', volunteerId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const volunteerData = { id: userSnap.id, ...userSnap.data() };
        
        // Use Firestore's volunteerHours field
        const totalHours = volunteerData.volunteerHours || 0;
        
        // Fetch all received opinions to calculate average rating
        let averageRating = 0;
        let receivedOpinionsCount = 0;
        try {
          const opinionsRef = collection(db, 'opinions');
          const opinionsQuery = query(opinionsRef, where('targetUserId', '==', volunteerId));
          const opinionsSnap = await getDocs(opinionsQuery);
          
          if (!opinionsSnap.empty) {
            let totalRating = 0;
            opinionsSnap.forEach((doc) => {
              const opinionData = doc.data();
              if (opinionData.rating) {
                totalRating += opinionData.rating;
                receivedOpinionsCount++;
              }
            });
            
            if (receivedOpinionsCount > 0) {
              averageRating = totalRating / receivedOpinionsCount;
            }
          }
        } catch (opinionsError) {
          console.error('Error fetching received opinions:', opinionsError);
        }
        
        // Update volunteer data with calculated values
        const updatedVolunteerData = {
          ...volunteerData,
          totalHours: totalHours,
          averageRating: averageRating > 0 ? averageRating.toFixed(1) : 'N/A',
          receivedOpinionsCount: receivedOpinionsCount
        };
        
        setSelectedVolunteer(updatedVolunteerData);
        setShowVolunteerProfile(true);
      }
    } catch (error) {
      console.error('Error fetching volunteer profile:', error);
    }
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
        type: 'offer',
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
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        type: event.type,
        description: event.description,
        location: event.location,
        attendees: event.attendees
      }));

    return [...upcomingOffers, ...upcomingCalendarEvents].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const handleEditOfferInputChange = (field: string, value: string) => {
    setEditOfferData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const submitEditOffer = async () => {
    try {
      console.log("Edytowana oferta:", editOfferData);
      
      if (!selectedOffer?.id) {
        console.error("No offer selected for editing");
        return;
      }

      // Update the offer in Firebase
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');
      
      const offerRef = doc(db, 'offers', selectedOffer.id);
      await updateDoc(offerRef, {
        title: editOfferData.title,
        category: editOfferData.category,
        description: editOfferData.description,
        requirements: editOfferData.requirements ? editOfferData.requirements.split(',').map(r => r.trim()) : [],
        startDate: editOfferData.startDate,
        endDate: editOfferData.startDate, // Same as startDate since we only have one date
        duration: editOfferData.duration,
        maxParticipants: parseInt(editOfferData.maxParticipants) || 0,
        contactEmail: editOfferData.contactEmail,
        updatedAt: new Date()
      });

      console.log("Offer updated successfully");
      
      // Refresh the offers list
      const organizationOffers = await getOffersByOrganization(user.id.toString());
      setOffers(organizationOffers);
      
      handleBackToOffers();
    } catch (error) {
      console.error("Error updating offer:", error);
    }
  };

  // Volunteer view handlers
  const handleViewTeamVolunteerProfile = (volunteer: any) => {
    setSelectedVolunteer(volunteer);
    setVolunteerView('profile');
  };

  const handleWriteVolunteerReview = (volunteer: any) => {
    setSelectedVolunteer(volunteer);
    setReviewData({
      rating: 5,
      comment: '',
      recommendation: true
    });
    setVolunteerView('review');
  };

  const handleBackToVolunteers = () => {
    setVolunteerView('list');
    setSelectedVolunteer(null);
    setReviewData({ rating: 5, comment: '', recommendation: true });
  };

  const handleReviewInputChange = (field: string, value: any) => {
    setReviewData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileSave = (updatedUser: any) => {
    // Map organization data from EditProfile structure to currentUser structure
    const updatedCurrentUser = {
      ...currentUser,
      ...updatedUser,
      // Ensure organization fields are properly mapped
      organizationName: updatedUser.organizationName || currentUser.organizationName,
      organizationType: updatedUser.organizationType || currentUser.organizationType,
      krsNumber: updatedUser.krsNumber || currentUser.krsNumber,
      bio: updatedUser.bio || currentUser.bio,
      skills: updatedUser.skills || currentUser.skills,
      achievements: updatedUser.achievements || currentUser.achievements,
      website: updatedUser.website || currentUser.website
    };
    
    setCurrentUser(updatedCurrentUser);
    setIsEditingProfile(false);
  };

  const submitVolunteerReview = () => {
    console.log("Nowa opinia dla wolontariusza:", selectedVolunteer?.firstName, selectedVolunteer?.lastName, reviewData);
    // Here you would normally save the review to backend
    handleBackToVolunteers();
  };

  // Filtered data
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || offer.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = `${volunteer.firstName} ${volunteer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         volunteer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         volunteer.offerTitle.toLowerCase().includes(searchQuery.toLowerCase());
    // For now, all volunteers are considered "active" since they're participating in offers
    const matchesFilter = selectedFilter === "all" || selectedFilter === "active";
    return matchesSearch && matchesFilter;
  });


  // Statistics
  const stats = {
    totalOffers: offers.length,
    activeOffers: offers.filter(o => o.status === 'published' || o.status === 'in-progress').length,
    totalVolunteers: volunteers.length,
    activeVolunteers: volunteers.filter(v => v.status === 'active').length,
    totalHours: volunteers.reduce((sum, v) => sum + v.completedHours, 0),
    averageRating: volunteers.reduce((sum, v) => sum + v.rating, 0) / volunteers.length
  };

  // Show create offer form if creating
  if (isCreatingOffer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header with Back Button */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center max-w-sm mx-auto">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={cancelCreateOffer}
              className="mr-3 p-2"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <div className="flex-1 text-center">
              <h1>Nowa oferta wolontariatu</h1>
            </div>
          </div>
        </div>

        {/* Create Offer Form */}
        <div className="max-w-sm mx-auto p-4 pb-24">
          <Card>
            <CardHeader>
              <CardTitle>Podstawowe informacje</CardTitle>
              <CardDescription>Wypełnij dane nowej oferty wolontariackie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tytuł oferty *</Label>
                <Input
                  id="title"
                  placeholder="np. Pomoc w schronisku dla zwierząt"
                  value={newOfferData.title}
                  onChange={(e) => handleOfferInputChange("title", e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategoria *</Label>
                <Select value={newOfferData.category} onValueChange={(value) => handleOfferInputChange("category", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pomoc społeczna">Pomoc społeczna</SelectItem>
                    <SelectItem value="Opieka nad zwierzętami">Opieka nad zwierzętami</SelectItem>
                    <SelectItem value="Edukacja">Edukacja</SelectItem>
                    <SelectItem value="Ekologia">Ekologia</SelectItem>
                    <SelectItem value="Kultura">Kultura</SelectItem>
                    <SelectItem value="Sport">Sport</SelectItem>
                    <SelectItem value="Zdrowie">Zdrowie</SelectItem>
                    <SelectItem value="Praca z dziećmi">Praca z dziećmi</SelectItem>
                    <SelectItem value="Inne">Inne</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Opis oferty *</Label>
                <Textarea
                  id="description"
                  placeholder="Opisz szczegółowo czym będzie się zajmować wolontariusz..."
                  value={newOfferData.description}
                  onChange={(e) => handleOfferInputChange("description", e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Wymagania</Label>
                <Textarea
                  id="requirements"
                  placeholder="Lista wymagań (oddziel przecinkami)"
                  value={newOfferData.requirements}
                  onChange={(e) => handleOfferInputChange("requirements", e.target.value)}
                  className="min-h-[60px]"
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="eventDate">Data wydarzenia *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={newOfferData.startDate}
                  onChange={(e) => handleOfferInputChange("startDate", e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="duration">Czas trwania</Label>
                  <Input
                    id="duration"
                    placeholder="np. 3-4 godziny"
                    value={newOfferData.duration}
                    onChange={(e) => handleOfferInputChange("duration", e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxVolunteers">Liczba wolontariuszy</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    placeholder="np. 10"
                    value={newOfferData.maxParticipants}
                    onChange={(e) => handleOfferInputChange("maxParticipants", e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email kontaktowy</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="kontakt@organizacja.pl"
                  value={newOfferData.contactEmail}
                  onChange={(e) => handleOfferInputChange("contactEmail", e.target.value)}
                  className="h-12"
                />
              </div>


              {/* Bounty System Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">System Nagród</h3>
                  <p className="text-sm text-gray-600">Zachęć wolontariuszy nagrodą pieniężną</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="hasBounty"
                      checked={newOfferData.hasBounty}
                      onChange={(e) => handleOfferInputChange("hasBounty", e.target.checked)}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                    />
                    <Label htmlFor="hasBounty" className="text-gray-700 font-medium cursor-pointer">
                      Dodaj nagrodę pieniężną dla wolontariuszy
                    </Label>
                  </div>

                  {newOfferData.hasBounty && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="bountyAmount" className="text-gray-700 font-medium">
                          Kwota nagrody (PLN) *
                        </Label>
                        <Input
                          id="bountyAmount"
                          type="number"
                          placeholder="np. 100"
                          value={newOfferData.bountyAmount}
                          onChange={(e) => handleOfferInputChange("bountyAmount", e.target.value)}
                          className="h-12 text-lg font-semibold"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Nagroda zostanie wypłacona po ukończeniu oferty przez wolontariusza.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={cancelCreateOffer}
                  variant="outline"
                  className="flex-1"
                >
                  Anuluj
                </Button>
                <Button
                  onClick={submitOffer}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
                  disabled={!newOfferData.title || !newOfferData.category || !newOfferData.description || !newOfferData.startDate || !newOfferData.maxParticipants || parseInt(newOfferData.maxParticipants) <= 0 || (newOfferData.hasBounty && !newOfferData.bountyAmount)}
                >
                  Utwórz ofertę
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show offer details view
  if (currentView === 'view' && selectedOffer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header with Back Button */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center max-w-sm mx-auto">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackToOffers}
              className="mr-3 p-2"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <div className="flex-1 text-center">
              <h1>Szczegóły oferty</h1>
            </div>
          </div>
        </div>

        {/* Offer Details */}
        <div className="max-w-sm mx-auto p-4 pb-24">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex justify-between items-start mb-3">
                <CardTitle className="text-xl">{selectedOffer.title}</CardTitle>
                <div className="flex flex-col items-end gap-3">
                  <Badge className={`${getOfferStatusColor(selectedOffer.status)} ${selectedOffer.status === 'active' ? 'ml-2' : ''}`}>
                    {getOfferStatusLabel(selectedOffer.status)}
                  </Badge>
                  <Badge className={`${getUrgencyColor(selectedOffer.urgency)} border text-xs`}>
                    {selectedOffer.urgency === 'high' ? 'Pilne' : selectedOffer.urgency === 'medium' ? 'Średnie' : 'Niskie'}
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-lg">{selectedOffer.category}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2">Opis</h3>
                <p className="text-muted-foreground">{selectedOffer.description}</p>
              </div>

              {selectedOffer.requirements.length > 0 && (
                <div>
                  <h3 className="mb-2">Wymagania</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {selectedOffer.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedOffer.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedOffer.duration || 'Nie określono'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(selectedOffer.startDate).toLocaleDateString('pl-PL')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedOffer.currentParticipants}/{selectedOffer.maxParticipants}</span>
                </div>
              </div>


              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleEditOffer(selectedOffer)}
                  variant="outline"
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj
                </Button>
                <Button
                  onClick={() => handleViewApplications(selectedOffer)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Zgłoszenia
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show edit offer form
  if (currentView === 'edit' && selectedOffer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header with Back Button */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center max-w-sm mx-auto">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackToOffers}
              className="mr-3 p-2"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <div className="flex-1 text-center">
              <h1>Edytuj ofertę</h1>
            </div>
          </div>
        </div>

        {/* Edit Offer Form */}
        <div className="max-w-sm mx-auto p-4 pb-24">
          <Card>
            <CardHeader>
              <CardTitle>Edycja oferty</CardTitle>
              <CardDescription>Zmień dane oferty wolontariackie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTitle">Tytuł oferty *</Label>
                <Input
                  id="editTitle"
                  placeholder="np. Pomoc w schronisku dla zwierząt"
                  value={editOfferData.title || ''}
                  onChange={(e) => handleEditOfferInputChange("title", e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editCategory">Kategoria *</Label>
                <Select value={editOfferData.category || ''} onValueChange={(value) => handleEditOfferInputChange("category", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pomoc-spoleczna">Pomoc społeczna</SelectItem>
                    <SelectItem value="opieka-nad-zwierzetami">Opieka nad zwierzętami</SelectItem>
                    <SelectItem value="edukacja">Edukacja</SelectItem>
                    <SelectItem value="ochrona-srodowiska">Ochrona środowiska</SelectItem>
                    <SelectItem value="kultura-sztuka">Kultura i sztuka</SelectItem>
                    <SelectItem value="sport-rekreacja">Sport i rekreacja</SelectItem>
                    <SelectItem value="pomoc-medyczna">Pomoc medyczna</SelectItem>
                    <SelectItem value="inne">Inne</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDescription">Opis oferty *</Label>
                <Textarea
                  id="editDescription"
                  placeholder="Opisz szczegółowo czym będzie się zajmować wolontariusz..."
                  value={editOfferData.description || ''}
                  onChange={(e) => handleEditOfferInputChange("description", e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editRequirements">Wymagania</Label>
                <Textarea
                  id="editRequirements"
                  placeholder="Lista wymagań (oddziel przecinkami)"
                  value={editOfferData.requirements || ''}
                  onChange={(e) => handleEditOfferInputChange("requirements", e.target.value)}
                  className="min-h-[60px]"
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="editEventDate">Data wydarzenia *</Label>
                <Input
                  id="editEventDate"
                  type="date"
                  value={editOfferData.startDate || ''}
                  onChange={(e) => handleEditOfferInputChange("startDate", e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="editDuration">Czas trwania</Label>
                  <Input
                    id="editDuration"
                    placeholder="np. 3-4 godziny"
                    value={editOfferData.duration || ''}
                    onChange={(e) => handleEditOfferInputChange("duration", e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editMaxVolunteers">Liczba wolontariuszy</Label>
                  <Input
                    id="editMaxVolunteers"
                    type="number"
                    placeholder="np. 10"
                    value={editOfferData.maxParticipants || ''}
                    onChange={(e) => handleEditOfferInputChange("maxParticipants", e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleBackToOffers}
                  variant="outline"
                  className="flex-1"
                >
                  Anuluj
                </Button>
                <Button
                  onClick={submitEditOffer}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
                >
                  Zapisz zmiany
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show applications view
  if (currentView === 'applications' && selectedOffer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header with Back Button */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center max-w-sm mx-auto">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackToOffers}
              className="mr-3 p-2"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <div className="flex-1 text-center">
              <h1>Zgłoszenia</h1>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="max-w-sm mx-auto p-4 pb-24">
          <div className="text-center mb-6">
            <h2 className="mb-2">{selectedOffer.title}</h2>
            <p className="text-sm text-muted-foreground">{applications.length} zgłoszeń</p>
          </div>

          {loadingApplications ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map(application => (
                <Card key={application.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{application.volunteer.firstName} {application.volunteer.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{application.volunteer.email}</p>
                      </div>
                      <Badge className={`${getApplicationStatusColor(application.status)}`}>
                        {application.status === 'pending' ? 'Oczekuje' : 
                         application.status === 'accepted' ? 'Zaakceptowany' :
                         application.status === 'rejected' ? 'Odrzucony' : 'Zakończony'}
                      </Badge>
                    </div>
                    
                    {application.message && (
                      <p className="text-sm mb-3">{application.message}</p>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                      <span>Zgłoszono: {new Date(application.appliedAt.seconds * 1000).toLocaleDateString('pl-PL')}</span>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleViewVolunteerProfile(application.volunteerId)}
                      >
                        <User className="h-3 w-3 mr-1" />
                        Zobacz profil
                      </Button>
                    </div>

                    {application.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleAcceptApplication(application.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Akceptuj
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleRejectApplication(application.id)}
                        >
                          <UserX className="h-3 w-3 mr-1" />
                          Odrzuć
                        </Button>
                      </div>
                    )}

                    {application.reviewMessage && (
                      <div className="mt-3 p-2 bg-gray-50 rounded">
                        <p className="text-xs text-muted-foreground">Uwagi:</p>
                        <p className="text-sm">{application.reviewMessage}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Brak zgłoszeń do tej oferty</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Show volunteer profile view
  if (volunteerView === 'profile' && selectedVolunteer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header with Back Button */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center max-w-sm mx-auto">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackToVolunteers}
              className="mr-3 p-2"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <div className="flex-1 text-center">
              <h1>Profil wolontariusza</h1>
            </div>
          </div>
        </div>

        {/* Volunteer Profile */}
        <div className="max-w-sm mx-auto p-4 pb-24">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarFallback className="bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xl">
                  {selectedVolunteer.firstName?.charAt(0)}{selectedVolunteer.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{selectedVolunteer.firstName} {selectedVolunteer.lastName}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Badge className={`${getVolunteerStatusColor(selectedVolunteer.status)}`}>
                  {selectedVolunteer.status === 'active' ? 'Aktywny' : 
                   selectedVolunteer.status === 'inactive' ? 'Nieaktywny' : 'Zawieszony'}
                </Badge>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Email:</p>
                  <p className="break-all">{selectedVolunteer.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Telefon:</p>
                  <p className="break-words">{selectedVolunteer.phone || 'Brak'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Wiek:</p>
                  <p>{selectedVolunteer.age} lat</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Lokalizacja:</p>
                  <p className="break-words">{selectedVolunteer.location}</p>
                </div>
              </div>

              {selectedVolunteer.bio && (
                <div>
                  <p className="text-muted-foreground mb-2">O mnie:</p>
                  <p className="text-sm">{selectedVolunteer.bio}</p>
                </div>
              )}

              <div>
                <p className="text-muted-foreground mb-2">Zainteresowania:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedVolunteer.interests?.map((interest: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  )) || <span className="text-sm text-muted-foreground">Brak podanych zainteresowań</span>}
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-muted-foreground mb-2">Statystyki:</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Ukończone zadania:</span>
                    <div className="font-medium text-green-600">{selectedVolunteer.completedTasks || 0}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Przepracowane godziny:</span>
                    <div className="font-medium">{selectedVolunteer.hoursWorked || 0}h</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Średnia ocena:</span>
                    <div className="font-medium flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {selectedVolunteer.averageRating || 'Brak'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dołączył:</span>
                    <div className="font-medium">{new Date(selectedVolunteer.joinDate).toLocaleDateString('pl-PL')}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleWriteVolunteerReview(selectedVolunteer)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Napisz opinię
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show volunteer review form
  if (volunteerView === 'review' && selectedVolunteer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header with Back Button */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center max-w-sm mx-auto">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackToVolunteers}
              className="mr-3 p-2"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <div className="flex-1 text-center">
              <h1>Oceń wolontariusza</h1>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="max-w-sm mx-auto p-4 pb-24">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-16 h-16 mx-auto mb-3">
                <AvatarFallback className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
                  {selectedVolunteer.firstName?.charAt(0)}{selectedVolunteer.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">{selectedVolunteer.firstName} {selectedVolunteer.lastName}</CardTitle>
              <CardDescription>Napisz opinię o pracy wolontariusza</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Ocena ogólna *</Label>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleReviewInputChange('rating', star)}
                      className="p-1"
                    >
                      <Star 
                        className={`h-8 w-8 ${
                          star <= reviewData.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {reviewData.rating === 1 ? 'Bardzo słabo' :
                   reviewData.rating === 2 ? 'Słabo' :
                   reviewData.rating === 3 ? 'Średnio' :
                   reviewData.rating === 4 ? 'Dobrze' : 'Bardzo dobrze'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Komentarz *</Label>
                <Textarea
                  id="comment"
                  placeholder="Opisz jak pracował wolontariusz, co robiło wrażenie, nad czym mógłby popracować..."
                  value={reviewData.comment}
                  onChange={(e) => handleReviewInputChange('comment', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommendation"
                  checked={reviewData.recommendation}
                  onCheckedChange={(checked) => handleReviewInputChange('recommendation', checked)}
                />
                <Label htmlFor="recommendation" className="text-sm">
                  Polecam tego wolontariusza innym organizacjom
                </Label>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Award className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 mb-1">Wskazówka</p>
                    <p className="text-blue-700">
                      Szczera i konstruktywna opinia pomoże wolontariuszowi się rozwijać oraz innym organizacjom w podejmowaniu decyzji.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleBackToVolunteers}
                  variant="outline"
                  className="flex-1"
                >
                  Anuluj
                </Button>
                <Button
                  onClick={submitVolunteerReview}
                  disabled={!reviewData.comment.trim()}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
                >
                  Wyślij opinię
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show edit profile form
  if (isEditingProfile) {
    return (
      <EditProfile 
        user={currentUser}
        onSave={handleProfileSave}
        onCancel={() => setIsEditingProfile(false)}
      />
    );
  }

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
              <p className="text-sm text-muted-foreground">{user.organizationName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('OrganizationDashboard - Chat button clicked');
                console.log('OrganizationDashboard - User ID:', user.id);
                console.log('OrganizationDashboard - User Type:', user.userType);
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

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-4">
            {currentView === 'list' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="mb-2">Zarządzanie ofertami</h2>
                  <p className="text-sm text-muted-foreground">Twoje oferty wolontariackie</p>
                </div>

            {/* Quick Stats */}
            <div className="mb-4">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-semibold text-green-600">{stats.activeOffers}</div>
                  <div className="text-xs text-muted-foreground">Aktywne oferty</div>
                </CardContent>
              </Card>
            </div>

            {/* Add New Offer Button */}
            <Button 
              onClick={handleCreateOffer}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Dodaj nową ofertę
            </Button>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj ofert..."
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
                    <SelectItem value="published">Opublikowane</SelectItem>
                    <SelectItem value="in-progress">W trakcie</SelectItem>
                    <SelectItem value="draft">Szkice</SelectItem>
                    <SelectItem value="completed">Zakończone</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Offers List */}
            {loadingOffers ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Ładowanie ofert...</p>
                </CardContent>
              </Card>
            ) : filteredOffers.length > 0 ? (
              filteredOffers.map(offer => (
                <Card key={offer.id} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{offer.title}</CardTitle>
                        <CardDescription className="mb-2">{offer.category}</CardDescription>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {offer.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {offer.duration || 'Nie określono'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(offer.startDate).toLocaleDateString('pl-PL')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {offer.currentParticipants}/{offer.maxParticipants}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Badge className={`${getOfferStatusColor(offer.status)} ${offer.status === 'active' ? 'ml-2' : ''}`}>
                        {getOfferStatusLabel(offer.status)}
                      </Badge>
                      <Badge className={`${getUrgencyColor(offer.urgency)} border text-xs`}>
                        {offer.urgency === 'high' ? 'Pilne' : offer.urgency === 'medium' ? 'Średnie' : 'Niskie'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-2">
                    <div className="mb-3">
                      {offer.hasBounty && offer.bountyAmount && (
                        <div className="mb-2">
                          <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-md border font-medium">
                            💰 Bounty: {offer.bountyAmount} PLN
                          </span>
                        </div>
                      )}
                      <p className="text-sm mb-3">{offer.description}</p>
                    </div>
                    
                    
                    <div className="flex gap-1 flex-wrap">
                      <Button 
                        onClick={() => handleViewOffer(offer)}
                        variant="outline" 
                        size="sm" 
                        className="px-1 py-1 h-7 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Pogl.
                      </Button>
                      <Button 
                        onClick={() => handleEditOffer(offer)}
                        variant="outline" 
                        size="sm" 
                        className="px-1 py-1 h-7 text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edytuj
                      </Button>
                      <Button 
                        onClick={() => handleViewApplications(offer)}
                        variant="outline" 
                        size="sm" 
                        className="px-1 py-1 h-7 text-xs"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        Zgłosz.
                      </Button>
                      {deleteConfirmation && offerToDelete?.id === offer.id ? (
                        <div className="flex gap-1">
                          <Button 
                            onClick={() => handleDeleteOffer(offer)}
                            variant="outline" 
                            size="sm" 
                            className="px-1 py-1 h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Na pewno?
                          </Button>
                          <Button 
                            onClick={cancelDeleteOffer}
                            variant="outline" 
                            size="sm" 
                            className="px-1 py-1 h-7 text-xs text-gray-600 border-gray-200 hover:bg-gray-50"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Anuluj
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleDeleteOffer(offer)}
                          variant="outline" 
                          size="sm" 
                          className="px-1 py-1 h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Usuń
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nie znaleziono ofert</p>
                </CardContent>
              </Card>
            )}
              </>
            )}
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers" className="space-y-4">
            {volunteerView === 'list' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="mb-2">Wolontariusze</h2>
                  <p className="text-sm text-muted-foreground">Zarządzanie zespołem wolontariuszy</p>
                </div>


            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj wolontariuszy..."
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

            {/* Volunteers List */}
            {loadingVolunteers ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            ) : filteredVolunteers.length > 0 ? (
              filteredVolunteers.map(volunteer => (
                <Card key={volunteer.id} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">
                          {volunteer.firstName} {volunteer.lastName}
                        </CardTitle>
                        <CardDescription className="mb-2">{volunteer.school}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-green-100 text-green-800">
                          Aktywny
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-muted-foreground">{volunteer.averageRating || 'Brak ocen'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Project/Offer Information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Projekt/Oferta</span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-blue-900 mb-1">{volunteer.offerTitle}</div>
                        <div className="text-blue-700">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            {volunteer.offerCategory}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {volunteer.age} lat
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {volunteer.totalHours || 0}h przepracowane
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {volunteer.totalProjects || 0} projektów
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {volunteer.activeProjects || 0} aktywne
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">{volunteer.email}</span>
                      </div>
                      
                      {volunteer.skills && volunteer.skills.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm text-muted-foreground mb-1">Umiejętności:</p>
                          <div className="flex flex-wrap gap-1">
                            {volunteer.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        <span>Doświadczenie: {volunteer.experience}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <ChatButton 
                        contact={{
                          id: volunteer.id + 3000,
                          name: `${volunteer.firstName} ${volunteer.lastName}`,
                          role: "Wolontariusz",
                          organization: volunteer.school,
                          isOnline: volunteer.status === 'active',
                          lastSeen: volunteer.status !== 'active' ? "3 godz. temu" : undefined
                        }}
                        userType="organizacja"
                        variant="inline"
                        className="text-sm flex-1"
                      />
                      <Button 
                        onClick={() => handleViewTeamVolunteerProfile(volunteer)}
                        variant="outline" 
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Profil
                      </Button>
                      <Button 
                        onClick={() => handleWriteVolunteerReview(volunteer)}
                        variant="outline" 
                        size="sm"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Opinia
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Brak wolontariuszy</h3>
                  <p className="text-muted-foreground mb-4">
                    Nie ma jeszcze wolontariuszy uczestniczących w Twoich ofertach.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Utwórz oferty, aby przyciągnąć wolontariuszy do współpracy.
                  </p>
                </CardContent>
              </Card>
            )}
              </>
            )}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="mb-2">Kalendarz i zadania</h2>
              <p className="text-sm text-muted-foreground">Planowanie działań wolontariackich</p>
            </div>



            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-green-600" />
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
                          {event.type === 'offer' && event.participants !== undefined && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {event.participants}/{event.maxParticipants} osób
                            </span>
                          )}
                        </div>
                        {event.type === 'offer' && event.organization && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium">Organizacja:</span> {event.organization}
                          </div>
                        )}
                        {event.type !== 'offer' && event.attendees && event.attendees.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium">Uczestnicy:</span> {event.attendees.join(', ')}
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
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border w-full"
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
                          setCurrentView('view');
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
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="reports-section">Raporty</TabsTrigger>
                    <TabsTrigger value="members-section">Członkowie</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid w-full grid-cols-1 mt-1">
                    <TabsTrigger value="map-section">Mapa</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="reports-section" className="mt-4 space-y-4">

            {/* Statistics Overview */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-semibold text-green-600">{stats.totalVolunteers}</div>
                  <div className="text-xs text-muted-foreground">Wolontariusze</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-semibold text-blue-600">{stats.totalHours}</div>
                  <div className="text-xs text-muted-foreground">Łączne godziny</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-semibold text-purple-600">{stats.averageRating.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Średnia ocena</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-semibold text-orange-600">{stats.totalOffers}</div>
                  <div className="text-xs text-muted-foreground">Oferty</div>
                </CardContent>
              </Card>
            </div>

            {/* Reports Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Generowanie raportów
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Raport miesięczny
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Raport wolontariuszy
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Statystyki projektów
                </Button>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Najnowsze opinie
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-3">
                    {reviews.slice(0, 2).map(review => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm">{review.volunteerName}</h4>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs">{review.rating}/5</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{review.projectTitle}</p>
                        <p className="text-sm mb-2">{review.review}</p>
                        <div className="flex flex-wrap gap-1">
                          {review.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Brak opinii</p>
                  </div>
                )}
              </CardContent>
            </Card>
                  </TabsContent>
                  
                  <TabsContent value="members-section" className="mt-4 space-y-4">
                    {/* Members Management */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg">Członkowie organizacji</h3>
                        <p className="text-sm text-muted-foreground">Zarządzaj zespołem organizacji</p>
                      </div>
                    </div>

                    {/* Add Member Button */}
                    <Card>
                      <CardContent className="p-4">
                        <Button 
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
                          onClick={() => setIsAddingMember(true)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Dodaj członka
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Add Member Form */}
                    {isAddingMember && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Dodaj nowego członka
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="memberFirstName">Imię *</Label>
                              <Input
                                id="memberFirstName"
                                value={newMember.firstName}
                                onChange={(e) => setNewMember(prev => ({...prev, firstName: e.target.value}))}
                                placeholder="Imię"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="memberLastName">Nazwisko *</Label>
                              <Input
                                id="memberLastName"
                                value={newMember.lastName}
                                onChange={(e) => setNewMember(prev => ({...prev, lastName: e.target.value}))}
                                placeholder="Nazwisko"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="memberEmail">Email *</Label>
                            <Input
                              id="memberEmail"
                              type="email"
                              value={newMember.email}
                              onChange={(e) => setNewMember(prev => ({...prev, email: e.target.value}))}
                              placeholder="email@organizacja.pl"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="memberRole">Stanowisko *</Label>
                            <Select 
                              value={newMember.role} 
                              onValueChange={(value) => setNewMember(prev => ({...prev, role: value}))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz stanowisko" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Dyrektor">Dyrektor</SelectItem>
                                <SelectItem value="Koordynator wolontariatu">Koordynator wolontariatu</SelectItem>
                                <SelectItem value="Specjalista ds. projektów">Specjalista ds. projektów</SelectItem>
                                <SelectItem value="Asystent">Asystent</SelectItem>
                                <SelectItem value="Księgowy">Księgowy</SelectItem>
                                <SelectItem value="Sekretarz">Sekretarz</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="memberDepartment">Dział</Label>
                            <Select 
                              value={newMember.department} 
                              onValueChange={(value) => setNewMember(prev => ({...prev, department: value}))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz dział" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Zarząd">Zarząd</SelectItem>
                                <SelectItem value="Programy">Programy</SelectItem>
                                <SelectItem value="Administracja">Administracja</SelectItem>
                                <SelectItem value="Finanse">Finanse</SelectItem>
                                <SelectItem value="PR i Marketing">PR i Marketing</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="memberPhone">Telefon</Label>
                            <Input
                              id="memberPhone"
                              type="tel"
                              value={newMember.phone}
                              onChange={(e) => setNewMember(prev => ({...prev, phone: e.target.value}))}
                              placeholder="+48 123 456 789"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              onClick={addMember}
                              className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
                              disabled={!newMember.firstName || !newMember.lastName || !newMember.email || !newMember.role}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Dodaj członka
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setIsAddingMember(false)}
                            >
                              Anuluj
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Members List */}
                    <div className="space-y-3">
                      {organizationMembers.map(member => (
                        <Card key={member.id} className={`border-l-4 ${member.isActive ? 'border-l-green-500' : 'border-l-gray-400'}`}>
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="text-lg mb-1">
                                  {member.firstName} {member.lastName}
                                </CardTitle>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={`${getRoleColor(member.role)} text-xs`}>
                                    {member.role.length > 12 
                                      ? member.role.split(' ')[0] + (member.role.includes('Koordynator') ? ' koord.' : member.role.includes('Specjalista') ? ' spec.' : '')
                                      : member.role
                                    }
                                  </Badge>
                                </div>
                                <CardDescription>{member.email}</CardDescription>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge variant={member.isActive ? "default" : "secondary"} className="text-xs">
                                  {member.isActive ? "Aktywny" : "Nieaktywny"}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {member.department || "Brak działu"}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(member.joinDate).toLocaleDateString('pl-PL')}
                              </div>
                              {member.phone && (
                                <div className="flex items-center gap-1 col-span-2">
                                  <Phone className="h-4 w-4" />
                                  {member.phone}
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            {member.permissions && member.permissions.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs text-muted-foreground mb-2">Uprawnienia:</p>
                                <div className="flex flex-wrap gap-1">
                                  {member.permissions.map((permission, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {permission}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => toggleMemberStatus(member.id)}
                              >
                                {member.isActive ? (
                                  <>
                                    <UserX className="h-4 w-4 mr-2" />
                                    Dezaktywuj
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Aktywuj
                                  </>
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => removeMember(member.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Usuń
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {organizationMembers.length === 0 && (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">Brak członków organizacji</p>
                          <Button 
                            variant="outline"
                            onClick={() => setIsAddingMember(true)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Dodaj pierwszego członka
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  
                  <TabsContent value="map-section" className="mt-4">
                    <MapView userType="organizacja" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="text-center mb-6">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarFallback className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xl">
                  {currentUser.organizationName[0]}{currentUser.organizationName[1] || ''}
                </AvatarFallback>
              </Avatar>
              <h2 className="mb-1">{currentUser.organizationName}</h2>
              <p className="text-sm text-muted-foreground">{currentUser.organizationType}</p>
              <p className="text-sm text-muted-foreground">KRS: {currentUser.krsNumber}</p>
              {currentUser.website && (
                <p className="text-sm text-blue-600 hover:underline cursor-pointer">
                  {currentUser.website}
                </p>
              )}
            </div>

            {/* Organization Description */}
            {currentUser.bio && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    O organizacji
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{currentUser.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Areas of Activity and Achievements */}
            {((currentUser.skills?.length || 0) > 0 || (currentUser.achievements?.length || 0) > 0) && (
              <Card className="mb-4">
                <CardContent className="p-4 space-y-4">
                  {currentUser.skills?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Obszary działania
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
                        Osiągnięcia organizacji
                      </h4>
                      <div className="space-y-2">
                        {currentUser.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                          <Building2 className="h-5 w-5" />
                          Informacje organizacji
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nazwa:</span>
                            <span>{user.organizationName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Typ:</span>
                            <span>{user.organizationType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">KRS:</span>
                            <span>{user.krsNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{user.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Kontakt:</span>
                            <span>{user.firstName} {user.lastName}</span>
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
                    <PrivacySettings userType="organizacja" />
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
              onClick={() => setActiveTab("offers")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "offers" 
                  ? "text-green-600 bg-green-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              <span className="text-xs">Oferty</span>
            </button>
            
            <button
              onClick={() => setActiveTab("volunteers")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "volunteers" 
                  ? "text-green-600 bg-green-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="h-4 w-4" />
              <span className="text-xs">Zespół</span>
            </button>
            
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "calendar" 
                  ? "text-green-600 bg-green-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="text-xs">Kalendarz</span>
            </button>
            
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "reports" || activeTab === "map"
                  ? "text-green-600 bg-green-50" 
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
                  ? "text-green-600 bg-green-50" 
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

      {/* Volunteer Profile Modal */}
      {showVolunteerProfile && selectedVolunteer && (
        <div className="fixed inset-0 z-[99999999999] flex items-center justify-center" onClick={() => setShowVolunteerProfile(false)}>
          <div className="bg-white rounded-lg shadow-2xl border-2 border-gray-200 w-80 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">Profil wolontariusza</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVolunteerProfile(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {/* Basic Info */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-pink-100 text-pink-600 text-xs">
                      {selectedVolunteer.firstName?.[0]}{selectedVolunteer.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-sm font-semibold">
                      {selectedVolunteer.firstName} {selectedVolunteer.lastName}
                    </h4>
                    <p className="text-xs text-muted-foreground">{selectedVolunteer.email}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div className="p-1 bg-blue-50 rounded">
                    <div className="text-sm font-bold text-blue-600">
                      {selectedVolunteer.totalProjects || 0}
                    </div>
                    <div className="text-xs text-blue-600">Proj.</div>
                  </div>
                  <div className="p-1 bg-green-50 rounded">
                    <div className="text-sm font-bold text-green-600">
                      {selectedVolunteer.totalHours || 0}
                    </div>
                    <div className="text-xs text-green-600">Godz.</div>
                  </div>
                  <div className="p-1 bg-purple-50 rounded">
                    <div className="text-sm font-bold text-purple-600">
                      {selectedVolunteer.averageRating || 'N/A'}
                    </div>
                    <div className="text-xs text-purple-600">Ocena</div>
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <h5 className="text-xs font-semibold mb-1">Odznaki</h5>
                  <div className="grid grid-cols-6 gap-1">
                    {(() => {
                      // Define all badges with proper icons, colors, and names
                      const allBadges = [
                        { key: 'witaj', name: 'Witaj!', icon: '👋', color: 'from-green-500 to-green-600', earned: selectedVolunteer.badges?.witaj?.earned || selectedVolunteer.badges?.witaj?.isUnlocked || false },
                        { key: 'pierwszyKrok', name: 'Pierwszy Krok', icon: '🎯', color: 'from-blue-500 to-blue-600', earned: (selectedVolunteer.totalHours || 0) >= 1 },
                        { key: 'zaangazowany', name: 'Zaangażowany', icon: '💪', color: 'from-pink-500 to-pink-600', earned: (selectedVolunteer.totalHours || 0) >= 10 },
                        { key: 'wytrwaly', name: 'Wytrwały', icon: '🏅', color: 'from-purple-500 to-purple-600', earned: (selectedVolunteer.totalHours || 0) >= 50 },
                        { key: 'bohater', name: 'Bohater', icon: '👑', color: 'from-yellow-500 to-orange-500', earned: (selectedVolunteer.totalHours || 0) >= 100 },
                        { key: 'debiutant', name: 'Debiutant', icon: '⭐', color: 'from-indigo-500 to-indigo-600', earned: (selectedVolunteer.totalProjects || 0) >= 1 },
                        { key: 'aktywny', name: 'Aktywny', icon: '❤️', color: 'from-red-500 to-red-600', earned: (selectedVolunteer.totalProjects || 0) >= 5 },
                        { key: 'mistrz', name: 'Mistrz', icon: '🏆', color: 'from-amber-500 to-amber-600', earned: (selectedVolunteer.totalProjects || 0) >= 15 },
                        { key: 'konsekwentny', name: 'Konsekwentny', icon: '🏅', color: 'from-teal-500 to-teal-600', earned: (selectedVolunteer.currentStreak || 0) >= 3 },
                        { key: 'niezdomny', name: 'Niezłomny', icon: '👑', color: 'from-cyan-500 to-cyan-600', earned: (selectedVolunteer.currentStreak || 0) >= 7 },
                        { key: 'mentor', name: 'Mentor', icon: '⭐', color: 'from-blue-600 to-blue-800', earned: (selectedVolunteer.specialAchievements || 0) >= 1 },
                        { key: 'ambasador', name: 'Ambasador', icon: '❤️', color: 'from-purple-600 to-purple-800', earned: (selectedVolunteer.specialAchievements || 0) >= 3 },
                        { key: 'pomocnik', name: 'Pomocnik', icon: '🏅', color: 'from-emerald-500 to-emerald-600', earned: (selectedVolunteer.impactPoints || 0) >= 100 },
                        { key: 'zmiana', name: 'Zmiana', icon: '🏆', color: 'from-red-600 to-red-800', earned: (selectedVolunteer.impactPoints || 0) >= 500 }
                      ];

                      return allBadges.map((badge) => (
                        <div
                          key={badge.key}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                            badge.earned
                              ? `bg-gradient-to-br ${badge.color} text-white shadow-md`
                              : 'bg-gray-200 text-gray-400'
                          }`}
                          title={badge.name}
                        >
                          {badge.icon}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}