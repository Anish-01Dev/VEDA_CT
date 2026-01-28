import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  Pill,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { pharmacyDB, type Pharmacy, type Medicine, type MedicineStock } from '@/lib/pharmacy-db';

const MedicineAvailability = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [availability, setAvailability] = useState<(MedicineStock & { pharmacy: Pharmacy })[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPharmacies();
    loadSampleData();
  }, []);

  const loadPharmacies = async () => {
    try {
      const allPharmacies = await pharmacyDB.getAllPharmacies();
      setPharmacies(allPharmacies);
    } catch (error) {
      console.error('Failed to load pharmacies:', error);
    }
  };

  const loadSampleData = async () => {
    // Add sample pharmacies and medicines for demo
    const samplePharmacies: Pharmacy[] = [
      {
        id: '1',
        name: 'Apollo Pharmacy',
        address: 'Main Street, Rural Area',
        phone: '+91-9876543210',
        coordinates: { lat: 28.6139, lng: 77.2090 },
        isOpen: true,
        openingHours: '8:00 AM - 10:00 PM',
        lastUpdated: new Date()
      },
      {
        id: '2',
        name: 'MedPlus',
        address: 'Village Center, Block A',
        phone: '+91-9876543211',
        coordinates: { lat: 28.6129, lng: 77.2080 },
        isOpen: true,
        openingHours: '9:00 AM - 9:00 PM',
        lastUpdated: new Date()
      }
    ];

    const sampleMedicines: Medicine[] = [
      {
        id: '1',
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        category: 'Pain Relief',
        manufacturer: 'Generic Pharma',
        strength: '500mg'
      },
      {
        id: '2',
        name: 'Amoxicillin 250mg',
        genericName: 'Amoxicillin',
        category: 'Antibiotic',
        manufacturer: 'Beta Pharma',
        strength: '250mg'
      }
    ];

    for (const pharmacy of samplePharmacies) {
      await pharmacyDB.addPharmacy(pharmacy);
    }

    for (const medicine of sampleMedicines) {
      await pharmacyDB.addMedicine(medicine);
    }

    // Add sample stock
    await pharmacyDB.updateStock({
      id: '1',
      pharmacyId: '1',
      medicineId: '1',
      quantity: 50,
      price: 25,
      expiryDate: new Date('2025-12-31'),
      isAvailable: true,
      lastUpdated: new Date()
    });

    await pharmacyDB.updateStock({
      id: '2',
      pharmacyId: '2',
      medicineId: '1',
      quantity: 0,
      price: 30,
      expiryDate: new Date('2025-12-31'),
      isAvailable: false,
      lastUpdated: new Date()
    });
  };

  const searchMedicines = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await pharmacyDB.searchMedicines(searchQuery);
      setMedicines(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAvailability = async (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsLoading(true);
    
    try {
      const stocks = await pharmacyDB.getMedicineAvailability(medicine.id);
      const stockWithPharmacy = await Promise.all(
        stocks.map(async (stock) => {
          const pharmacy = pharmacies.find(p => p.id === stock.pharmacyId);
          return { ...stock, pharmacy: pharmacy! };
        })
      );
      setAvailability(stockWithPharmacy.filter(s => s.pharmacy));
    } catch (error) {
      console.error('Failed to check availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3">
        <Pill className="w-8 h-8 text-green-600" />
        <h1 className="text-2xl font-bold">Medicine Availability</h1>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          Real-time Updates
        </Badge>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Medicines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by medicine name or generic name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchMedicines()}
            />
            <Button onClick={searchMedicines} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {medicines.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Search Results:</h3>
              {medicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => checkAvailability(medicine)}
                >
                  <div>
                    <p className="font-medium">{medicine.name}</p>
                    <p className="text-sm text-gray-500">
                      {medicine.genericName} • {medicine.category}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Check Availability
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability Results */}
      {selectedMedicine && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Availability for {selectedMedicine.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availability.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No availability data found for this medicine
              </p>
            ) : (
              <div className="space-y-4">
                {availability.map((stock) => (
                  <div key={stock.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{stock.pharmacy.name}</h3>
                          {stock.isAvailable ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {stock.pharmacy.address}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {stock.pharmacy.phone}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <span>Quantity: {stock.quantity}</span>
                          <span>Price: ₹{stock.price}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {stock.pharmacy.openingHours}
                          </div>
                        </div>

                        <p className="text-xs text-gray-500">
                          Last updated: {new Date(stock.lastUpdated).toLocaleString()}
                        </p>
                      </div>

                      {stock.isAvailable && (
                        <div className="text-right">
                          <Button size="sm" className="mb-2">
                            Reserve
                          </Button>
                          <br />
                          <Button variant="outline" size="sm">
                            Call Pharmacy
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Nearby Pharmacies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Nearby Pharmacies ({pharmacies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pharmacies.map((pharmacy) => (
              <div key={pharmacy.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{pharmacy.name}</h3>
                  <Badge variant={pharmacy.isOpen ? 'default' : 'secondary'}>
                    {pharmacy.isOpen ? 'Open' : 'Closed'}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {pharmacy.address}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {pharmacy.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {pharmacy.openingHours}
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm">
                    View Stock
                  </Button>
                  <Button variant="outline" size="sm">
                    Get Directions
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineAvailability;