
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PatientRegistrationProps {
  onSuccess: (id: string, name: string) => void;
  phoneNumber: string;
}

interface PatientResponse {
  id: string;
  name: string;
}

// Define parameter type for insert_patient RPC function
interface InsertPatientParams {
  p_name: string;
  p_phone: string;
  p_email: string | null;
}

const PatientRegistration = ({ onSuccess, phoneNumber }: PatientRegistrationProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phoneNumber) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Cast parameter object to the proper type
      const params = {
        p_name: name,
        p_phone: phoneNumber,
        p_email: email || null
      } as InsertPatientParams;
      
      const { data, error } = await supabase
        .rpc('insert_patient', params)
        .single();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Patient registered successfully"
      });
      
      // Type assertion for the response data
      if (data) {
        const patientData = data as unknown as PatientResponse;
        onSuccess(patientData.id, patientData.name);
      }
    } catch (error) {
      console.error("Patient registration error:", error);
      toast({
        title: "Error",
        description: "Failed to register patient. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-blue-100 bg-blue-50 p-4 rounded-md mb-4">
      <h3 className="text-lg font-semibold mb-2">Register New Patient</h3>
      <p className="text-gray-600 mb-4 text-sm">
        No patient found with this phone number. Register a new patient to continue.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phoneNumber}
            readOnly
            className="bg-gray-100"
          />
        </div>
        
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter patient's full name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter patient's email"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || !name}
        >
          {isSubmitting ? "Registering..." : "Register Patient"}
        </Button>
      </form>
    </div>
  );
};

export default PatientRegistration;
