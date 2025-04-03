
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PatientLookup from "./PatientLookup";

interface ReportUploadFormProps {
  centerName: string;
  centerId: string;
  onSuccess: () => void;
}

interface LabResponse {
  id: string;
}

const ReportUploadForm = ({ centerName, centerId, onSuccess }: ReportUploadFormProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [labId, setLabId] = useState<string | null>(null);
  
  const [reportForm, setReportForm] = useState({
    name: "",
    type: "Blood Test",
    file: null as File | null
  });

  useEffect(() => {
    // Find or create the lab entry for this diagnostic center
    const findOrCreateLab = async () => {
      try {
        // Use RPC for type-safe database operations with type assertion
        const { data, error } = await supabase
          .rpc('find_or_create_lab', { lab_name: centerName } as any)
          .single();
        
        if (error) {
          console.error("Error with lab:", error);
          return;
        }
        
        if (data) {
          const labData = data as unknown as LabResponse;
          setLabId(labData.id);
        }
      } catch (err) {
        console.error("Lab creation error:", err);
      }
    };
    
    if (centerName) {
      findOrCreateLab();
    }
  }, [centerName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setReportForm({ ...reportForm, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReportForm({ ...reportForm, file: e.target.files[0] });
    }
  };

  const handleTypeChange = (value: string) => {
    setReportForm({ ...reportForm, type: value });
  };

  const handlePatientFound = (id: string, name: string | null) => {
    setPatientId(id);
    setPatientName(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId) {
      toast({
        title: "Patient Required",
        description: "Please find a patient before uploading a report",
        variant: "destructive"
      });
      return;
    }
    
    if (!reportForm.name || !reportForm.type) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (!labId) {
      toast({
        title: "Lab Information Missing",
        description: "Could not determine lab information. Please try again later.",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload file if exists
      let fileUrl = null;
      if (reportForm.file) {
        const fileName = `${Date.now()}-${reportForm.file.name}`;
        const { data: fileData, error: fileError } = await supabase.storage
          .from('reports')
          .upload(fileName, reportForm.file);
          
        if (fileError) {
          console.error("File upload error:", fileError);
          // Continue without file
        } else if (fileData) {
          const { data: urlData } = await supabase.storage
            .from('reports')
            .getPublicUrl(fileName);
            
          fileUrl = urlData.publicUrl;
        }
      }
      
      // Create report record using RPC with type assertion
      const { error: reportError } = await supabase
        .rpc('insert_report', {
          r_name: reportForm.name,
          r_type: reportForm.type,
          r_lab: centerName,
          r_patient_id: patientId,
          r_file_url: fileUrl,
          r_uploaded_by: labId
        } as any);
        
      if (reportError) {
        throw reportError;
      }
      
      // Reset form
      setReportForm({
        name: "",
        type: "Blood Test",
        file: null
      });
      
      setPatientId(null);
      setPatientName(null);
      
      toast({
        title: "Success",
        description: "Report uploaded successfully"
      });

      onSuccess();
      
    } catch (error) {
      console.error("Report upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PatientLookup onPatientFound={handlePatientFound} />
      
      {patientId && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm font-medium">
            Patient: {patientName || "Unknown"}
          </p>
          <p className="text-xs text-green-700">
            Report will be linked to this patient's account
          </p>
        </div>
      )}
      
      <div>
        <Label htmlFor="name">Report Name</Label>
        <Input 
          id="name" 
          name="name" 
          placeholder="e.g. Complete Blood Count" 
          value={reportForm.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="type">Report Type</Label>
        <Select 
          value={reportForm.type} 
          onValueChange={handleTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Blood Test">Blood Test</SelectItem>
            <SelectItem value="Urine Test">Urine Test</SelectItem>
            <SelectItem value="X-Ray">X-Ray</SelectItem>
            <SelectItem value="MRI">MRI</SelectItem>
            <SelectItem value="CT Scan">CT Scan</SelectItem>
            <SelectItem value="Ultrasound">Ultrasound</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="file">Report File (Optional)</Label>
        <Input 
          id="file" 
          type="file" 
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <p className="text-xs text-gray-500 mt-1">Upload PDF or image files (max 10MB)</p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={uploading || !patientId || !labId}
      >
        {uploading ? "Uploading..." : "Upload Report"}
      </Button>
    </form>
  );
};

export default ReportUploadForm;
