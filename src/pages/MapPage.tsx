import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Search, 
  Phone, 
  Clock,
  Star,
  Stethoscope
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation-config";

interface HealthcareProvider {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "pharmacy" | "jan-aushadhi";
  address: string;
  distance: string;
  rating: number;
  phone?: string;
  hours: string;
  isOpen: boolean;
  specialties?: string[];
}

const mockProviders: HealthcareProvider[] = [
  {
    id: "1",
    name: "Government General Hospital",
    type: "hospital",
    address: "MG Road, Central District",
    distance: "0.8 km",
    rating: 4.2,
    phone: "+91-xxx-xxx-xxxx",
    hours: "24/7",
    isOpen: true,
    specialties: ["Emergency", "General Medicine", "Surgery"]
  },
  {
    id: "2",
    name: "Jan Aushadhi Kendra #142",
    type: "jan-aushadhi",
    address: "Near Bus Stand, Market Area",
    distance: "1.2 km",
    rating: 4.5,
    phone: "+91-xxx-xxx-xxxx",
    hours: "8 AM - 8 PM",
    isOpen: true
  },
  {
    id: "3",
    name: "City Health Clinic",
    type: "clinic",
    address: "Gandhi Chowk, Old City", 
    distance: "1.8 km",
    rating: 4.0,
    phone: "+91-xxx-xxx-xxxx",
    hours: "9 AM - 6 PM",
    isOpen: false,
    specialties: ["Family Medicine", "Pediatrics"]
  },
  {
    id: "4",
    name: "MedPlus Pharmacy",
    type: "pharmacy",
    address: "Station Road, Commercial Complex",
    distance: "2.1 km",
    rating: 4.3,
    phone: "+91-xxx-xxx-xxxx",
    hours: "8 AM - 10 PM",
    isOpen: true
  }
];

const typeColors = {
  hospital: "bg-[#E53E3E20] text-[#E53E3E] border-[#E53E3E]/20",
  clinic: "bg-[#4A9B8E20] text-[#4A9B8E] border-[#4A9B8E]/20",
  pharmacy: "bg-[#3182CE20] text-[#3182CE] border-[#3182CE]/20",
  "jan-aushadhi": "bg-[#38A16920] text-[#38A169] border-[#38A169]/20"
};

const typeLabels = {
  hospital: "Hospital",
  clinic: "Clinic", 
  pharmacy: "Pharmacy",
  "jan-aushadhi": "Jan Aushadhi"
};

const MapPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const filteredProviders = mockProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || provider.type === selectedType;
    return matchesSearch && matchesType;
  });

  const requestLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
        }
      );
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <div className="min-h-screen bg-[#FEFCF3] pb-20 font-inter">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 bg-white/95 border-b border-[#E2E8F0] px-3 sm:px-4 py-3 sm:py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="hover:bg-[#4A9B8E10]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#4A9B8E20] text-[#4A9B8E]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#2D3748] font-nunito">Nearby Healthcare</h1>
              <p className="text-sm text-[#4A5568] font-inter">Find hospitals, clinics & pharmacies</p>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="px-3 sm:px-4 py-4 sm:py-6 space-y-6 max-w-7xl mx-auto">
        {/* Search and Filters */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#F8F5F0] rounded-2xl p-6"
        >
          <Card className="bg-white border border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                <Search className="w-5 h-5 text-[#4A9B8E]" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hospitals, clinics, pharmacies..."
                  className="pl-10 border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                />
              </div>

              {/* Type Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("all")}
                  className={`text-xs sm:text-sm font-semibold ${
                    selectedType === "all" 
                      ? 'bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white' 
                      : 'border-[#E2E8F0] hover:bg-[#F8F5F0] text-[#2D3748]'
                  }`}
                >
                  All
                </Button>
                {Object.entries(typeLabels).map(([type, label]) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className={`text-xs sm:text-sm font-semibold ${
                      selectedType === type 
                        ? 'bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white' 
                        : 'border-[#E2E8F0] hover:bg-[#F8F5F0] text-[#2D3748]'
                    }`}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* Location Status */}
              <div className="flex items-center gap-3 p-3 bg-[#F8F5F0] rounded-lg">
                <div className="w-8 h-8 bg-[#4A9B8E20] rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#4A9B8E]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#2D3748] font-nunito">
                    {userLocation ? "Location Found" : "Getting Location..."}
                  </p>
                  <p className="text-xs text-[#4A5568] font-inter">
                    {userLocation 
                      ? `Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}`
                      : "Please allow location access"
                    }
                  </p>
                </div>
                {isLoadingLocation && (
                  <div className="w-4 h-4 border-2 border-[#4A9B8E]/30 border-t-[#4A9B8E] rounded-full animate-spin" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Results */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#F8F5F0] rounded-2xl p-6"
        >
          <Card className="bg-white border border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#4A9B8E]" />
                Healthcare Providers ({filteredProviders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProviders.map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-[#F8F5F0] rounded-lg space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#2D3748] font-nunito mb-1">
                          {provider.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={cn("text-xs", typeColors[provider.type])}>
                            {typeLabels[provider.type]}
                          </Badge>
                          <Badge variant={provider.isOpen ? "default" : "outline"} 
                                 className={cn("text-xs", 
                                   provider.isOpen 
                                     ? "bg-[#38A169] text-white" 
                                     : "border-[#E2E8F0] text-[#4A5568] bg-white"
                                 )}>
                            {provider.isOpen ? "Open" : "Closed"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#F6E05E] fill-current" />
                        <span className="text-sm font-semibold text-[#2D3748] font-nunito">
                          {provider.rating}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#4A9B8E]" />
                        <span className="text-sm text-[#4A5568] font-inter">{provider.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-[#4A9B8E]" />
                        <span className="text-sm text-[#4A5568] font-inter">{provider.distance}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#4A9B8E]" />
                        <span className="text-sm text-[#4A5568] font-inter">{provider.hours}</span>
                      </div>
                    </div>

                    {/* Specialties */}
                    {provider.specialties && provider.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {provider.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-white border-[#E2E8F0] text-[#4A5568]">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-[#E2E8F0]">
                      {provider.phone && (
                        <Button variant="outline" size="sm" className="flex-1 border-[#E2E8F0] hover:bg-[#F8F5F0]">
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="flex-1 border-[#E2E8F0] hover:bg-[#F8F5F0]">
                        <Navigation className="w-4 h-4 mr-2" />
                        Directions
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>

      <BottomNav items={navItems} />
    </div>
  );
};

export default MapPage;