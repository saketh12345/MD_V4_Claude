
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PatientRegistration from "./PatientRegistration";

interface PatientLookupProps {
  onPatientFound: (id: string, name: string | null) => void;
}

interface PatientData {
  id: string;
  name: string | null;
}

const PatientLookup = ({ onPatientFound }: PatientLookupProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter a patient's phone number",
        variant: "destructive"
      });
      return;
    }
    
    setSearching(true);
    setShowRegistration(false);
    
    try {
      // Use any type to bypass TypeScript's strict checking for custom RPC functions
      const { data, error } = await (supabase
        .rpc('get_patient_by_phone', { phone: phoneNumber.trim() } as any)
        .maybeSingle() as any);
      
      if (error) {
        console.error("Patient search error:", error);
        throw error;
      }
      
      if (data) {
        // Patient found
        const patientData = data as unknown as PatientData;
        onPatientFound(patientData.id, patientData.name);
        toast({
          title: "Patient found",
          description: `Found patient: ${patientData.name || "Unknown"}`,
        });
      } else {
        // No patient found, show registration form
        setShowRegistration(true);
        toast({
          title: "Patient not found",
          description: "No patient found with this phone number. You can register them below.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error searching for patient:", error);
      toast({
        title: "Error",
        description: "Failed to search for patient. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const handlePatientRegistered = (id: string, name: string) => {
    setShowRegistration(false);
    onPatientFound(id, name);
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <div className="flex-1">
            <Input
              type="tel"
              placeholder="Enter patient phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={searching || !phoneNumber.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {searching ? "Searching..." : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Find Patient
              </>
            )}
          </Button>
        </div>
      </form>

      {showRegistration && (
        <PatientRegistration 
          phoneNumber={phoneNumber} 
          onSuccess={handlePatientRegistered} 
        />
      )}
    </div>
  );
};

export default PatientLookup;
