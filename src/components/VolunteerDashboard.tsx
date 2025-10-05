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
  Heart,
  Filter,
  Bell,
  LogOut,
  ChevronRight,
  CheckCircle,
  Building2,
  Map,
  Shield,
  Target,
  Award,
  Star,
  XCircle,
  Trophy,
  Flame,
  Zap,
  Crown,
  Medal,
  BookOpen,
  Handshake,
  TrendingUp,
  Lock,
  // Progress,
  Camera,
  X,
  Plus,
  Image as ImageIcon,
  Upload
} from "lucide-react";
import { MapView } from "./MapView";
import { PrivacySettings } from "./PrivacySettings";
import { ChatButton, Chat } from "./Chat";
import { EditProfile } from "./EditProfile";
import { CertificateApplication } from "./CertificateApplication";
import MyApplications from "./MyApplications";
import { getAllOffers, signUpForOffer, cancelOfferSignup, getVolunteerRatings, updateBadgeProgress, checkAndAwardBadge, getUserOffers, getOfferById, deleteUserApplication, getCertificateApplications } from "../firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";
import { RatingComments } from "./RatingComments";
import logoVertical from "../assets/images/logos/Mlody_Krakow_LOGO_cmyk_pion.png";
import { RatingForm } from "./RatingForm";
import { StarRating } from "./StarRating";
// import { addDummyCommentsToUser } from "../scripts/addDummyComments";

interface User {
  id: number;
  uid: string;
  email: string;
  userType: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  isMinor: boolean;
}

interface VolunteerDashboardProps {
  user: User;
  onLogout: () => void;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  organization: string;
  organizationId: string;
  category: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  requirements: string[];
  benefits: string[];
  contactEmail: string;
  contactPhone?: string;
  status: 'active' | 'inactive' | 'completed';
  urgency: 'low' | 'medium' | 'high';
  createdAt: any;
  updatedAt: any;
  participants: string[]; // Array of user IDs
}

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  organization: string;
  location: string;
  type: 'volunteer' | 'training' | 'meeting';
  status: 'confirmed' | 'pending' | 'completed';
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'hours' | 'projects' | 'special' | 'streak' | 'impact';
  requirement: number;
  currentProgress: number;
  isUnlocked: boolean;
  unlockedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface VolunteerStats {
  totalHours: number;
  totalProjects: number;
  currentStreak: number;
  longestStreak: number;
  impactPoints: number;
  specialAchievements: number;
}


const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Pakowanie paczek świątecznych",
    date: "2024-12-20",
    time: "09:00",
    organization: "Caritas Warszawa",
    location: "Warszawa, Centrum",
    type: "volunteer",
    status: "confirmed"
  },
  {
    id: 2,
    title: "Szkolenie z pierwszej pomocy",
    date: "2024-10-28",
    time: "14:00",
    organization: "PCK",
    location: "Warszawa, Śródmieście",
    type: "training",
    status: "confirmed"
  },
  {
    id: 3,
    title: "Spotkanie organizacyjne",
    date: "2024-11-05",
    time: "18:00",
    organization: "Fundacja Przyjaciół Zwierząt",
    location: "Online",
    type: "meeting",
    status: "pending"
  },
  {
    id: 4,
    title: "Pomoc w jadłodajni",
    date: "2024-11-12",
    time: "12:00",
    organization: "Caritas Warszawa",
    location: "Warszawa, Praga",
    type: "volunteer",
    status: "confirmed"
  },
  {
    id: 5,
    title: "Warsztaty z dziećmi",
    date: "2024-11-18",
    time: "15:00",
    organization: "Stowarzyszenie Dziecięcy Uśmiech",
    location: "Kraków, Nowa Huta",
    type: "volunteer",
    status: "confirmed"
  }
];

const mockVolunteerStats: VolunteerStats = {
  totalHours: 45,
  totalProjects: 8,
  currentStreak: 3,
  longestStreak: 7,
  impactPoints: 280,
  specialAchievements: 2
};

const mockBadges: Badge[] = [
  // Odznaki godzinowe
  {
    id: 1,
    name: "Pierwszy Krok",
    description: "Przepracuj swoją pierwszą godzinę jako wolontariusz",
    icon: "star",
    color: "from-blue-400 to-blue-600",
    category: 'hours',
    requirement: 1,
    currentProgress: 45,
    isUnlocked: true,
    unlockedDate: "2024-09-15",
    rarity: 'common'
  },
  {
    id: 2,
    name: "Zaangażowany",
    description: "Przepracuj 10 godzin wolontariatu",
    icon: "heart",
    color: "from-pink-400 to-pink-600",
    category: 'hours',
    requirement: 10,
    currentProgress: 45,
    isUnlocked: true,
    unlockedDate: "2024-09-22",
    rarity: 'common'
  },
  {
    id: 3,
    name: "Wytrwały",
    description: "Przepracuj 50 godzin wolontariatu",
    icon: "medal",
    color: "from-yellow-400 to-yellow-600",
    category: 'hours',
    requirement: 50,
    currentProgress: 45,
    isUnlocked: false,
    rarity: 'rare'
  },
  {
    id: 4,
    name: "Bohater",
    description: "Przepracuj 100 godzin wolontariatu",
    icon: "crown",
    color: "from-purple-400 to-purple-600",
    category: 'hours',
    requirement: 100,
    currentProgress: 45,
    isUnlocked: false,
    rarity: 'epic'
  },
  
  // Odznaki projektowe
  {
    id: 5,
    name: "Debiutant",
    description: "Ukończ swój pierwszy projekt",
    icon: "trophy",
    color: "from-green-400 to-green-600",
    category: 'projects',
    requirement: 1,
    currentProgress: 8,
    isUnlocked: true,
    unlockedDate: "2024-09-18",
    rarity: 'common'
  },
  {
    id: 6,
    name: "Aktywny",
    description: "Ukończ 5 projektów",
    icon: "target",
    color: "from-orange-400 to-orange-600",
    category: 'projects',
    requirement: 5,
    currentProgress: 8,
    isUnlocked: true,
    unlockedDate: "2024-10-02",
    rarity: 'common'
  },
  {
    id: 7,
    name: "Mistrz",
    description: "Ukończ 15 projektów",
    icon: "award",
    color: "from-red-400 to-red-600",
    category: 'projects',
    requirement: 15,
    currentProgress: 8,
    isUnlocked: false,
    rarity: 'rare'
  },
  
  // Odznaki ciągłości
  {
    id: 8,
    name: "Konsekwentny",
    description: "Wolontariusze przez 3 tygodnie z rzędu",
    icon: "flame",
    color: "from-orange-500 to-red-500",
    category: 'streak',
    requirement: 3,
    currentProgress: 3,
    isUnlocked: true,
    unlockedDate: "2024-10-01",
    rarity: 'common'
  },
  {
    id: 9,
    name: "Niezłomny",
    description: "Wolontariusze przez 7 tygodni z rzędu",
    icon: "zap",
    color: "from-yellow-500 to-orange-500",
    category: 'streak',
    requirement: 7,
    currentProgress: 3,
    isUnlocked: false,
    rarity: 'rare'
  },
  
  // Odznaki specjalne
  {
    id: 10,
    name: "Mentor",
    description: "Poprowadź szkolenie dla innych wolontariuszy",
    icon: "bookOpen",
    color: "from-indigo-400 to-indigo-600",
    category: 'special',
    requirement: 1,
    currentProgress: 1,
    isUnlocked: true,
    unlockedDate: "2024-09-28",
    rarity: 'epic'
  },
  {
    id: 11,
    name: "Ambasador",
    description: "Zrekrutuj 3 nowych wolontariuszy",
    icon: "handshake",
    color: "from-teal-400 to-teal-600",
    category: 'special',
    requirement: 3,
    currentProgress: 1,
    isUnlocked: false,
    rarity: 'legendary'
  },
  
  // Odznaki wpływu
  {
    id: 12,
    name: "Pomocnik",
    description: "Zdobądź 100 punktów wpływu",
    icon: "heart",
    color: "from-pink-500 to-rose-500",
    category: 'impact',
    requirement: 100,
    currentProgress: 280,
    isUnlocked: true,
    unlockedDate: "2024-09-25",
    rarity: 'common'
  },
  {
    id: 13,
    name: "Zmiana",
    description: "Zdobądź 500 punktów wpływu",
    icon: "trendingUp",
    color: "from-emerald-400 to-emerald-600",
    category: 'impact',
    requirement: 500,
    currentProgress: 280,
    isUnlocked: false,
    rarity: 'epic'
  }
];

