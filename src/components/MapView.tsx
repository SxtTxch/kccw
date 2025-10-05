import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// Google Maps will be implemented directly in this component
import { 
  MapPin, 
  Navigation, 
  Search, 
  Filter,
  Users,
  Clock,
  Calendar,
  Star,
  Heart,
  Building2,
  GraduationCap,
  Eye,
  Phone,
  Mail,
  Globe,
  Target,
  Plus,
  Route,
  Save
} from "lucide-react";

interface MapViewProps {
  userType: string;
}

interface Initiative {
  id: number;
  title: string;
  organization: string;
  organizationType: string;
  category: string;
  description: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  participants: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed';
  urgency: 'low' | 'medium' | 'high';
  contactEmail: string;
  contactPhone: string;
  rating: number;
  distance: number; // km from user
}

interface Route {
  id: string;
  ownerId: string;
  ownerName: string;
  startPoint: {
    lat: number;
    lng: number;
    address: string;
  };
  endPoint: {
    lat: number;
    lng: number;
    address: string;
  };
  distance: string;
  duration: string;
  createdAt: Date;
  isActive: boolean;
}

const mockInitiatives: Initiative[] = [
  {
    id: 1,
    title: "Pomoc w schronisku dla zwierząt",
    organization: "Fundacja Przyjaciół Zwierząt",
    organizationType: "Fundacja",
    category: "Opieka nad zwierzętami",
    description: "Codziennia opieka nad zwierzętami - karmienie, spacery, sprzątanie.",
    address: "ul. Schroniskowa 15, 02-777 Warszawa",
    coordinates: { lat: 52.1672, lng: 20.9679 },
    participants: 8,
    maxParticipants: 12,
    startDate: "2024-10-15",
    endDate: "2024-12-15",
    status: 'active',
    urgency: 'medium',
    contactEmail: "wolontariat@fundacjazwierzat.pl",
    contactPhone: "+48 22 123 45 67",
    rating: 4.8,
    distance: 2.3
  },
  {
    id: 2,
    title: "Pakowanie paczek świątecznych",
    organization: "Caritas Warszawa",
    organizationType: "Organizacja religijna",
    category: "Pomoc społeczna",
    description: "Przygotowywanie paczek żywnościowych dla rodzin w potrzebie.",
    address: "ul. Krakowskie Przedmieście 52/54, 00-322 Warszawa",
    coordinates: { lat: 52.2430, lng: 21.0150 },
    participants: 15,
    maxParticipants: 20,
    startDate: "2024-12-15",
    endDate: "2024-12-24",
    status: 'upcoming',
    urgency: 'high',
    contactEmail: "wolontariat@caritas.warszawa.pl",
    contactPhone: "+48 22 234 56 78",
    rating: 4.9,
    distance: 5.1
  },
  {
    id: 3,
    title: "Zajęcia z dziećmi w świetlicy",
    organization: "Stowarzyszenie Dziecięcy Uśmiech",
    organizationType: "Stowarzyszenie",
    category: "Praca z dziećmi",
    description: "Prowadzenie zajęć plastycznych i gier dla dzieci w wieku 6-12 lat.",
    address: "ul. Nowa 24, 31-506 Kraków",
    coordinates: { lat: 50.0647, lng: 19.9450 },
    participants: 5,
    maxParticipants: 8,
    startDate: "2024-10-25",
    endDate: "2024-11-25",
    status: 'active',
    urgency: 'low',
    contactEmail: "kontakt@dzieciecyusmiech.pl",
    contactPhone: "+48 12 345 67 89",
    rating: 4.7,
    distance: 1.8
  },
  {
    id: 4,
    title: "Pomoc seniorom w zakupach",
    organization: "Fundacja Pomocna Dłoń",
    organizationType: "Fundacja",
    category: "Pomoc społeczna",
    description: "Pomoc osobom starszym w codziennych zakupach i sprawunkach.",
    address: "ul. Marszałkowska 142, 00-061 Warszawa",
    coordinates: { lat: 52.2297, lng: 21.0122 },
    participants: 12,
    maxParticipants: 15,
    startDate: "2024-10-10",
    endDate: "2024-12-31",
    status: 'active',
    urgency: 'medium',
    contactEmail: "wolontariat@pomocnadlon.org",
    contactPhone: "+48 22 456 78 90",
    rating: 4.6,
    distance: 3.7
  },
  {
    id: 5,
    title: "Sprzątanie parku miejskiego",
    organization: "Ekolodia Warszawa",
    organizationType: "Stowarzyszenie",
    category: "Ekologia",
    description: "Sprzątanie i porządkowanie terenów zielonych w parku.",
    address: "Park Łazienkowski, 00-460 Warszawa",
    coordinates: { lat: 52.2148, lng: 21.0350 },
    participants: 20,
    maxParticipants: 30,
    startDate: "2024-11-02",
    endDate: "2024-11-02",
    status: 'upcoming',
    urgency: 'low',
    contactEmail: "akcje@ekolodia.pl",
    contactPhone: "+48 22 567 89 01",
    rating: 4.4,
    distance: 4.2
  },
  {
    id: 6,
    title: "Nauka języka polskiego dla uchodźców",
    organization: "Centrum Pomocy Uchodźcom",
    organizationType: "Fundacja",
    category: "Edukacja",
    description: "Prowadzenie bezpłatnych lekcji języka polskiego dla osób potrzebujących.",
    address: "ul. Koszykowa 61, 00-667 Warszawa",
    coordinates: { lat: 52.2180, lng: 20.9962 },
    participants: 8,
    maxParticipants: 12,
    startDate: "2024-10-20",
    endDate: "2024-12-20",
    status: 'active',
    urgency: 'high',
    contactEmail: "edukacja@cpu.org.pl",
    contactPhone: "+48 22 678 90 12",
    rating: 4.9,
    distance: 2.9
  }
];

