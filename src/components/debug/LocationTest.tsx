import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertCircle, CheckCircle } from 'lucide-react';

export default function LocationTest() {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLocation = () => {
    setLoading(true);
    setError('');
    setLocation(null);

    console.log('Testing geolocation...');
    console.log('Navigator available:', !!navigator);
    console.log('Geolocation available:', !!navigator.geolocation);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location success:', position);
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        console.error('Location error:', error);
        let errorMsg = 'Unknown error';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out';
            break;
        }
        setError(errorMsg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testLocation} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Getting Location...' : 'Test Location'}
        </Button>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {location && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <div className="text-sm text-green-700">
              <div>Lat: {location.lat.toFixed(6)}</div>
              <div>Lng: {location.lng.toFixed(6)}</div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <div>Browser: {navigator.userAgent.split(' ')[0]}</div>
          <div>HTTPS: {typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'Yes' : 'No'}</div>
          <div>Geolocation: {navigator.geolocation ? 'Available' : 'Not Available'}</div>
        </div>
      </CardContent>
    </Card>
  );
}