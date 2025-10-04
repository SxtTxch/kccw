import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Users, Star, Calendar } from 'lucide-react';

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
  distance: number;
}

interface GoogleMapProps {
  initiatives: Initiative[];
  onInitiativeSelect: (initiative: Initiative) => void;
  selectedInitiative: Initiative | null;
  userType: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleMap({ initiatives, onInitiativeSelect, selectedInitiative, userType }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        initializeMap();
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };

    checkGoogleMaps();
  }, []);

  useEffect(() => {
    if (isLoaded && mapInstanceRef.current) {
      updateMarkers();
    }
  }, [initiatives, isLoaded]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Default center (Warsaw, Poland)
    const defaultCenter = { lat: 52.2297, lng: 21.0122 };
    
    // Calculate bounds to fit all initiatives
    const bounds = new window.google.maps.LatLngBounds();
    initiatives.forEach(initiative => {
      bounds.extend(new window.google.maps.LatLng(initiative.coordinates.lat, initiative.coordinates.lng));
    });

    const map = new window.google.maps.Map(mapRef.current, {
      center: initiatives.length > 0 ? bounds.getCenter() : defaultCenter,
      zoom: initiatives.length > 0 ? 10 : 8,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // Fit bounds to show all markers
    if (initiatives.length > 0) {
      map.fitBounds(bounds);
    }

    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create info window
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }

    initiatives.forEach(initiative => {
      const marker = new window.google.maps.Marker({
        position: { lat: initiative.coordinates.lat, lng: initiative.coordinates.lng },
        map: mapInstanceRef.current,
        title: initiative.title,
        icon: {
          url: getMarkerIcon(initiative.category, initiative.urgency),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32)
        }
      });

      marker.addListener('click', () => {
        onInitiativeSelect(initiative);
        showInfoWindow(marker, initiative);
      });

      markersRef.current.push(marker);
    });
  };

  const showInfoWindow = (marker: google.maps.Marker, initiative: Initiative) => {
    if (!infoWindowRef.current) return;

    const content = `
      <div style="padding: 8px; max-width: 250px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #1f2937;">
          ${initiative.title}
        </h3>
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">
          ${initiative.organization}
        </p>
        <div style="display: flex; gap: 8px; margin: 4px 0; font-size: 11px; color: #6b7280;">
          <span>📍 ${initiative.distance}km</span>
          <span>👥 ${initiative.participants}/${initiative.maxParticipants}</span>
          <span>⭐ ${initiative.rating}</span>
        </div>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280;">
          ${initiative.description.substring(0, 100)}...
        </p>
      </div>
    `;

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open(mapInstanceRef.current, marker);
  };

  const getMarkerIcon = (category: string, urgency: string) => {
    const colors = {
      'Opieka nad zwierzętami': urgency === 'high' ? '#ef4444' : '#f59e0b',
      'Pomoc społeczna': urgency === 'high' ? '#dc2626' : '#3b82f6',
      'Praca z dziećmi': urgency === 'high' ? '#7c3aed' : '#8b5cf6',
      'Ekologia': urgency === 'high' ? '#059669' : '#10b981',
      'Edukacja': urgency === 'high' ? '#0891b2' : '#06b6d4'
    };

    const color = colors[category as keyof typeof colors] || '#6b7280';
    
    // Create SVG marker
    const svg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C10.48 2 6 6.48 6 12c0 8 10 18 10 18s10-10 10-18c0-5.52-4.48-10-10-10z" fill="${color}"/>
        <circle cx="16" cy="12" r="6" fill="white"/>
        <circle cx="16" cy="12" r="3" fill="${color}"/>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  if (!isLoaded) {
    return (
      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Ładowanie mapy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg border border-gray-200"
        style={{ minHeight: '256px' }}
      />
      
      {selectedInitiative && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">{selectedInitiative.title}</h4>
              <p className="text-sm text-blue-700 mb-2">{selectedInitiative.organization}</p>
              <div className="flex items-center gap-4 text-xs text-blue-600">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {selectedInitiative.participants}/{selectedInitiative.maxParticipants}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {selectedInitiative.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(selectedInitiative.startDate).toLocaleDateString('pl-PL')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
