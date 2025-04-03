import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PatientRegistration from "./PatientRegistration";
import { GetPatientByPhoneParams, PatientResponse } from "@/types/supabase-rpc";

interface PatientLookupProps {
  onPatientFound: (id: string, name: string | null) => void;
}

const PatientLookup: React.FC<PatientLookupProps> = ({ onPatientFound }) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patient, setPatient] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  
  const lookupPatient = async (phoneNumber: string) => {
    setIsLoading(true);
    setPatient(null);
    setShowRegistration(false);
    
    try {
      // Create parameter object
      const params: GetPatientByPhoneParams = { phone: phoneNumber };
      
      // Use as any for the RPC call
      const { data, error } = await supabase
        .rpc('get_patient_by_phone', params as any)
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const patientData = data as PatientResponse;
        setPatient({ id: patientData.id, name: patientData.name });
        onPatientFound(patientData.id, patientData.name);
      } else {
        // No patient found, show registration form
        setShowRegistration(true);
        toast({
          title: "Patient Not Found",
          description: "No patient found with this phone number. Please register the patient.",
        });
        onPatientFound("", null); // Clear any previously found patient
      }
    } catch (error) {
      console.error("Patient lookup error:", error);
      toast({
        title: "Error",
        description: "Failed to lookup patient. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientRegistered = (id: string, name: string) => {
    setPatient({ id, name });
    onPatientFound(id, name);
    setShowRegistration(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="phone">Patient Phone Number</Label>
        <div className="flex rounded-md shadow-sm">
          <Input
            id="phone"
            type="tel"
            placeholder="Enter patient's phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <Button 
            type="button"
            onClick={() => lookupPatient(phoneNumber)}
            disabled={isLoading || !phoneNumber}
          >
            {isLoading ? "Looking Up..." : "Lookup Patient"}
          </Button>
        </div>
      </div>
      
      {patient && (
        <div className="border border-green-100 bg-green-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Patient Found</h3>
          <p className="text-gray-600">
            Name: {patient.name}
            <br />
            ID: {patient.id}
          </p>
        </div>
      )}
      
      {showRegistration && (
        <PatientRegistration 
          onSuccess={handlePatientRegistered}
          phoneNumber={phoneNumber}
        />
      )}
    </div>
  );
};

export default PatientLookup;
