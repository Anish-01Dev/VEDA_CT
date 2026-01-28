interface MedicalFacility {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'doctor' | 'pharmacy';
  lat: number;
  lon: number;
  distance: number;
  address?: string;
}

class OpenStreetMapService {
  private readonly OVERPASS_API = 'https://overpass-api.de/api/interpreter';

  async findNearbyMedicalFacilities(lat: number, lon: number, radius: number = 3000): Promise<MedicalFacility[]> {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        node["amenity"="clinic"](around:${radius},${lat},${lon});
        node["amenity"="doctors"](around:${radius},${lat},${lon});
        node["amenity"="pharmacy"](around:${radius},${lat},${lon});
        way["amenity"="hospital"](around:${radius},${lat},${lon});
        way["amenity"="clinic"](around:${radius},${lat},${lon});
        way["amenity"="doctors"](around:${radius},${lat},${lon});
        way["amenity"="pharmacy"](around:${radius},${lat},${lon});
      );
      out center;
    `;

    try {
      const response = await fetch(this.OVERPASS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: query
      });

      const data = await response.json();
      const facilities: MedicalFacility[] = [];

      data.elements.forEach((element: any) => {
        const facilityLat = element.lat || element.center?.lat;
        const facilityLon = element.lon || element.center?.lon;
        
        if (facilityLat && facilityLon) {
          const distance = this.calculateDistance(lat, lon, facilityLat, facilityLon);
          
          facilities.push({
            id: element.id.toString(),
            name: element.tags?.name || `Nearby ${element.tags?.amenity}`,
            type: this.mapAmenityType(element.tags?.amenity),
            lat: facilityLat,
            lon: facilityLon,
            distance: Math.round(distance * 100) / 100,
            address: this.buildAddress(element.tags)
          });
        }
      });

      return facilities.sort((a, b) => a.distance - b.distance).slice(0, 10);
    } catch (error) {
      console.error('Error fetching medical facilities:', error);
      return [];
    }
  }

  private mapAmenityType(amenity: string): 'hospital' | 'clinic' | 'doctor' | 'pharmacy' {
    switch (amenity) {
      case 'hospital': return 'hospital';
      case 'clinic': return 'clinic';
      case 'doctors': return 'doctor';
      case 'pharmacy': return 'pharmacy';
      default: return 'clinic';
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private buildAddress(tags: any): string {
    const parts = [];
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    return parts.join(', ') || 'Address not available';
  }
}

export const osmService = new OpenStreetMapService();
export type { MedicalFacility };