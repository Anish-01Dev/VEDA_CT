import { 
  Heart, 
  Stethoscope, 
  MapPin, 
  Wrench, 
  AlertCircle,
  Bot
} from "lucide-react";

export const navItems = [
  {
    id: "home",
    label: "Home",
    icon: <Heart className="w-5 h-5" />,
    activeIcon: <Heart className="w-5 h-5 fill-current" />,
    path: "/"
  },
  {
    id: "health",
    label: "Health",
    icon: <Stethoscope className="w-5 h-5" />,
    activeIcon: <Stethoscope className="w-5 h-5 fill-current" />,
    path: "/health"
  },
  {
    id: "clinics",
    label: "Clinics",
    icon: <MapPin className="w-5 h-5" />,
    activeIcon: <MapPin className="w-5 h-5 fill-current" />,
    path: "/map"
  },
  {
    id: "tools",
    label: "Tools",
    icon: <Wrench className="w-5 h-5" />,
    activeIcon: <Wrench className="w-5 h-5 fill-current" />,
    path: "/tools"
  },
  {
    id: "sos",
    label: "SOS",
    icon: <AlertCircle className="w-5 h-5" />,
    activeIcon: <AlertCircle className="w-5 h-5 fill-current text-red-600" />,
    path: "/sos"
  }
]; 