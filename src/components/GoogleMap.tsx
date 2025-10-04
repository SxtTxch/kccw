import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface GoogleMapProps {
  initiatives: Array<{
    id: number;
    title: string;
    coordinates: { lat: number; lng: number };
    category: string;
    status: 'active' | 'upcoming' | 'completed';
    urgency: 'low' | 'medium' | 'high';
  }>;
  onInitiativeSelect?: (initiative: any) => void;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function GoogleMap({ initiatives, onInitiativeSelect }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState(null);

  useEffect(() => {
    // Set up the global callback
    window.initMap = () => {
      setIsLoaded(true);
      initializeMap();
    };

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      initializeMap();
    }

    // Cleanup function
    return () => {
      // Don't remove the global callback as it might be used by other components
    };
  }, []);

  useEffect(() => {
    if (isLoaded && mapInstanceRef.current) {
      updateMarkers();
    }
  }, [initiatives, isLoaded]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Krakow center coordinates
    const krakowCenter = { lat: 50.0647, lng: 19.9450 };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: krakowCenter,
      zoom: 13,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      gestureHandling: 'greedy',
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,
      restriction: {
        latLngBounds: {
          north: 50.2,
          south: 49.9,
          east: 20.2,
          west: 19.7
        },
        strictBounds: true
      }
    });

    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each initiative
    initiatives.forEach(initiative => {
      const marker = new window.google.maps.Marker({
        position: initiative.coordinates,
        map: mapInstanceRef.current,
        title: initiative.title,
        icon: getMarkerIcon(initiative.category, initiative.status, initiative.urgency)
      });

      // Add click listener
      marker.addListener('click', () => {
        setSelectedInitiative(initiative);
        if (onInitiativeSelect) {
          onInitiativeSelect(initiative);
        }
      });

      markersRef.current.push(marker);
    });
  };

  const getMarkerIcon = (category: string, status: string, urgency: string) => {
    const getColor = () => {
      if (status === 'completed') return '#6B7280'; // gray
      if (urgency === 'high') return '#EF4444'; // red
      if (urgency === 'medium') return '#F59E0B'; // yellow
      return '#10B981'; // green
    };

    const getSize = () => {
      if (urgency === 'high') return 40;
      if (urgency === 'medium') return 35;
      return 30;
    };

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: getColor(),
      fillOpacity: 0.8,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: getSize() / 10
    };
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Ładowanie mapy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 rounded-lg border border-gray-200 overflow-hidden">
      {/* Google Maps Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '300px' }}
      />

      {/* Initiative Info Overlay */}
      {selectedInitiative && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-3 border">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <h4 className="font-medium text-sm">{selectedInitiative.title}</h4>
              <p className="text-xs text-muted-foreground">
                {selectedInitiative.status === 'active' ? 'Aktywne' : 
                 selectedInitiative.status === 'upcoming' ? 'Nadchodzące' : 'Zakończone'}
                {selectedInitiative.urgency === 'high' && ' • Pilne'}
              </p>
            </div>
            <button
              onClick={() => setSelectedInitiative(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
