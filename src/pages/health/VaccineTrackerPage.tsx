import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Baby, Calendar as CalendarIcon, CheckCircle, AlertTriangle, Clock, Plus, Users, TrendingUp, Bell, Download, FileText, Stethoscope, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { format, differenceInDays, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation-config";



interface Child {
  id: string;
  name: string;
  birthDate: Date | null;
  gender: 'male' | 'female' | 'other';
  vaccines: VaccineRecord[];
  notes: string;
  doctorName: string;
  nextAppointment: Date | null;
  allergies: string[];
  weight: number;
  height: number;
}

interface VaccineRecord {
  name: string;
  scheduledAge: string;
  givenDate: Date | null;
  status: "pending" | "given" | "overdue" | "upcoming";
  dueDate: Date;
  batchNumber?: string;
  location?: string;
  sideEffects?: string;
  nextDose?: Date;
}

interface Reminder {
  id: string;
  childId: string;
  vaccineName: string;
  dueDate: Date;
  isActive: boolean;
}

const standardVaccines = [
  { name: "BCG", scheduledAge: "At birth", ageInDays: 0 },
  { name: "Hepatitis B", scheduledAge: "At birth", ageInDays: 0 },
  { name: "OPV-1", scheduledAge: "6 weeks", ageInDays: 42 },
  { name: "DPT-1", scheduledAge: "6 weeks", ageInDays: 42 },
  { name: "Hib-1", scheduledAge: "6 weeks", ageInDays: 42 },
  { name: "Rotavirus-1", scheduledAge: "6 weeks", ageInDays: 42 },
  { name: "PCV-1", scheduledAge: "6 weeks", ageInDays: 42 },
  { name: "OPV-2", scheduledAge: "10 weeks", ageInDays: 70 },
  { name: "DPT-2", scheduledAge: "10 weeks", ageInDays: 70 },
  { name: "Hib-2", scheduledAge: "10 weeks", ageInDays: 70 },
  { name: "Rotavirus-2", scheduledAge: "10 weeks", ageInDays: 70 },
  { name: "PCV-2", scheduledAge: "10 weeks", ageInDays: 70 },
  { name: "OPV-3", scheduledAge: "14 weeks", ageInDays: 98 },
  { name: "DPT-3", scheduledAge: "14 weeks", ageInDays: 98 },
  { name: "Hib-3", scheduledAge: "14 weeks", ageInDays: 98 },
  { name: "Rotavirus-3", scheduledAge: "14 weeks", ageInDays: 98 },
  { name: "PCV-3", scheduledAge: "14 weeks", ageInDays: 98 },
  { name: "MMR-1", scheduledAge: "9 months", ageInDays: 270 },
  { name: "JE-1", scheduledAge: "9 months", ageInDays: 270 },
  { name: "DPT Booster", scheduledAge: "16-24 months", ageInDays: 540 },
  { name: "OPV Booster", scheduledAge: "16-24 months", ageInDays: 540 },
  { name: "MMR-2", scheduledAge: "16-24 months", ageInDays: 540 },
  { name: "JE-2", scheduledAge: "16-24 months", ageInDays: 540 }
];

const VaccineTrackerPage = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [newChild, setNewChild] = useState<Child>({
    id: "",
    name: "",
    birthDate: null,
    gender: 'male',
    vaccines: [],
    notes: "",
    doctorName: "",
    nextAppointment: null,
    allergies: [],
    weight: 0,
    height: 0
  });
  const [selectedVaccine, setSelectedVaccine] = useState<string>("");
  const [vaccineDate, setVaccineDate] = useState<Date | null>(null);
  const [batchNumber, setBatchNumber] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [sideEffects, setSideEffects] = useState<string>("");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showAddChild, setShowAddChild] = useState<boolean>(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedChildren = localStorage.getItem('vaccine-tracker-children');
    const savedReminders = localStorage.getItem('vaccine-tracker-reminders');
    
    if (savedChildren) {
      const parsedChildren = JSON.parse(savedChildren).map((child: any) => ({
        ...child,
        birthDate: child.birthDate ? new Date(child.birthDate) : null,
        nextAppointment: child.nextAppointment ? new Date(child.nextAppointment) : null,
        vaccines: child.vaccines.map((vaccine: any) => ({
          ...vaccine,
          givenDate: vaccine.givenDate ? new Date(vaccine.givenDate) : null,
          dueDate: new Date(vaccine.dueDate),
          nextDose: vaccine.nextDose ? new Date(vaccine.nextDose) : undefined
        }))
      }));
      setChildren(parsedChildren);
      if (parsedChildren.length > 0) {
        setSelectedChildId(parsedChildren[0].id);
      }
    }
    
    if (savedReminders) {
      const parsedReminders = JSON.parse(savedReminders).map((reminder: any) => ({
        ...reminder,
        dueDate: new Date(reminder.dueDate)
      }));
      setReminders(parsedReminders);
    }
  }, []);

  // Save data to localStorage whenever children or reminders change
  useEffect(() => {
    if (children.length > 0) {
      localStorage.setItem('vaccine-tracker-children', JSON.stringify(children));
    }
  }, [children]);

  useEffect(() => {
    if (reminders.length > 0) {
      localStorage.setItem('vaccine-tracker-reminders', JSON.stringify(reminders));
    }
  }, [reminders]);

  const initializeVaccines = (birthDate: Date): VaccineRecord[] => {
    const currentDate = new Date();
    return standardVaccines.map(vaccine => {
      const dueDate = addDays(birthDate, vaccine.ageInDays);
      const daysPastDue = differenceInDays(currentDate, dueDate);
      
      let status: "pending" | "given" | "overdue" | "upcoming" = "pending";
      if (daysPastDue > 30) {
        status = "overdue";
      } else if (daysPastDue < -7) {
        status = "upcoming";
      }
      
      return {
        name: vaccine.name,
        scheduledAge: vaccine.scheduledAge,
        givenDate: null,
        status,
        dueDate
      };
    });
  };

  const addChild = () => {
    if (newChild.name && newChild.birthDate) {
      const childId = Date.now().toString();
      const vaccines = initializeVaccines(newChild.birthDate);
      
      const childToAdd: Child = {
        ...newChild,
        id: childId,
        vaccines
      };
      
      setChildren(prev => [...prev, childToAdd]);
      setSelectedChildId(childId);
      
      // Create reminders for upcoming vaccines
      const newReminders = vaccines
        .filter(vaccine => vaccine.status === "upcoming" || vaccine.status === "pending")
        .map(vaccine => ({
          id: `${childId}-${vaccine.name}-${Date.now()}`,
          childId,
          vaccineName: vaccine.name,
          dueDate: vaccine.dueDate,
          isActive: true
        }));
      
      setReminders(prev => [...prev, ...newReminders]);
      
      // Reset form
      setNewChild({
        id: "",
        name: "",
        birthDate: null,
        gender: 'male',
        vaccines: [],
        notes: "",
        doctorName: "",
        nextAppointment: null,
        allergies: [],
        weight: 0,
        height: 0
      });
      setShowAddChild(false);
    }
  };

  const markVaccineGiven = () => {
    if (selectedVaccine && vaccineDate && selectedChildId) {
      setChildren(prevChildren => 
        prevChildren.map(child => 
          child.id === selectedChildId
            ? {
                ...child,
                vaccines: child.vaccines.map(vaccine =>
                  vaccine.name === selectedVaccine
                    ? { 
                        ...vaccine, 
                        givenDate: vaccineDate, 
                        status: "given" as const,
                        batchNumber,
                        location,
                        sideEffects: sideEffects || undefined
                      }
                    : vaccine
                )
              }
            : child
        )
      );
      
      // Remove reminder for this vaccine
      setReminders(prev => 
        prev.filter(reminder => 
          !(reminder.childId === selectedChildId && reminder.vaccineName === selectedVaccine)
        )
      );
      
      // Reset form
      setSelectedVaccine("");
      setVaccineDate(null);
      setBatchNumber("");
      setLocation("");
      setSideEffects("");
    }
  };

  const getSelectedChild = (): Child | undefined => {
    return children.find(child => child.id === selectedChildId);
  };

  const getVaccinationProgress = (child: Child): number => {
    const givenVaccines = child.vaccines.filter(v => v.status === "given").length;
    return Math.round((givenVaccines / child.vaccines.length) * 100);
  };

  const getUpcomingVaccines = (child: Child): VaccineRecord[] => {
    const currentDate = new Date();
    return child.vaccines
      .filter(vaccine => 
        vaccine.status !== "given" && 
        differenceInDays(vaccine.dueDate, currentDate) <= 30
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 3);
  };

  const getOverdueVaccines = (child: Child): VaccineRecord[] => {
    return child.vaccines.filter(vaccine => vaccine.status === "overdue");
  };

  const exportVaccineRecord = (child: Child) => {
    const data = {
      childName: child.name,
      birthDate: child.birthDate,
      gender: child.gender,
      doctorName: child.doctorName,
      vaccines: child.vaccines.filter(v => v.status === "given"),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${child.name}-vaccine-record.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "given": return "bg-[#38A169] text-white";
      case "overdue": return "bg-[#E53E3E] text-white";
      case "upcoming": return "bg-[#3182CE] text-white";
      default: return "bg-[#F6E05E] text-black";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "given": return <CheckCircle className="w-4 h-4 text-[#38A169]" />;
      case "overdue": return <AlertTriangle className="w-4 h-4 text-[#E53E3E]" />;
      case "upcoming": return <Clock className="w-4 h-4 text-[#3182CE]" />;
      default: return <Clock className="w-4 h-4 text-[#F6E05E]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFCF3] pb-20 font-inter">
      <motion.header 
        className="sticky top-0 z-50 bg-white/95 border-b border-[#E2E8F0] px-4 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate("/health")} className="hover:bg-[#4A9B8E10]">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-lg bg-[#3182CE20] text-[#3182CE]">
              <Baby className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[#2D3748] font-nunito">Child Vaccine Tracker</h1>
              <p className="text-sm text-[#4A5568] font-inter">Track vaccination schedules and growth milestones</p>
            </div>
            <Button
              onClick={() => setShowAddChild(true)}
              className="bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Child
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Child Selection */}
        {children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white border border-[#E2E8F0]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Users className="w-5 h-5 text-[#4A9B8E]" />
                  <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a child" />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name} ({child.birthDate ? format(child.birthDate, "MMM yyyy") : "No DOB"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Add Child Modal */}
        <AnimatePresence>
          {showAddChild && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddChild(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <Card className="bg-white border border-[#E2E8F0]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2D3748] font-nunito">
                      <Baby className="w-5 h-5 text-[#4A9B8E]" />
                      Add New Child
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="childName" className="text-sm font-semibold text-[#2D3748] font-nunito">Child's Name</Label>
                      <Input
                        id="childName"
                        placeholder="Enter child's name"
                        value={newChild.name}
                        onChange={(e) => setNewChild({...newChild, name: e.target.value})}
                        className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-[#2D3748] font-nunito">Gender</Label>
                      <Select value={newChild.gender} onValueChange={(value: 'male' | 'female' | 'other') => setNewChild({...newChild, gender: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-[#2D3748] font-nunito">Date of Birth</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal border-[#E2E8F0] hover:bg-[#F8F5F0]",
                              !newChild.birthDate && "text-[#4A5568]"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newChild.birthDate ? format(newChild.birthDate, "PPP") : "Select birth date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newChild.birthDate || undefined}
                            onSelect={(date) => setNewChild({...newChild, birthDate: date || null})}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="doctorName" className="text-sm font-semibold text-[#2D3748] font-nunito">Doctor's Name (Optional)</Label>
                      <Input
                        id="doctorName"
                        placeholder="Enter doctor's name"
                        value={newChild.doctorName}
                        onChange={(e) => setNewChild({...newChild, doctorName: e.target.value})}
                        className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddChild(false)}
                        className="flex-1 border-[#E2E8F0] hover:bg-[#F8F5F0] text-[#2D3748] font-semibold"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={addChild}
                        disabled={!newChild.name || !newChild.birthDate}
                        className="flex-1 bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white font-semibold"
                      >
                        Add Child
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {selectedChildId && getSelectedChild() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-[#F8F5F0]">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="vaccines" className="text-xs">Vaccines</TabsTrigger>
                <TabsTrigger value="reminders" className="text-xs">Reminders</TabsTrigger>
                <TabsTrigger value="records" className="text-xs">Records</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Progress Overview */}
                <Card className="bg-white border border-[#E2E8F0]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2D3748] font-nunito">
                      <TrendingUp className="w-5 h-5 text-[#4A9B8E]" />
                      Vaccination Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#2D3748]">Overall Progress</span>
                      <span className="text-sm font-bold text-[#4A9B8E]">{getVaccinationProgress(getSelectedChild()!)}%</span>
                    </div>
                    <Progress value={getVaccinationProgress(getSelectedChild()!)} className="h-2" />
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center p-3 bg-[#F8F5F0] rounded-lg">
                        <div className="text-lg font-bold text-[#38A169]">
                          {getSelectedChild()!.vaccines.filter(v => v.status === "given").length}
                        </div>
                        <div className="text-xs text-[#4A5568]">Completed</div>
                      </div>
                      <div className="text-center p-3 bg-[#F8F5F0] rounded-lg">
                        <div className="text-lg font-bold text-[#F6E05E]">
                          {getSelectedChild()!.vaccines.filter(v => v.status === "pending" || v.status === "upcoming").length}
                        </div>
                        <div className="text-xs text-[#4A5568]">Pending</div>
                      </div>
                      <div className="text-center p-3 bg-[#F8F5F0] rounded-lg">
                        <div className="text-lg font-bold text-[#E53E3E]">
                          {getOverdueVaccines(getSelectedChild()!).length}
                        </div>
                        <div className="text-xs text-[#4A5568]">Overdue</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Vaccines */}
                <Card className="bg-white border border-[#E2E8F0]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2D3748] font-nunito">
                      <Clock className="w-5 h-5 text-[#4A9B8E]" />
                      Upcoming Vaccines
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getUpcomingVaccines(getSelectedChild()!).length > 0 ? (
                      <div className="space-y-3">
                        {getUpcomingVaccines(getSelectedChild()!).map((vaccine, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-[#F8F5F0] rounded-lg">
                            <div>
                              <p className="font-semibold text-sm text-[#2D3748] font-nunito">{vaccine.name}</p>
                              <p className="text-xs text-[#4A5568] font-inter">Due: {format(vaccine.dueDate, "MMM dd, yyyy")}</p>
                            </div>
                            <Badge className={getStatusColor(vaccine.status)}>
                              {differenceInDays(vaccine.dueDate, new Date())} days
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#4A5568] text-center py-4">No upcoming vaccines in the next 30 days</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vaccines" className="space-y-6">

                <Card className="bg-white border border-[#E2E8F0]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2D3748] font-nunito">
                      <Shield className="w-5 h-5 text-[#4A9B8E]" />
                      Vaccine Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getSelectedChild()!.vaccines.map((vaccine, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#F8F5F0] rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center">
                              {getStatusIcon(vaccine.status)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-[#2D3748] font-nunito">{vaccine.name}</p>
                              <p className="text-xs text-[#4A5568] font-inter">
                                Due: {format(vaccine.dueDate, "MMM dd, yyyy")} ({vaccine.scheduledAge})
                              </p>
                              {vaccine.givenDate && (
                                <p className="text-xs text-[#38A169] font-inter">
                                  Given: {format(vaccine.givenDate, "MMM dd, yyyy")}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(vaccine.status)}>
                              {vaccine.status === "given" ? "Completed" : 
                               vaccine.status === "overdue" ? "Overdue" : 
                               vaccine.status === "upcoming" ? "Upcoming" : "Pending"}
                            </Badge>
                            {(vaccine.status === "pending" || vaccine.status === "overdue" || vaccine.status === "upcoming") && (
                              <Button
                                size="sm"
                                onClick={() => setSelectedVaccine(vaccine.name)}
                                className="bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white text-xs"
                              >
                                Mark Given
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reminders" className="space-y-6">
                <Card className="bg-white border border-[#E2E8F0]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2D3748] font-nunito">
                      <Bell className="w-5 h-5 text-[#4A9B8E]" />
                      Active Reminders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reminders.filter(r => r.childId === selectedChildId && r.isActive).length > 0 ? (
                      <div className="space-y-3">
                        {reminders
                          .filter(r => r.childId === selectedChildId && r.isActive)
                          .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                          .map((reminder) => (
                            <div key={reminder.id} className="flex items-center justify-between p-3 bg-[#F8F5F0] rounded-lg">
                              <div>
                                <p className="font-semibold text-sm text-[#2D3748] font-nunito">{reminder.vaccineName}</p>
                                <p className="text-xs text-[#4A5568] font-inter">
                                  Due: {format(reminder.dueDate, "MMM dd, yyyy")}
                                </p>
                                <p className="text-xs text-[#E53E3E] font-inter">
                                  {differenceInDays(reminder.dueDate, new Date()) < 0 
                                    ? `${Math.abs(differenceInDays(reminder.dueDate, new Date()))} days overdue`
                                    : `${differenceInDays(reminder.dueDate, new Date())} days remaining`
                                  }
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReminders(prev => 
                                  prev.map(r => r.id === reminder.id ? {...r, isActive: false} : r)
                                )}
                                className="text-xs"
                              >
                                Dismiss
                              </Button>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <p className="text-sm text-[#4A5568] text-center py-4">No active reminders</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="records" className="space-y-6">
                <Card className="bg-white border border-[#E2E8F0]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2D3748] font-nunito">
                      <FileText className="w-5 h-5 text-[#4A9B8E]" />
                      Vaccination Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#2D3748]">{getSelectedChild()!.name}</p>
                        <p className="text-sm text-[#4A5568]">
                          Born: {getSelectedChild()!.birthDate ? format(getSelectedChild()!.birthDate!, "MMM dd, yyyy") : "Not set"}
                        </p>
                        {getSelectedChild()!.doctorName && (
                          <p className="text-sm text-[#4A5568]">
                            Doctor: {getSelectedChild()!.doctorName}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => exportVaccineRecord(getSelectedChild()!)}
                        className="bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-[#2D3748]">Completed Vaccinations</h4>
                      {getSelectedChild()!.vaccines.filter(v => v.status === "given").length > 0 ? (
                        <div className="space-y-2">
                          {getSelectedChild()!.vaccines
                            .filter(v => v.status === "given")
                            .sort((a, b) => (a.givenDate?.getTime() || 0) - (b.givenDate?.getTime() || 0))
                            .map((vaccine, index) => (
                              <div key={index} className="p-3 bg-[#F8F5F0] rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-sm text-[#2D3748]">{vaccine.name}</p>
                                    <p className="text-xs text-[#4A5568]">
                                      Given: {vaccine.givenDate ? format(vaccine.givenDate, "MMM dd, yyyy") : "Date not recorded"}
                                    </p>
                                    {vaccine.batchNumber && (
                                      <p className="text-xs text-[#4A5568]">Batch: {vaccine.batchNumber}</p>
                                    )}
                                    {vaccine.location && (
                                      <p className="text-xs text-[#4A5568]">Location: {vaccine.location}</p>
                                    )}
                                  </div>
                                  <CheckCircle className="w-5 h-5 text-[#38A169]" />
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <p className="text-sm text-[#4A5568] text-center py-4">No completed vaccinations yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        {/* No Children State */}
        {children.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Baby className="w-16 h-16 text-[#4A9B8E] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#2D3748] mb-2">No Children Added</h3>
            <p className="text-[#4A5568] mb-6">Add your first child to start tracking vaccinations</p>
            <Button
              onClick={() => setShowAddChild(true)}
              className="bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Child
            </Button>
          </motion.div>
        )}

        {/* Mark Vaccine Modal */}
        <AnimatePresence>
          {selectedVaccine && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setSelectedVaccine("");
                setVaccineDate(null);
                setBatchNumber("");
                setLocation("");
                setSideEffects("");
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md max-h-[90vh] overflow-y-auto"
              >
                <Card className="bg-white border border-[#E2E8F0]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2D3748] font-nunito">
                      <Stethoscope className="w-5 h-5 text-[#4A9B8E]" />
                      Mark {selectedVaccine} as Given
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-[#2D3748] font-nunito">Date Given *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal border-[#E2E8F0] hover:bg-[#F8F5F0]",
                              !vaccineDate && "text-[#4A5568]"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {vaccineDate ? format(vaccineDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={vaccineDate || undefined}
                            onSelect={(date) => setVaccineDate(date || null)}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="batchNumber" className="text-sm font-semibold text-[#2D3748] font-nunito">Batch Number (Optional)</Label>
                      <Input
                        id="batchNumber"
                        placeholder="Enter batch number"
                        value={batchNumber}
                        onChange={(e) => setBatchNumber(e.target.value)}
                        className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-sm font-semibold text-[#2D3748] font-nunito">Location (Optional)</Label>
                      <Input
                        id="location"
                        placeholder="Hospital/Clinic name"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sideEffects" className="text-sm font-semibold text-[#2D3748] font-nunito">Side Effects (Optional)</Label>
                      <Textarea
                        id="sideEffects"
                        placeholder="Any side effects observed..."
                        value={sideEffects}
                        onChange={(e) => setSideEffects(e.target.value)}
                        className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E] min-h-[80px]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedVaccine("");
                          setVaccineDate(null);
                          setBatchNumber("");
                          setLocation("");
                          setSideEffects("");
                        }}
                        className="flex-1 border-[#E2E8F0] hover:bg-[#F8F5F0] text-[#2D3748] font-semibold"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={markVaccineGiven}
                        disabled={!vaccineDate}
                        className="flex-1 bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white font-semibold"
                      >
                        Mark Given
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav items={navItems} />
    </div>
  );
};

export default VaccineTrackerPage;