// Completed Action Interface
interface CompletedAction {
  id: number;
  title: string;
  organization: string;
  location: string;
  date: string;
  duration: string;
  description: string;
  photos: { id: number; url: string; caption: string; uploadedAt: string; }[];
  rating?: number;
  feedback?: string;
}

// Mock completed actions
const mockCompletedActions: CompletedAction[] = [
  {
    id: 1,
    title: "Pomoc w schronisku dla zwierząt",
    organization: "Fundacja Przyjaciół Zwierząt",
    location: "Warszawa, Mokotów",
    date: "2024-09-15",
    duration: "3 godziny",
    description: "Pomoc w karmieniu, sprzątaniu i spacerach z psami.",
    photos: [
      {
        id: 1,
        url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
        caption: "Spacer z psami w parku",
        uploadedAt: "2024-09-15T16:30:00"
      },
      {
        id: 2,
        url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
        caption: "Karmienie zwierząt",
        uploadedAt: "2024-09-15T17:00:00"
      }
    ],
    rating: 5,
    feedback: "Wspaniałe doświadczenie! Zwierzęta były bardzo przyjazne."
  },
  {
    id: 2,
    title: "Sprzątanie parku miejskiego",
    organization: "Eko-Warszawa",
    location: "Park Łazienkowski",
    date: "2024-09-08",
    duration: "2 godziny",
    description: "Akcja sprzątania i segregacji śmieci w parku.",
    photos: [],
    rating: 4
  },
  {
    id: 3,
    title: "Pomoc w jadłodajni",
    organization: "Caritas Warszawa",
    location: "Warszawa, Centrum",
    date: "2024-08-30",
    duration: "4 godziny",
    description: "Przygotowywanie i serwowanie posiłków dla potrzebujących.",
    photos: [
      {
        id: 3,
        url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400",
        caption: "Przygotowywanie posiłków",
        uploadedAt: "2024-08-30T14:15:00"
      }
    ],
    rating: 5,
    feedback: "Bardzo potrzebna akcja. Miło było móc pomóc."
  }
];