export function MapView({ userType }: MapViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [showList, setShowList] = useState(false);
  
  // Route creation state
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [routeStartPoint, setRouteStartPoint] = useState<{lat: number, lng: number} | null>(null);
  const [routeEndPoint, setRouteEndPoint] = useState<{lat: number, lng: number} | null>(null);
  const [routeMarkers, setRouteMarkers] = useState<any[]>([]);
  const [routeDirections, setRouteDirections] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  // Route creation functions
  const startRouteCreation = () => {
    console.log('Starting route creation...');
    setIsCreatingRoute(true);
    setRouteStartPoint(null);
    setRouteEndPoint(null);
    // Clear existing route markers
    routeMarkers.forEach(marker => marker.setMap(null));
    setRouteMarkers([]);
    if (routeDirections) {
      routeDirections.setMap(null);
      setRouteDirections(null);
    }
    console.log('Route creation mode activated');
  };

  const cancelRouteCreation = () => {
    setIsCreatingRoute(false);
    setRouteStartPoint(null);
    setRouteEndPoint(null);
    // Clear route markers
    routeMarkers.forEach(marker => marker.setMap(null));
    setRouteMarkers([]);
    if (routeDirections) {
      routeDirections.setMap(null);
      setRouteDirections(null);
    }
  };

  const handleMapClick = (event: any, map: any) => {
    console.log('Map clicked!', { isCreatingRoute, routeStartPoint, routeEndPoint });
    
    if (!isCreatingRoute) {
      console.log('Not in route creation mode');
      return;
    }

    const latLng = event.latLng;
    const lat = latLng.lat();
    const lng = latLng.lng();

    console.log('Click coordinates:', { lat, lng });

    if (!routeStartPoint) {
      console.log('Setting start point');
      // Set start point
      setRouteStartPoint({ lat, lng });
      addRouteMarker(map, lat, lng, 'A', '#4CAF50');
    } else if (!routeEndPoint) {
      console.log('Setting end point');
      // Set end point
      setRouteEndPoint({ lat, lng });
      addRouteMarker(map, lat, lng, 'B', '#F44336');
      // Calculate route
      calculateRoute(map);
    }
  };

  const addRouteMarker = (map: any, lat: number, lng: number, label: string, color: string) => {
    console.log('Adding route marker:', { lat, lng, label, color });
    
    const marker = new (window as any).google.maps.Marker({
      position: { lat, lng },
      map: map,
      label: {
        text: label,
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px'
      },
      icon: {
        path: (window as any).google.maps.SymbolPath.CIRCLE,
        scale: 20,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 3
      }
    });
    
    console.log('Route marker created:', marker);
    setRouteMarkers(prev => [...prev, marker]);
  };

  const calculateRoute = (map: any) => {
    if (!routeStartPoint || !routeEndPoint) return;

    console.log('Calculating route between:', routeStartPoint, routeEndPoint);

    const directionsService = new (window as any).google.maps.DirectionsService();
    const directionsRenderer = new (window as any).google.maps.DirectionsRenderer({
      suppressMarkers: true, // We have our own markers
      polylineOptions: {
        strokeColor: '#2196F3',
        strokeWeight: 4
      }
    });

    directionsRenderer.setMap(map);

    directionsService.route({
      origin: routeStartPoint,
      destination: routeEndPoint,
      travelMode: (window as any).google.maps.TravelMode.DRIVING
    }, (result: any, status: any) => {
      if (status === 'OK') {
        console.log('Route calculated successfully');
        directionsRenderer.setDirections(result);
        setRouteDirections(directionsRenderer);
      } else {
        console.error('Directions request failed:', status);
      }
    });
  };

  const saveRoute = () => {
    if (!routeStartPoint || !routeEndPoint) return;

    console.log('Saving route...');
    // Here you can save the route to Firestore
    // For now, just reset the route creation
    setIsCreatingRoute(false);
    setRouteStartPoint(null);
    setRouteEndPoint(null);
    console.log('Route saved successfully');
  };

  // Google Maps implementation
  useEffect(() => {
    let map: any;

    const initialize = () => {
      const mapElement = document.getElementById("map");
      if (!mapElement) {
        console.error("Map element not found");
        return;
      }

      console.log("Initializing map...");

      const mapOptions = {
        zoom: 12,
        center: new (window as any).google.maps.LatLng(50.0647, 19.9450), // Krakow center
        mapTypeId: (window as any).google.maps.MapTypeId.ROADMAP,
        restriction: {
          latLngBounds: {
            north: 50.2,
            south: 49.9,
            east: 20.2,
            west: 19.7
          },
          strictBounds: true
        },
        minZoom: 10,
        maxZoom: 16,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        panControl: false
      };

      map = new (window as any).google.maps.Map(mapElement, mapOptions);

      // Add click listener
      map.addListener('click', (event: any) => {
        handleMapClick(event, map);
      });

      console.log("Map initialized successfully");
    };

    // Load Google Maps script if not already loaded
    if (!(window as any).google || !(window as any).google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCmVW69-bZkZ4atEYHSLZg5TMIjJc1Fsyw&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Set global callback
      (window as any).initMap = initialize;
      
      script.onload = () => {
        console.log('Google Maps script loaded');
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
      };
      
      document.head.appendChild(script);
    } else {
      // Google Maps already loaded, initialize directly
      initialize();
    }

    // Cleanup function
    return () => {
      // Clean up any existing markers
      markers.forEach(marker => marker.setMap(null));
    };
  }, []);

  const categories = [
    "Opieka nad zwierzętami",
    "Pomoc społeczna", 
    "Praca z dziećmi",
    "Ekologia",
    "Edukacja"
  ];

  const filteredInitiatives = mockInitiatives.filter(initiative => {
    const matchesSearch = initiative.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         initiative.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         initiative.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || initiative.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || initiative.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktywne';
      case 'upcoming': return 'Nadchodzące';
      case 'completed': return 'Zakończone';
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Opieka nad zwierzętami': return Heart;
      case 'Pomoc społeczna': return Users;
      case 'Praca z dziećmi': return GraduationCap;
      case 'Ekologia': return Globe;
      case 'Edukacja': return Building2;
      default: return Target;
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="mb-2">Mapa inicjatyw</h2>
        <p className="text-sm text-muted-foreground">Znajdź wolontariaty w Twojej okolicy</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj inicjatyw..."
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
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="active">Aktywne</SelectItem>
                <SelectItem value="upcoming">Nadchodzące</SelectItem>
                <SelectItem value="completed">Zakończone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Google Maps */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Google Maps Component */}
            <div className="relative">
              <div id="map" style={{ width: '100%', height: '400px' }}></div>
              
              {/* Accessibility Button */}
              <button
                className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => {
                  // Announce current map state to screen readers
                  const announcement = document.createElement('div');
                  announcement.setAttribute('aria-live', 'polite');
                  announcement.setAttribute('aria-atomic', 'true');
                  announcement.className = 'sr-only';
                  announcement.textContent = 'Mapa inicjatyw wolontariackich. Centrum: Kraków. Zoom: 12. Użyj kółka myszy do przybliżania, podwójnego kliknięcia do zoom, przeciągnij aby przesunąć mapę.';
                  document.body.appendChild(announcement);
                  
                  // Remove after announcement
                  setTimeout(() => {
                    document.body.removeChild(announcement);
                  }, 3000);
                }}
                aria-label="Informacje o dostępności mapy"
                title="Informacje o dostępności mapy"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                  />
                </svg>
              </button>
            </div>

            {/* Route Creation Controls */}
            <div className="space-y-3">
              {!isCreatingRoute ? (
                <Button onClick={startRouteCreation} className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Dodaj Trasę
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {!routeStartPoint ? 'Kliknij na mapie aby wybrać punkt A' : 
                       !routeEndPoint ? 'Kliknij na mapie aby wybrać punkt B' : 
                       'Trasa gotowa do zapisania'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={saveRoute} 
                      disabled={!routeStartPoint || !routeEndPoint}
                      className="flex-1"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Zapisz Trasę
                    </Button>
                    <Button 
                      onClick={cancelRouteCreation} 
                      variant="outline"
                      className="flex-1"
                    >
                      Anuluj
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Map Info */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Znaleziono {filteredInitiatives.length} inicjatyw w okolicy
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowList(!showList)}
            >
              {showList ? 'Pokaż mapę' : 'Pokaż listę'}
            </Button>
            <Button variant="outline" size="sm">
              <Navigation className="h-4 w-4 mr-2" />
              Moja lokalizacja
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Selected Initiative Details */}
      {selectedInitiative && (
        <Card className="border-2 border-primary">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">{selectedInitiative.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 mb-2">
                  <Building2 className="h-4 w-4" />
                  {selectedInitiative.organization}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className={`${getStatusColor(selectedInitiative.status)}`}>
                  {getStatusLabel(selectedInitiative.status)}
                </Badge>
                <Badge className={`${getUrgencyColor(selectedInitiative.urgency)} border text-xs`}>
                  {selectedInitiative.urgency === 'high' ? 'Pilne' : 
                   selectedInitiative.urgency === 'medium' ? 'Średnie' : 'Niskie'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {selectedInitiative.distance} km
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {selectedInitiative.participants}/{selectedInitiative.maxParticipants}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(selectedInitiative.startDate).toLocaleDateString('pl-PL')}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {selectedInitiative.rating}/5.0
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="mb-3">
              <Badge variant="secondary" className="mb-2">{selectedInitiative.category}</Badge>
              <p className="text-sm mb-3">{selectedInitiative.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedInitiative.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{selectedInitiative.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{selectedInitiative.contactPhone}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {userType === "wolontariusz" && (
                <Button size="sm" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Zgłoś się
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Szczegóły
              </Button>
              <Button variant="outline" size="sm">
                <Navigation className="h-4 w-4 mr-2" />
                Dojazd
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {showList && (
        <div className="space-y-3">
          {filteredInitiatives.length > 0 ? (
            filteredInitiatives.map(initiative => {
              const IconComponent = getCategoryIcon(initiative.category);
              return (
                <Card 
                  key={initiative.id} 
                  className={`cursor-pointer transition-all duration-200 hover:border-primary ${
                    selectedInitiative?.id === initiative.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedInitiative(initiative)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base mb-1">{initiative.title}</CardTitle>
                          <CardDescription className="text-sm mb-2">{initiative.organization}</CardDescription>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {initiative.distance} km
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {initiative.participants}/{initiative.maxParticipants}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {initiative.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`${getStatusColor(initiative.status)} text-xs`}>
                          {getStatusLabel(initiative.status)}
                        </Badge>
                        {initiative.urgency === 'high' && (
                          <Badge className={`${getUrgencyColor(initiative.urgency)} border text-xs`}>
                            Pilne
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nie znaleziono inicjatyw spełniających kryteria</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Location Permission Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Navigation className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-blue-800 mb-1">Lokalizacja</h4>
              <p className="text-sm text-blue-700">
                Aby pokazać najlepsze dopasowanie, aplikacja może wykorzystywać Twoją lokalizację. 
                Dane lokalizacji nie są przechowywane ani udostępniane stronom trzecim.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}