import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Phone, Clock, Stethoscope } from 'lucide-react';
import { osmService, type MedicalFacility } from '@/lib/osm-service';

interface ClinicFinderProps {
  userLocation?: { lat: number; lng: number };
}

export default function ClinicFinderAI({ userLocation }: ClinicFinderProps) {
  const [facilities, setFacilities] = useState<MedicalFacility[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (userLocation) {
      findNearbyFacilities();
    }
  }, [userLocation]);

  const findNearbyFacilities = async () => {
    if (!userLocation) return;

    setLoading(true);
    try {
      const nearbyFacilities = await osmService.findNearbyMedicalFacilities(
        userLocation.lat, 
        userLocation.lng
      );
      
      setFacilities(nearbyFacilities);
      generateResponse(nearbyFacilities);
    } catch (error) {
      setMessage('Unable to find nearby facilities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateResponse = (facilities: MedicalFacility[]) => {
    if (facilities.length === 0) {
      setMessage('I could not find any medical facilities nearby. You may need to search in a wider area.');
      return;
    }

    const closest = facilities[0];
    const hospitals = facilities.filter(f => f.type === 'hospital');
    const clinics = facilities.filter(f => f.type === 'clinic' || f.type === 'doctor');
    const pharmacies = facilities.filter(f => f.type === 'pharmacy');

    let response = '';

    if (closest.distance < 1) {
      response += `I found ${closest.name} about ${Math.round(closest.distance * 1000)} meters from your location. `;
    } else {
      response += `I found ${closest.name} about ${closest.distance.toFixed(1)} kilometers from your location. `;
    }

    if (hospitals.length > 0) {
      response += `There ${hospitals.length === 1 ? 'is' : 'are'} ${hospitals.length} hospital${hospitals.length > 1 ? 's' : ''} nearby. `;
    }

    if (clinics.length > 0) {
      response += `There ${clinics.length === 1 ? 'is' : 'are'} ${clinics.length} clinic${clinics.length > 1 ? 's' : ''} in the area. `;
    }

    if (pharmacies.length > 0) {
      response += `There ${pharmacies.length === 1 ? 'is' : 'are'} ${pharmacies.length} pharmac${pharmacies.length > 1 ? 'ies' : 'y'} available. `;
    }

    response += 'Check the list below for detailed information and directions.';

    setMessage(response);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5" />
          AI Clinic Finder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Response */}
        {message && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">{message}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Finding nearby facilities...</p>
          </div>
        )}

        {/* No location */}
        {!userLocation && (
          <div className="text-center py-4">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Location access required to find nearby facilities</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}