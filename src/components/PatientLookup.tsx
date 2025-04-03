
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface PatientLookupProps {
  onPatientFound: (patientId: string, patientName: string | null) => void;
}

const PatientLookup = ({ onPatientFound }: PatientLookupProps) => {
  const [phone, setPhone] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    // Reset status when phone number changes
    if (status !== "idle") {
      setStatus("idle");
      setErrorMessage(null);
    }
  };

  const lookupPatient = async () => {
    if (!phone.trim()) {
      setStatus("error");
      setErrorMessage("Please enter a phone number");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      // First try exact match
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('user_type', 'patient')
        .eq('phone', phone.trim())
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setStatus("success");
        onPatientFound(data.id, data.full_name);
        return;
      }

      // No exact match, try simplified match (removing non-digits)
      const simplifiedPhone = phone.replace(/\D/g, '');
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, phone, full_name')
        .eq('user_type', 'patient');
      
      if (profilesError) {
        throw profilesError;
      }
      
      const matchedProfile = profiles?.find(profile => {
        const profileSimplifiedPhone = profile.phone.replace(/\D/g, '');
        return profileSimplifiedPhone === simplifiedPhone;
      });
      
      if (matchedProfile) {
        setStatus("success");
        onPatientFound(matchedProfile.id, matchedProfile.full_name);
        return;
      }

      // No match found
      setStatus("error");
      setErrorMessage("No patient found with this phone number");

    } catch (error) {
      console.error("Patient lookup error:", error);
      setStatus("error");
      setErrorMessage("An error occurred while looking up patient");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="patient_phone">Patient Phone Number</Label>
        <div className="flex gap-2">
          <Input 
            id="patient_phone" 
            value={phone}
            onChange={handlePhoneChange}
            placeholder="Enter patient's phone number" 
            className={`flex-1 ${status === "error" ? "border-red-500" : status === "success" ? "border-green-500" : ""}`}
          />
          <Button 
            onClick={lookupPatient}
            disabled={status === "loading" || !phone.trim()}
            variant="outline"
          >
            {status === "loading" ? "Searching..." : "Find Patient"}
          </Button>
        </div>
        {status === "error" && errorMessage && (
          <p className="text-red-600 text-xs mt-1">{errorMessage}</p>
        )}
        {status === "success" && (
          <p className="text-green-600 text-xs mt-1">✓ Patient found</p>
        )}
      </div>
    </div>
  );
};

export default PatientLookup;
