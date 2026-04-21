import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, MapPin, Navigation, Search,
  Star, Stethoscope, Loader2, LocateFixed, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { navItems } from "@/lib/navigation-config";
import { osmService, type MedicalFacility } from "@/lib/osm-service";
import { cn } from "@/lib/utils";

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const typeColors: Record<string, string> = {
  hospital: "bg-red-100 text-red-600 border-red-200",
  clinic: "bg-teal-100 text-teal-600 border-teal-200",
  doctor: "bg-teal-100 text-teal-600 border-teal-200",
  pharmacy: "bg-blue-100 text-blue-600 border-blue-200",
};

const typeIcon: Record<string, string> = {
  hospital: "🏥",
  clinic: "🩺",
  doctor: "👨‍⚕️",
  pharmacy: "💊",
};

const markerColor: Record<string, string> = {
  hospital: "#E53E3E",
  clinic: "#4A9B8E",
  doctor: "#4A9B8E",
  pharmacy: "#3182CE",
};

const mockFacilities: MedicalFacility[] = [
  { id: "1", name: "Government General Hospital", type: "hospital", lat: 28.6139, lon: 77.209, distance: 0.8, address: "MG Road, Central District" },
  { id: "2", name: "City Health Clinic", type: "clinic", lat: 28.6155, lon: 77.211, distance: 1.2, address: "Gandhi Chowk, Old City" },
  { id: "3", name: "MedPlus Pharmacy", type: "pharmacy", lat: 28.612, lon: 77.207, distance: 1.8, address: "Station Road, Commercial Complex" },
  { id: "4", name: "Apollo Clinic", type: "clinic", lat: 28.617, lon: 77.213, distance: 2.1, address: "Sector 12, New Delhi" },
];

const FILTERS = ["all", "hospital", "clinic", "doctor", "pharmacy"] as const;

function FlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 16, { duration: 1 });
  }, [position, map]);
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [facilities, setFacilities] = useState<MedicalFacility[]>(mockFacilities);
  const [selected, setSelected] = useState<MedicalFacility | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filtered = facilities.filter(f => {
    const matchType = filter === "all" || f.type === filter;
    const matchQuery =
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      (f.address ?? "").toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const pos: [number, number] = [coords.latitude, coords.longitude];
        setUserPos(pos);
        setLocating(false);
        setLoading(true);
        try {
          const data = await osmService.findNearbyMedicalFacilities(coords.latitude, coords.longitude);
          if (data.length) setFacilities(data);
        } finally {
          setLoading(false);
        }
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const selectFacility = (f: MedicalFacility) => {
    setSelected(f);
    cardRefs.current[f.id]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const mapCenter: [number, number] = userPos ?? [28.6139, 77.209];

  return (
    <div className="flex flex-col h-screen bg-[#FEFCF3] font-inter overflow-hidden">
      {/* Header */}
      <header className="shrink-0 z-50 bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="hover:bg-[#4A9B8E10]">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="p-2 rounded-lg bg-[#4A9B8E20] text-[#4A9B8E]">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-[#2D3748] font-nunito leading-tight">Nearby Healthcare</h1>
          <p className="text-xs text-[#4A5568]">Hospitals, clinics & pharmacies</p>
        </div>
        <Button
          size="sm"
          onClick={locate}
          disabled={locating}
          className="bg-[#4A9B8E] hover:bg-[#3d8578] text-white gap-1.5 shrink-0"
        >
          {locating
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <LocateFixed className="w-4 h-4" />}
          <span className="hidden sm:inline">{locating ? "Locating…" : "My Location"}</span>
        </Button>
      </header>

      {/* Split-screen body */}
      <div className="flex flex-1 overflow-hidden pb-16 md:pb-0">

        {/* LEFT — Clinic list panel */}
        <div className="w-full md:w-[380px] shrink-0 flex flex-col border-r border-[#E2E8F0] bg-white overflow-hidden">

          {/* Search + filters */}
          <div className="p-3 space-y-2 border-b border-[#E2E8F0] shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search facilities…"
                className="pl-9 h-9 text-sm border-[#E2E8F0] focus:border-[#4A9B8E]"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-[#4A5568]" />
                </button>
              )}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {FILTERS.map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors",
                    filter === t
                      ? "bg-[#4A9B8E] text-white border-[#4A9B8E]"
                      : "bg-white text-[#4A5568] border-[#E2E8F0] hover:bg-[#F8F5F0]"
                  )}
                >
                  {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Cards list */}
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-10 text-[#4A9B8E]">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Finding nearby facilities…</span>
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 text-[#4A5568]">
                <Stethoscope className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No facilities found</p>
              </div>
            )}

            <AnimatePresence>
              {!loading && filtered.map((f, i) => (
                <motion.div
                  key={f.id}
                  ref={el => { cardRefs.current[f.id] = el; }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => selectFacility(f)}
                  className={cn(
                    "p-4 border-b border-[#F0EDE8] cursor-pointer transition-all",
                    selected?.id === f.id
                      ? "bg-[#4A9B8E08] border-l-[3px] border-l-[#4A9B8E]"
                      : "hover:bg-[#FAFAF8] border-l-[3px] border-l-transparent"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base leading-none">{typeIcon[f.type] ?? "🏥"}</span>
                        <h3 className="font-semibold text-[#2D3748] text-sm font-nunito truncate">{f.name}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        <Badge className={cn("text-xs px-1.5 py-0 border", typeColors[f.type])}>
                          {f.type.charAt(0).toUpperCase() + f.type.slice(1)}
                        </Badge>
                        <span className="text-xs text-[#4A5568] flex items-center gap-0.5">
                          <Navigation className="w-3 h-3" />
                          {f.distance < 1
                            ? `${Math.round(f.distance * 1000)}m`
                            : `${f.distance.toFixed(1)}km`}
                        </span>
                      </div>
                      {f.address && (
                        <p className="text-xs text-[#718096] flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-[#4A9B8E]" />
                          <span className="line-clamp-1">{f.address}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold text-[#2D3748]">4.0</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs border-[#E2E8F0] hover:bg-[#F8F5F0]"
                      onClick={e => {
                        e.stopPropagation();
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}`,
                          "_blank"
                        );
                      }}
                    >
                      <Navigation className="w-3 h-3 mr-1" /> Directions
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-xs bg-[#4A9B8E] hover:bg-[#3d8578] text-white"
                      onClick={e => { e.stopPropagation(); selectFacility(f); }}
                    >
                      <MapPin className="w-3 h-3 mr-1" /> View on Map
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="px-4 py-2 border-t border-[#E2E8F0] bg-[#F8F5F0] shrink-0">
            <p className="text-xs text-[#718096]">
              {filtered.length} facilities · Data from OpenStreetMap
            </p>
          </div>
        </div>

        {/* RIGHT — Leaflet map (md+ only) */}
        <div className="hidden md:block flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ width: "100%", height: "100%" }}
            zoomControl
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            <FlyTo position={selected ? [selected.lat, selected.lon] : userPos} />

            {/* User location pulse marker */}
            {userPos && (
              <Marker
                position={userPos}
                icon={L.divIcon({
                  className: "",
                  html: `<div style="width:16px;height:16px;background:#4A9B8E;border:3px solid white;border-radius:50%;box-shadow:0 0 0 5px #4A9B8E33"></div>`,
                  iconSize: [16, 16],
                  iconAnchor: [8, 8],
                })}
              >
                <Popup><b>📍 You are here</b></Popup>
              </Marker>
            )}

            {/* Facility markers */}
            {filtered.map(f => (
              <Marker
                key={f.id}
                position={[f.lat, f.lon]}
                icon={L.divIcon({
                  className: "",
                  html: `<div style="
                    background:${markerColor[f.type] ?? "#4A9B8E"};
                    color:white;font-size:15px;
                    width:36px;height:36px;
                    border-radius:50% 50% 50% 0;
                    transform:rotate(-45deg);
                    display:flex;align-items:center;justify-content:center;
                    border:2px solid white;
                    box-shadow:0 2px 8px rgba(0,0,0,0.25);
                    ${selected?.id === f.id ? "outline:3px solid #F6E05E;outline-offset:2px;" : ""}
                  "><span style="transform:rotate(45deg)">${typeIcon[f.type] ?? "🏥"}</span></div>`,
                  iconSize: [36, 36],
                  iconAnchor: [18, 36],
                  popupAnchor: [0, -38],
                })}
                eventHandlers={{ click: () => selectFacility(f) }}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: "#2D3748", marginBottom: 2 }}>{f.name}</p>
                    {f.address && <p style={{ fontSize: 11, color: "#4A5568" }}>{f.address}</p>}
                    <p style={{ fontSize: 11, color: "#4A9B8E", marginTop: 4, fontWeight: 500 }}>
                      {f.distance < 1 ? `${Math.round(f.distance * 1000)}m away` : `${f.distance.toFixed(1)}km away`}
                    </p>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}`, "_blank")}
                      style={{
                        marginTop: 8, width: "100%", fontSize: 11,
                        background: "#4A9B8E", color: "white",
                        border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer"
                      }}
                    >
                      Get Directions
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Overlay prompt when no location */}
          {!userPos && (
            <div className="absolute inset-0 flex items-center justify-center z-[400] bg-black/10 backdrop-blur-[1px]">
              <div className="bg-white rounded-2xl px-6 py-5 shadow-xl text-center max-w-xs">
                <MapPin className="w-9 h-9 text-[#4A9B8E] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#2D3748] mb-1">Enable location</p>
                <p className="text-xs text-[#718096] mb-3">See real nearby facilities on the map</p>
                <Button
                  size="sm"
                  onClick={locate}
                  disabled={locating}
                  className="bg-[#4A9B8E] hover:bg-[#3d8578] text-white w-full"
                >
                  {locating
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Locating…</>
                    : <><LocateFixed className="w-4 h-4 mr-1" /> Use My Location</>}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav items={navItems} />
    </div>
  );
}