export function VolunteerDashboard({ user, onLogout }: VolunteerDashboardProps) {
  const { userProfile, user: authUser } = useAuth();
  const { openChat } = useChat();
  const [activeTab, setActiveTab] = useState("offers");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [completedActions, setCompletedActions] = useState(mockCompletedActions);
  const [selectedActionForPhotos, setSelectedActionForPhotos] = useState(null);
  const [calendarEvents] = useState(mockCalendarEvents);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [volunteerStats, setVolunteerStats] = useState({
    totalHours: 0,
    totalProjects: 0,
    currentStreak: 0,
    longestStreak: 0,
    impactPoints: 0,
    specialAchievements: 0
  });

  // Helper function to format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace('.0', '') + ' mil';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return num.toString();
  };
  const [badges, setBadges] = useState([]);
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState("all");
  const [ratings, setRatings] = useState({
    averageRating: 0,
    totalRatings: 0,
    comments: []
  });
  // Removed showRatingForm state since self-rating is not allowed


  // Sync badges to Firestore when they're earned
  const syncBadgesToFirestore = async () => {
    if (!userProfile?.id) return;

    try {
      // Update progress for all badges based on current stats
      const badgeUpdates = [
        { type: 'pierwszyKrok', progress: userProfile.volunteerHours || 0 },
        { type: 'zaangazowany', progress: userProfile.volunteerHours || 0 },
        { type: 'wytrwaly', progress: userProfile.volunteerHours || 0 },
        { type: 'bohater', progress: userProfile.volunteerHours || 0 },
        { type: 'debiutant', progress: userProfile.totalProjects || 0 },
        { type: 'aktywny', progress: userProfile.totalProjects || 0 },
        { type: 'mistrz', progress: userProfile.totalProjects || 0 },
        { type: 'konsekwentny', progress: userProfile.currentStreak || 0 },
        { type: 'niezdomny', progress: userProfile.currentStreak || 0 },
        { type: 'pomocnik', progress: userProfile.impactPoints || 0 },
        { type: 'zmiana', progress: userProfile.impactPoints || 0 }
      ];

      // Update progress for each badge
      for (const badgeUpdate of badgeUpdates) {
        await updateBadgeProgress(userProfile.id, badgeUpdate.type, badgeUpdate.progress);
        // Check if badge should be awarded
        await checkAndAwardBadge(userProfile.id, badgeUpdate.type);
      }

      console.log('Badges synced to Firestore successfully');
    } catch (error) {
      console.error('Error syncing badges to Firestore:', error);
    }
  };

  // Convert Firestore badge data to Badge interface
  useEffect(() => {
    console.log('Badge useEffect triggered, userProfile:', userProfile);
    console.log('userProfile?.badges:', userProfile?.badges);
    
    // Always show badges, even if userProfile is not loaded yet
    const firestoreBadges: Badge[] = [
        {
          id: 1,
          name: "Witaj!",
          description: "Utworzono konto na platformie",
          icon: "star",
          category: "special",
          rarity: "common",
          color: "from-green-500 to-green-600",
          isUnlocked: userProfile?.badges?.witaj?.earned ?? true, // Default to true if userProfile not loaded yet
          unlockedDate: userProfile?.badges?.witaj?.earnedDate?.toDate?.() || null,
          currentProgress: 1,
          requirement: 1
        },
        {
          id: 2,
          name: "Pierwszy Krok",
          description: "Przepracuj swoją pierwszą godzinę jako wolontariusz",
          icon: "target",
          category: "hours",
          rarity: "common",
          color: "from-blue-500 to-blue-600",
          isUnlocked: (userProfile?.volunteerHours || 0) >= 1,
          unlockedDate: (userProfile?.volunteerHours || 0) >= 1 ? (userProfile?.badges?.pierwszyKrok?.earnedDate?.toDate?.() || new Date()) : null,
          currentProgress: userProfile?.volunteerHours || 0,
          requirement: 1
        },
        {
          id: 3,
          name: "Zaangażowany",
          description: "Przepracuj 10 godzin wolontariatu",
          icon: "heart",
          category: "hours",
          rarity: "common",
          color: "from-pink-500 to-pink-600",
          isUnlocked: (userProfile?.volunteerHours || 0) >= 10,
          unlockedDate: (userProfile?.volunteerHours || 0) >= 10 ? (userProfile?.badges?.zaangazowany?.earnedDate?.toDate?.() || new Date()) : null,
          currentProgress: userProfile?.volunteerHours || 0,
          requirement: 10
        },
        {
          id: 4,
          name: "Wytrwały",
          description: "Przepracuj 50 godzin wolontariatu",
          icon: "medal",
          category: "hours",
          rarity: "rare",
          color: "from-purple-500 to-purple-600",
          isUnlocked: (userProfile?.volunteerHours || 0) >= 50,
          unlockedDate: (userProfile?.volunteerHours || 0) >= 50 ? (userProfile?.badges?.wytrwaly?.earnedDate?.toDate?.() || new Date()) : null,
          currentProgress: userProfile?.volunteerHours || 0,
          requirement: 50
        },
        {
          id: 5,
          name: "Bohater",
          description: "Przepracuj 100 godzin wolontariatu",
          icon: "crown",
          category: "hours",
          rarity: "epic",
          color: "from-yellow-500 to-orange-500",
          isUnlocked: (userProfile?.volunteerHours || 0) >= 100,
          unlockedDate: (userProfile?.volunteerHours || 0) >= 100 ? (userProfile?.badges?.bohater?.earnedDate?.toDate?.() || new Date()) : null,
          currentProgress: userProfile?.volunteerHours || 0,
          requirement: 100
        },
        {
          id: 6,
          name: "Debiutant",
          description: "Ukończ swój pierwszy projekt",
          icon: "star",
          category: "projects",
          rarity: "common",
          color: "from-indigo-500 to-indigo-600",
          isUnlocked: (userProfile?.totalProjects || 0) >= 1,
          unlockedDate: (userProfile?.totalProjects || 0) >= 1 ? (userProfile?.badges?.debiutant?.earnedDate?.toDate?.() || new Date()) : null,
          currentProgress: userProfile?.totalProjects || 0,
          requirement: 1
        },
        {
          id: 7,
          name: "Aktywny",
          description: "Ukończ 5 projektów",
          icon: "heart",
          category: "projects",
          rarity: "common",
          color: "from-red-500 to-red-600",
          isUnlocked: (userProfile?.totalProjects || 0) >= 5,
          unlockedDate: (userProfile?.totalProjects || 0) >= 5 ? (userProfile?.badges?.aktywny?.earnedDate?.toDate?.() || new Date()) : null,
          currentProgress: userProfile?.totalProjects || 0,
          requirement: 5
        },
        {
          id: 8,
          name: "Mistrz",
          description: "Ukończ 15 projektów",
          icon: "trophy",
          category: "projects",
          rarity: "rare",
          color: "from-amber-500 to-amber-600",
          isUnlocked: (userProfile?.totalProjects || 0) >= 15,
          unlockedDate: (userProfile?.totalProjects || 0) >= 15 ? (userProfile?.badges?.mistrz?.earnedDate?.toDate?.() || new Date()) : null,
          currentProgress: userProfile?.totalProjects || 0,
          requirement: 15
        },
        {
          id: 9,
          name: "Konsekwentny",
          description: "Wolontariusze przez 3 tygodnie z rzędu",
          icon: "medal",
          category: "streak",
          rarity: "common",
          color: "from-teal-500 to-teal-600",
          isUnlocked: (userProfile?.currentStreak || 0) >= 3,
          unlockedDate: (userProfile?.currentStreak || 0) >= 3 ? (userProfile?.badges?.konsekwentny?.earnedDate?.toDate?.() || new Date()) : null,
          currentProgress: userProfile?.currentStreak || 0,
          requirement: 3
        },
        {
          id: 10,
          name: "Niezłomny",
          description: "Wolontariusze przez 7 tygodni z rzędu",
          icon: "crown",
          category: "streak",
          rarity: "rare",
          color: "from-cyan-500 to-cyan-600",
          isUnlocked: (userProfile?.currentStreak || 0) >= 7,
          unlockedDate: (userProfile?.currentStreak || 0) >= 7 ? (userProfile?.badges?.niezdomny?.earnedDate?.toDate?.() || new Date()) : null,
          currentProgress: userProfile?.currentStreak || 0,
          requirement: 7
        },
        {
          id: 11,
          name: "Mentor",
          description: "Poprowadź szkolenie dla innych wolontariuszy",
          icon: "star",
          category: "impact",
          rarity: "epic",
          color: "from-blue-600 to-blue-800",
          isUnlocked: (userProfile?.specialAchievements || 0) >= 1,
          unlockedDate: (userProfile?.specialAchievements || 0) >= 1 ? (userProfile?.badges?.mentor?.earnedDate?.toDate?.() || new Date()) : null,
          currentProgress: userProfile?.specialAchievements || 0,
          requirement: 1
        },
        {
          id: 12,
          name: "Ambasador",
          description: "Zrekrutuj 3 nowych wolontariuszy",
          icon: "heart",
          category: "impact",
          rarity: "legendary",
          color: "from-purple-600 to-purple-800",
          isUnlocked: (userProfile?.specialAchievements || 0) >= 3,
          unlockedDate: (userProfile?.specialAchievements || 0) >= 3 ? (userProfile?.badges?.ambasador?.earnedDate?.toDate?.() || new Date()) : null,
          currentProgress: userProfile?.specialAchievements || 0,
          requirement: 3
        },
        {
          id: 13,
          name: "Pomocnik",
          description: "Zdobądź 100 punktów wpływu",
          icon: "medal",
          category: "impact",
          rarity: "common",
          color: "from-emerald-500 to-emerald-600",
          isUnlocked: (userProfile?.impactPoints || 0) >= 100,
          unlockedDate: (userProfile?.impactPoints || 0) >= 100 ? (userProfile?.badges?.pomocnik?.earnedDate?.toDate?.() || new Date()) : null,
          currentProgress: userProfile?.impactPoints || 0,
          requirement: 100
        },
        {
          id: 14,
          name: "Zmiana",
          description: "Zdobądź 500 punktów wpływu",
          icon: "trophy",
          category: "impact",
          rarity: "rare",
          color: "from-red-600 to-red-800",
          isUnlocked: (userProfile?.impactPoints || 0) >= 500,
          unlockedDate: (userProfile?.impactPoints || 0) >= 500 ? (userProfile?.badges?.zmiana?.earnedDate?.toDate?.() || new Date()) : null,
          currentProgress: userProfile?.impactPoints || 0,
          requirement: 500
        }
      ];
      
      console.log('Setting badges:', firestoreBadges);
      setBadges(firestoreBadges);
      
      // Automatically sync badges to Firestore when userProfile changes
      if (userProfile?.id) {
        syncBadgesToFirestore();
      }
  }, [userProfile]);

  // Fetch volunteer statistics from Firestore
  useEffect(() => {
    if (userProfile) {
      console.log('Fetching volunteer stats from userProfile:', userProfile);
      
      const stats: VolunteerStats = {
        totalHours: userProfile.volunteerHours || 0,
        totalProjects: userProfile.totalProjects || 0,
        currentStreak: userProfile.currentStreak || 0,
        longestStreak: userProfile.longestStreak || 0,
        impactPoints: userProfile.impactPoints || 0,
        specialAchievements: userProfile.specialAchievements || 0
      };
      
      console.log('Setting volunteer stats:', stats);
      setVolunteerStats(stats);
    }
  }, [userProfile]);

  // Fetch offers from Firestore
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoadingOffers(true);
        const firestoreOffers = await getAllOffers();
        console.log('Fetched offers from Firestore:', firestoreOffers);
        setOffers(firestoreOffers);
      } catch (error) {
        console.error('Error fetching offers:', error);
        setOffers([]);
      } finally {
        setLoadingOffers(false);
      }
    };

    fetchOffers();
  }, []);

  // Fetch applications when calendar tab is active
  useEffect(() => {
    if (activeTab === 'calendar') {
      fetchApplications();
    }
  }, [activeTab, userProfile?.id]);

  // Fetch ratings and certificate applications for the volunteer
  useEffect(() => {
    const fetchRatings = async () => {
      if (userProfile?.id) {
        try {
          const ratingsData = await getVolunteerRatings(userProfile.id);
          if (ratingsData) {
            setRatings(ratingsData);
          }
        } catch (error) {
          console.error('Error fetching ratings:', error);
        }
      }
    };

    const fetchCertificates = async () => {
      if (userProfile?.id && userProfile?.isMinor) {
        try {
          setLoadingCertificates(true);
          const applications = await getCertificateApplications(userProfile.id);
          setCertificateApplications(applications);
          console.log('Fetched certificate applications:', applications);
        } catch (error) {
          console.error('Error fetching certificate applications:', error);
        } finally {
          setLoadingCertificates(false);
        }
      }
    };

    fetchRatings();
    fetchCertificates();
  }, [userProfile?.id, userProfile?.isMinor]);


  // Function to handle photo upload for completed actions
  const handlePhotoUpload = (actionId: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPhotos = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      caption: "",
      uploadedAt: new Date().toISOString()
    }));

    setCompletedActions(prev => 
      prev.map(action => 
        action.id === actionId 
          ? { ...action, photos: [...action.photos, ...newPhotos] }
          : action
      )
    );
  };

  // Function to update photo caption
  const updatePhotoCaption = (actionId: number, photoId: number, caption: string) => {
    setCompletedActions(prev =>
      prev.map(action =>
        action.id === actionId
          ? {
              ...action,
              photos: action.photos.map(photo =>
                photo.id === photoId ? { ...photo, caption } : photo
              )
            }
          : action
      )
    );
  };

  // Function to remove photo
  const removePhoto = (actionId: number, photoId: number) => {
    setCompletedActions(prev =>
      prev.map(action =>
        action.id === actionId
          ? {
              ...action,
              photos: action.photos.filter(photo => photo.id !== photoId)
            }
          : action
      )
    );
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || !selectedCategory || offer.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" || !selectedLocation || offer.location.includes(selectedLocation);
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Get user's applications to check which offers they've applied to
  const [userApplications, setUserApplications] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchUserApplications = async () => {
      if (userProfile?.id) {
        try {
          const applications = await getUserOffers(userProfile.id);
          setUserApplications(applications);
        } catch (error) {
          console.error('Error fetching user applications:', error);
        }
      }
    };
    
    fetchUserApplications();
  }, [userProfile?.id, offers]);
  
  const appliedOffers = offers.filter(offer => {
    // Check if user is already a participant OR has a pending/accepted application
    const isParticipant = offer.participants.includes(userProfile?.id || '');
    const hasApplication = userApplications.some(app => app.offerId === offer.id);
    return isParticipant || hasApplication;
  });
  const userAge = calculateAge(user.birthDate);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'volunteer': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'training': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'volunteer': return 'Wolontariat';
      case 'training': return 'Szkolenie';
      case 'meeting': return 'Spotkanie';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Potwierdzone';
      case 'pending': return 'Oczekuje';
      case 'completed': return 'Zakończone';
      default: return status;
    }
  };

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    // Use local date to match our application events
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    console.log(`getEventsForDate: Input date: ${date.toDateString()}, Looking for: ${dateStr}`);
    
    const matchingEvents = getAllEvents().filter(event => {
      console.log(`Comparing: ${event.date} === ${dateStr}? ${event.date === dateStr}`);
      return event.date === dateStr;
    });
    
    console.log(`Found ${matchingEvents.length} events for ${dateStr}:`, matchingEvents);
    return matchingEvents;
  };

  // Get dates that have events
  const getEventDates = () => {
    return getAllEvents().map(event => {
      // Parse the YYYY-MM-DD format back to a Date object
      const [year, month, day] = event.date.split('-').map(Number);
      return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
    });
  };

  // Fetch applications and convert to calendar events
  const fetchCertificateApplications = async () => {
    if (!userProfile?.id) return;
    
    try {
      setLoadingCertificates(true);
      const applications = await getCertificateApplications(userProfile.id);
      setCertificateApplications(applications);
      console.log('Fetched certificate applications:', applications);
    } catch (error) {
      console.error('Error fetching certificate applications:', error);
    } finally {
      setLoadingCertificates(false);
    }
  };

  const fetchApplications = async () => {
    if (!userProfile?.id) return;
    
    try {
      setLoadingApplications(true);
      const userApplications = await getUserOffers(userProfile.id);
      console.log('Fetched applications for calendar:', userApplications);
      
      // Fetch offer details for each application to get start dates
      const applicationsWithOfferDetails = await Promise.all(
        userApplications.map(async (app: any) => {
          try {
            const offer = await getOfferById(app.offerId);
            if (offer) {
              return {
                ...app,
                offerStartDate: offer.startDate
              };
            }
          } catch (error) {
            console.error(`Error fetching offer ${app.offerId}:`, error);
          }
          return app;
        })
      );
      
      setApplications(applicationsWithOfferDetails);
    } catch (error) {
      console.error('Error fetching applications for calendar:', error);
    } finally {
      setLoadingApplications(false);
    }
  };

  // Convert applications to calendar events
  const getApplicationEvents = () => {
    return applications.map((app: any, index: number) => {
      let eventDate = new Date().toISOString().split('T')[0]; // Default to today
      let eventTime = '00:00';
      
      // Try to get the offer's start date from the applications data
      // If not available, fall back to application date
      if (app.offerStartDate) {
        // Use offer's start date if available
        const dateObj = new Date(app.offerStartDate);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        eventDate = `${year}-${month}-${day}`;
        eventTime = '09:00'; // Default time for events
        console.log(`Application ${app.id}: Using offer start date: ${app.offerStartDate}, Converted date: ${eventDate}`);
      } else if (app.appliedAt) {
        // Fallback to application date
        let dateObj;
        if (app.appliedAt.toDate) {
          // Firebase timestamp
          dateObj = app.appliedAt.toDate();
        } else {
          // Regular date
          dateObj = new Date(app.appliedAt);
        }
        
        // Use local date to avoid timezone issues
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        eventDate = `${year}-${month}-${day}`;
        
        eventTime = dateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
        
        console.log(`Application ${app.id}: Using application date: ${app.appliedAt}, Converted date: ${eventDate}, Date object: ${dateObj.toDateString()}`);
      }
      
      return {
        id: `app-${app.id}`,
        title: app.offerTitle,
        date: eventDate,
        time: eventTime,
        organization: app.organizationName,
        location: 'Lokalizacja do ustalenia',
        type: 'volunteer' as const,
        status: app.status === 'accepted' ? 'confirmed' as const : app.status === 'rejected' ? 'completed' as const : 'pending' as const,
        category: null,
        author: app.organizationName,
        applicationData: app,
        color: getRandomColor(index)
      };
    });
  };

  // Generate random colors for events
  const getRandomColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-red-100 text-red-800 border-red-200'
    ];
    return colors[index % colors.length];
  };

  // Get all events (mock + applications)
  const getAllEvents = () => {
    return [...calendarEvents, ...getApplicationEvents()];
  };

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return getAllEvents()
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };


  const handleApplyToOffer = async (offerId: string) => {
    try {
      if (!userProfile?.id) {
        console.log("User not logged in - cannot apply to offer");
        return;
      }


      console.log('Attempting to sign up for offer:', offerId, 'with user:', userProfile.id);
      const success = await signUpForOffer(offerId, userProfile.id);
      console.log('Sign up result:', success);
      if (success) {
        console.log("Successfully applied to offer");
        // Refresh offers to update the UI
        const updatedOffers = await getAllOffers();
        setOffers(updatedOffers);
      } else {
        console.log("Failed to apply to offer");
      }
    } catch (error) {
      console.error('Error applying to offer:', error);
    }
  };

  const handleCancelOffer = async (offerId: string) => {
    try {
      if (!userProfile?.id) {
        console.log("User not logged in - cannot cancel offer");
        return;
      }

      // First, get the user's applications to find the application ID
      const userApplications = await getUserOffers(userProfile.id);
      const application = userApplications.find((app: any) => app.offerId === offerId);
      
      if (!application) {
        console.log("Application not found for this offer");
        return;
      }

      console.log("Found application to cancel:", application);

      // Cancel the offer signup (remove from offer's participants)
      const cancelSuccess = await cancelOfferSignup(offerId, userProfile.id);
      if (!cancelSuccess) {
        console.log("Failed to cancel offer signup - user may not have been in offer participants");
      }

      // Remove from user's applications
      const deleteSuccess = await deleteUserApplication(userProfile.id, application.id);
      
      if (deleteSuccess) {
        console.log("Successfully canceled offer application and removed from user applications");
        // Refresh offers to update the UI
        const updatedOffers = await getAllOffers();
        setOffers(updatedOffers);
      } else {
        console.log("Failed to delete user application");
      }
    } catch (error) {
      console.error('Error canceling offer:', error);
    }
  };


  const OfferCard = ({ offer }: { offer: Offer }) => (
    <Card className="mb-4 border-l-4 border-l-pink-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{offer.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 mb-2">
              <Building2 className="h-4 w-4" />
              {offer.organization}
            </CardDescription>
          </div>
          <Badge className={`${getUrgencyColor(offer.urgency)} border`}>
            {offer.urgency === 'high' ? 'Pilne' : offer.urgency === 'medium' ? 'Średnie' : 'Niskie'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {offer.location}
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
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="mb-3">
          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md border mb-2">
            {offer.category}
          </span>
          <p className="text-sm mb-2">{offer.description}</p>
          
          {offer.requirements.length > 0 && (
            <div className="mb-3">
              <p className="text-sm mb-2 font-medium">Wymagania:</p>
              <div className="flex flex-wrap gap-2">
                {offer.requirements.map((req, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md border"
                  >
                    {req}
                  </span>
                ))}
              </div>
              {user.isMinor && offer.requirements.some(req => req.includes("niekaralności")) && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <Bell className="h-3 w-3" />
                  Jako osoba małoletnia będziesz potrzebować zgody rodziców
                </p>
              )}
            </div>
          )}

          {offer.benefits && offer.benefits.length > 0 && (
            <div className="mb-3">
              <p className="text-sm mb-2 font-medium">Korzyści:</p>
              <div className="flex flex-wrap gap-2">
                {offer.benefits.map((benefit, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md border"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {(() => {
            const isParticipant = offer.participants.includes(userProfile?.id || '');
            const hasApplication = userApplications.some(app => app.offerId === offer.id);
            const isFull = offer.currentParticipants >= offer.maxParticipants;
            console.log('Button render check - userProfile:', userProfile?.id, 'offer participants:', offer.participants, 'isParticipant:', isParticipant, 'hasApplication:', hasApplication, 'isFull:', isFull, 'currentParticipants:', offer.currentParticipants, 'maxParticipants:', offer.maxParticipants);
            
            return (isParticipant || hasApplication) ? (
              <Button 
                variant="outline" 
                onClick={() => handleCancelOffer(offer.id)}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Anuluj zgłoszenie
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  console.log('Button clicked - userProfile:', userProfile?.id, 'offer participants:', offer.participants, 'is full:', offer.currentParticipants >= offer.maxParticipants);
                  handleApplyToOffer(offer.id);
                }}
                className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:opacity-90"
                disabled={offer.currentParticipants >= offer.maxParticipants || offer.maxParticipants === 0}
              >
                {offer.maxParticipants === 0 ? 'Brak miejsc' : 'Zgłoś się'}
              </Button>
            );
          })()}
          <ChatButton 
            contact={{
              id: parseInt(offer.id) || 0,
              name: offer.organization,
              role: "Koordynator",
              organization: offer.organization,
              isOnline: Math.random() > 0.3,
              lastSeen: Math.random() > 0.5 ? "2 min temu" : undefined
            }}
            userType="wolontariusz"
            variant="icon"
          />
        </div>
      </CardContent>
    </Card>
  );

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [certificateApplications, setCertificateApplications] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-16 h-12 flex items-center justify-center">
              <img 
                src={logoVertical} 
                alt="Młody Kraków Logo" 
                className="h-12 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg">Cześć, {user.firstName}!</h1>
              <p className="text-sm text-muted-foreground">
                {user.isMinor ? `${userAge} lat (konto małoletnie)` : `${userAge} lat`}
              </p>
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

          <TabsContent value="offers" className="space-y-4">
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
                
                <div className="grid grid-cols-2 gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      <SelectItem value="Opieka nad zwierzętami">Zwierzęta</SelectItem>
                      <SelectItem value="Pomoc społeczna">Pomoc społeczna</SelectItem>
                      <SelectItem value="Praca z dziećmi">Dzieci</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Lokalizacja" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      <SelectItem value="Warszawa">Warszawa</SelectItem>
                      <SelectItem value="Kraków">Kraków</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Offers List */}
            {loadingOffers ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Ładowanie ofert...</p>
                </CardContent>
              </Card>
            ) : filteredOffers.length > 0 ? (
              filteredOffers.map(offer => (
                <div key={offer.id}>
                  <OfferCard offer={offer} />
            </div>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nie znaleziono ofert spełniających kryteria</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

          <TabsContent value="my-applications" className="space-y-4">
            <MyApplications 
              onApplicationChange={async () => {
                // Refresh offers when application changes
                const updatedOffers = await getAllOffers();
                setOffers(updatedOffers);
              }}
              onNavigateToOffers={() => setActiveTab("offers")}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="mb-2">Kalendarz wydarzeń</h2>
              <p className="text-sm text-muted-foreground">Twoje nadchodzące wolontariaty</p>
            </div>

            {/* Upcoming Events Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-pink-600" />
                  Nadchodzące wydarzenia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getUpcomingEvents().length > 0 ? (
                  <div className="space-y-3">
                    {getUpcomingEvents().map(event => (
                      <div 
                        key={event.id} 
                        className={`flex items-center justify-between p-3 rounded-lg ${event.color || 'bg-gray-50'}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium">{event.title}</h4>
                            <Badge className={`${getEventTypeColor(event.type)} border text-xs`}>
                              {getEventTypeLabel(event.type)}
                            </Badge>
                            {event.category && (
                              <Badge variant="outline" className="text-xs">
                                {event.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{event.organization}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(event.date).toLocaleDateString('pl-PL')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                            {event.author && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {event.author}
                              </span>
                            )}
                          </div>
                        </div>
                        {event.applicationData && (
                        <Badge className={`${getStatusColor(event.status)} text-xs`}>
                          {getStatusLabel(event.status)}
                        </Badge>
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
                <CardDescription>Kliknij na podświetlone daty, aby zobaczyć szczegóły wydarzeń</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        // No popup - events will be shown in the "Wydarzenia" section below
                      }
                    }}
                    className="rounded-md border"
                    modifiers={{
                      hasEvents: getEventDates()
                    }}
                    modifiersStyles={{
                      hasEvents: {
                        backgroundColor: 'rgba(236, 72, 153, 0.1)',
                        color: '#ec4899',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Selected Date Events */}
            {selectedDate && getEventsForDate(selectedDate).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Wydarzenia {selectedDate.toLocaleDateString('pl-PL')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).map(event => (
                      <div 
                        key={event.id} 
                        className={`border rounded-lg p-4 ${event.color || 'border-gray-200'}`}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
                            <div className="flex flex-wrap gap-2">
                            <Badge className={`${getEventTypeColor(event.type)} border text-xs`}>
                              {getEventTypeLabel(event.type)}
                            </Badge>
                              {event.applicationData && (
                            <Badge className={`${getStatusColor(event.status)} text-xs`}>
                              {getStatusLabel(event.status)}
                            </Badge>
                              )}
                              {event.category && (
                                <Badge variant="outline" className="text-xs whitespace-nowrap">
                                  {event.category}
                                </Badge>
                              )}
                          </div>
                        </div>
                        
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Organizacja:</span>
                              <span className="text-muted-foreground">{event.organization}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Godzina:</span>
                              <span className="text-muted-foreground">{event.time}</span>
                          </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Lokalizacja:</span>
                              <span className="text-muted-foreground">{event.location}</span>
                          </div>
                            
                            {event.author && (
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Autor:</span>
                                <span className="text-muted-foreground">{event.author}</span>
                              </div>
                            )}
                          </div>
                          
                          {event.applicationData && (
                            <div className="border-t pt-3 mt-3">
                              <h5 className="font-medium mb-2 text-sm">Szczegóły zgłoszenia:</h5>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>Status: {getStatusLabel(event.status)}</p>
                                <p>Zgłoszono: {event.applicationData.appliedAt ? 
                                  (event.applicationData.appliedAt.toDate ? 
                                    event.applicationData.appliedAt.toDate().toLocaleDateString('pl-PL') : 
                                    new Date(event.applicationData.appliedAt).toLocaleDateString('pl-PL')
                                  ) : 'Nieznana data'
                                }</p>
                                {event.applicationData.rejectionMessage && (
                                  <p className="text-red-600">
                                    Powód odrzucenia: {event.applicationData.rejectionMessage}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <ChatButton 
                            contact={{
                              id: event.id + 1000,
                              name: event.organization,
                              role: "Koordynator wydarzeń",
                              organization: event.organization,
                              isOnline: Math.random() > 0.4,
                              lastSeen: Math.random() > 0.6 ? "5 min temu" : undefined
                            }}
                            userType="wolontariusz"
                            variant="inline"
                          />
                          {event.status === 'confirmed' && (
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4 mr-2" />
                              Szczegóły
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Events List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Wszystkie wydarzenia</CardTitle>
                <CardDescription>Pełna lista twoich zaplanowanych aktywności</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingApplications ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Ładowanie wydarzeń...</p>
                  </div>
                ) : getAllEvents().length > 0 ? (
                  <div className="space-y-3">
                    {getAllEvents()
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map(event => (
                        <div 
                          key={event.id} 
                          className={`flex items-center justify-between p-3 border rounded-lg ${event.color || 'border-gray-200'}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium">{event.title}</h4>
                              <Badge className={`${getEventTypeColor(event.type)} border text-xs`}>
                                {getEventTypeLabel(event.type)}
                              </Badge>
                              {event.category && (
                                <Badge variant="outline" className="text-xs">
                                  {event.category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{event.organization}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(event.date).toLocaleDateString('pl-PL')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {event.time}
                              </span>
                              {event.author && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {event.author}
                                </span>
                              )}
                            </div>
                          </div>
                          {event.applicationData && (
                          <Badge className={`${getStatusColor(event.status)} text-xs`}>
                            {getStatusLabel(event.status)}
                          </Badge>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Brak zaplanowanych wydarzeń</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <MapView userType="wolontariusz" />
          </TabsContent>



          <TabsContent value="profile" className="space-y-4">
            <div className="text-center mb-6">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarFallback className="bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xl">
                  {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <h2 className="mb-1">{userProfile?.firstName} {userProfile?.lastName}</h2>
              <p className="text-sm text-muted-foreground">
                {userProfile?.birthDate ? `${userAge} lat` : 'Wiek nieznany'}
              </p>
              {userProfile?.schoolName && (
                <p className="text-sm text-muted-foreground">
                  {userProfile.schoolName}
                </p>
              )}
              
              
              {/* Average Rating */}
              <div className="flex items-center justify-center gap-2 mt-2">
                {ratings.totalRatings > 0 ? (
                  <>
                    <StarRating rating={ratings.averageRating} size="sm" />
                    <span className="text-sm text-muted-foreground">
                      {ratings.averageRating.toFixed(1)} ({ratings.totalRatings} {ratings.totalRatings === 1 ? 'ocena' : 'ocen'})
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Brak ocen
                  </span>
                )}
              </div>
            </div>

            {/* Bio Section */}
            {currentUser.bio && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    O mnie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{currentUser.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Skills and Interests */}
            {((currentUser.skills?.length || 0) > 0 || (currentUser.interests?.length || 0) > 0 || (currentUser.achievements?.length || 0) > 0) && (
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

                  {currentUser.interests?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Zainteresowania
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {currentUser.interests.map((interest, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {interest}
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

                    {user.isMinor && (
                      <Card className="border-amber-200 bg-amber-50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Bell className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="text-amber-800 mb-1">Konto małoletnie</h4>
                              <p className="text-sm text-amber-700">
                                Jako osoba poniżej 18 roku życia, do uczestnictwa w niektórych aktywnościach 
                                będziesz potrzebować zgody rodziców lub opiekunów prawnych.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Certificate Status for Minors */}
                    {user.isMinor && (() => {
                      const latestApplication = certificateApplications.length > 0 ? certificateApplications[0] : null;
                      const certificateStatus = latestApplication?.status || userProfile?.certificateStatus || 'none';
                      
                      if (certificateStatus === 'approved') {
                        return (
                          <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <h4 className="text-green-800 mb-1">Zaświadczenie zatwierdzone</h4>
                                  <p className="text-sm text-green-700">
                                    Twoje zaświadczenie zostało zatwierdzone przez koordynatora szkoły. 
                                    Możesz teraz uczestniczyć w wolontariacie.
                                  </p>
                                  {latestApplication?.processedAt && (
                                    <p className="text-xs text-green-600 mt-2">
                                      Zatwierdzone: {new Date(latestApplication.processedAt.seconds * 1000).toLocaleDateString('pl-PL')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      } else {
                        // For rejected, pending, or no certificate - show the form
                        return (
                          <CertificateApplication 
                            userProfile={userProfile}
                            onApplicationSubmitted={() => {
                              // Refresh certificate applications
                              fetchCertificateApplications();
                              console.log('Certificate application submitted');
                            }}
                          />
                        );
                      }
                    })()}



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

                    {/* Rating System */}
                    <RatingComments 
                      comments={ratings.comments}
                      averageRating={ratings.averageRating}
                      totalRatings={ratings.totalRatings}
                    />

                    {/* Self-rating is not allowed - users cannot rate themselves */}


                  </TabsContent>
                  
                  <TabsContent value="privacy-settings" className="mt-4">
                    <PrivacySettings userType="wolontariusz" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            {/* Stats Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Twoje statystyki
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">{formatNumber(volunteerStats.totalHours)}</div>
                    <div className="text-xs text-muted-foreground">
                      {volunteerStats.totalHours === 1 ? 'Godzina wolontariatu' : 
                       volunteerStats.totalHours === 0 || volunteerStats.totalHours >= 5 ? 'Godzin wolontariatu' : 
                       'Godziny wolontariatu'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(volunteerStats.totalProjects)}</div>
                    <div className="text-xs text-muted-foreground">
                      {volunteerStats.totalProjects === 1 ? 'Ukończony projekt' : 
                       volunteerStats.totalProjects === 0 || volunteerStats.totalProjects >= 5 ? 'Ukończonych projektów' : 
                       'Ukończone projekty'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{formatNumber(volunteerStats.currentStreak)}</div>
                    <div className="text-xs text-muted-foreground">
                      {volunteerStats.currentStreak === 1 ? 'Tydzień z rzędu' : 
                       volunteerStats.currentStreak === 0 || volunteerStats.currentStreak >= 5 ? 'Tygodni z rzędu' : 
                       'Tygodnie z rzędu'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatNumber(volunteerStats.impactPoints)}</div>
                    <div className="text-xs text-muted-foreground">
                      {volunteerStats.impactPoints === 1 ? 'Punkt wpływu' : 
                       volunteerStats.impactPoints === 0 || volunteerStats.impactPoints >= 5 ? 'Punktów wpływu' : 
                       'Punkty wpływu'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Badge Categories Filter */}
            <Card>

            </Card>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 gap-3">
              {badges
                .filter(badge => selectedBadgeCategory === "all" || badge.category === selectedBadgeCategory)
                .map((badge) => {
                  const IconComponent = (() => {
                    switch (badge.icon) {
                      case 'star': return Star;
                      case 'heart': return Heart;
                      case 'medal': return Medal;
                      case 'crown': return Crown;
                      case 'trophy': return Trophy;
                      case 'target': return Target;
                      case 'award': return Award;
                      case 'flame': return Flame;
                      case 'zap': return Zap;
                      case 'bookOpen': return BookOpen;
                      case 'handshake': return Handshake;
                      case 'trendingUp': return TrendingUp;
                      default: return Star;
                    }
                  })();

                  const progressPercentage = Math.min((badge.currentProgress / badge.requirement) * 100, 100);
                  const isCompleted = badge.isUnlocked;
                  const isGrayedOut = !isCompleted;

                  return (
                    <Card key={badge.id} className={`relative overflow-hidden ${isCompleted ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                      <CardContent className="p-4">
                        {/* Badge Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto relative ${
                          isCompleted 
                            ? `bg-gradient-to-r ${badge.color} shadow-lg` 
                            : 'bg-gray-200'
                        }`}>
                          <IconComponent className={`h-6 w-6 ${
                            isGrayedOut 
                              ? 'text-gray-400' 
                              : badge.name === 'Mentor' || badge.name === 'Ambasador' || badge.name === 'Zmiana' ||
                                badge.color.includes('yellow') || badge.color.includes('orange') || badge.color.includes('amber') || 
                                badge.color.includes('lime') || badge.color.includes('cyan') || badge.color.includes('emerald-400') ||
                                badge.color.includes('teal-400') || badge.color.includes('indigo-400') || badge.color.includes('violet-400') ||
                                badge.color.includes('rose-400') || badge.color.includes('pink-400') || badge.color.includes('fuchsia-400') ||
                                badge.color.includes('purple-400') || badge.color.includes('indigo-400') || badge.color.includes('blue-400') ||
                                badge.color.includes('green-400') || badge.color.includes('emerald-400') || badge.color.includes('teal-400')
                                ? 'text-gray-800 drop-shadow-sm' // Dark text for light backgrounds with shadow
                                : 'text-white drop-shadow-sm' // White text for dark backgrounds with shadow
                          }`} />
                        </div>

                        {/* Badge Name and Description */}
                        <div className="text-center mb-3">
                          <h4 className={`text-sm font-medium mb-1 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {badge.name}
                          </h4>
                          <p className={`text-xs ${isCompleted ? 'text-gray-600' : 'text-gray-300'}`}>
                            {badge.description}
                          </p>
                        </div>

                        {/* Progress or Completion */}
                        {isCompleted ? (
                          <div className="text-center">
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Zdobyta
                            </Badge>
                            {badge.unlockedDate && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(badge.unlockedDate).toLocaleDateString('pl-PL')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div 
                                className={`h-2 rounded-full ${isGrayedOut ? 'bg-gray-300' : `bg-gradient-to-r ${badge.color}`}`}
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                            <p className={`text-xs text-center ${isGrayedOut ? 'text-gray-400' : 'text-gray-500'}`}>
                              {badge.currentProgress} / {badge.requirement}
                              {badge.category === 'time' && ' godzin'}
                              {badge.category === 'project' && ' projektów'}
                              {badge.category === 'consistency' && ' tygodni'}
                              {badge.category === 'impact' && ' punktów'}
                              {badge.category === 'leadership' && ' osób'}
                              {badge.category === 'welcome' && ''}
                            </p>
                          </div>
                        )}

                        {/* Rarity Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge 
                            variant="secondary"
                            className={`text-xs ${
                              isGrayedOut ? 'bg-gray-100 text-gray-400' :
                              badge.rarity === 'legendary' ? 'bg-purple-100 text-purple-800' :
                              badge.rarity === 'epic' ? 'bg-orange-100 text-orange-800' :
                              badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {badge.rarity === 'legendary' ? 'Legendarna' :
                             badge.rarity === 'epic' ? 'Epicka' :
                             badge.rarity === 'rare' ? 'Rzadka' :
                             'Zwykła'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            {/* Recent Achievements */}
            {badges.filter(badge => badge.isUnlocked && badge.unlockedDate).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Ostatnie osiągnięcia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {badges
                      .filter(badge => badge.isUnlocked && badge.unlockedDate)
                      .sort((a, b) => new Date(b.unlockedDate!).getTime() - new Date(a.unlockedDate!).getTime())
                      .slice(0, 3)
                      .map((badge) => {
                        const IconComponent = (() => {
                          switch (badge.icon) {
                            case 'star': return Star;
                            case 'heart': return Heart;
                            case 'medal': return Medal;
                            case 'crown': return Crown;
                            case 'trophy': return Trophy;
                            case 'target': return Target;
                            case 'award': return Award;
                            case 'flame': return Flame;
                            case 'zap': return Zap;
                            case 'bookOpen': return BookOpen;
                            case 'handshake': return Handshake;
                            case 'trendingUp': return TrendingUp;
                            default: return Star;
                          }
                        })();

                        return (
                          <div key={badge.id} className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r ${badge.color} text-white`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{badge.name}</p>
                              <p className="text-xs text-gray-600">
                                Zdobyta {new Date(badge.unlockedDate!).toLocaleDateString('pl-PL')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Badge to Unlock */}
            {(() => {
              const nextBadge = badges
                .filter(badge => !badge.isUnlocked)
                .sort((a, b) => {
                  const aProgress = (a.currentProgress / a.requirement) * 100;
                  const bProgress = (b.currentProgress / b.requirement) * 100;
                  return bProgress - aProgress;
                })[0];

              if (nextBadge) {
                const IconComponent = (() => {
                  switch (nextBadge.icon) {
                    case 'star': return Star;
                    case 'heart': return Heart;
                    case 'medal': return Medal;
                    case 'crown': return Crown;
                    case 'trophy': return Trophy;
                    case 'target': return Target;
                    case 'award': return Award;
                    case 'flame': return Flame;
                    case 'zap': return Zap;
                    case 'bookOpen': return BookOpen;
                    case 'handshake': return Handshake;
                    case 'trendingUp': return TrendingUp;
                    default: return Star;
                  }
                })();

                const progressPercentage = Math.min((nextBadge.currentProgress / nextBadge.requirement) * 100, 100);
                const remaining = nextBadge.requirement - nextBadge.currentProgress;

                return (
                  <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        Następna odznaka
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${nextBadge.color} text-white`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{nextBadge.name}</h4>
                          <p className="text-sm text-gray-600">{nextBadge.description}</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Postęp</span>
                          <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full bg-gradient-to-r ${nextBadge.color}`}
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-center text-gray-600">
                        Zostało: {remaining}
                        {nextBadge.category === 'hours' && ' godzin'}
                        {nextBadge.category === 'projects' && ' projektów'}
                        {nextBadge.category === 'streak' && ' tygodni'}
                        {nextBadge.category === 'impact' && ' punktów'}
                      </p>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })()}
          </TabsContent>


        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
        <div className="max-w-sm mx-auto">
          <div className="grid grid-cols-6 h-16">
            <button
              onClick={() => setActiveTab("offers")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "offers" 
                  ? "text-pink-600 bg-pink-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Search className="h-5 w-5" />
              <span className="text-xs">Oferty</span>
            </button>
            
            <button
              onClick={() => setActiveTab("my-applications")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "my-applications" 
                  ? "text-pink-600 bg-pink-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Heart className="h-5 w-5" />
              <span className="text-xs">Moje</span>
            </button>
            
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "calendar" 
                  ? "text-pink-600 bg-pink-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Kalendarz</span>
            </button>
            
            <button
              onClick={() => setActiveTab("map")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "map" 
                  ? "text-pink-600 bg-pink-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Map className="h-4 w-4" />
              <span className="text-xs">Mapa</span>
            </button>
            
            <button
              onClick={() => setActiveTab("badges")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "badges" 
                  ? "text-pink-600 bg-pink-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Award className="h-4 w-4" />
              <span className="text-xs">Odznaki</span>
            </button>
            
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "profile" || activeTab === "privacy"
                  ? "text-pink-600 bg-pink-50" 
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
    </div>
  );
}