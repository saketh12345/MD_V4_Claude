
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReportData {
  name: string;
  type: string;
  patientId: string;
  labId: string;
  centerName: string;
  file: File | null;
}

export const useReportUpload = (onSuccess: () => void) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadReport = async (reportData: ReportData) => {
    const { name, type, patientId, labId, centerName, file } = reportData;
    
    if (!patientId || !name || !type || !labId) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return false;
    }
    
    setUploading(true);
    
    try {
      // Upload file if exists
      let fileUrl = null;
      if (file) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data: fileData, error: fileError } = await supabase.storage
          .from('reports')
          .upload(fileName, file);
          
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
      
      // Use type assertion to bypass TypeScript's strict checking for custom RPC functions
      const { error: reportError } = await supabase
        .rpc('insert_report', {
          r_name: name,
          r_type: type,
          r_lab: centerName,
          r_patient_id: patientId,
          r_file_url: fileUrl,
          r_uploaded_by: labId
        } as any);
        
      if (reportError) {
        throw reportError;
      }
      
      toast({
        title: "Success",
        description: "Report uploaded successfully"
      });

      onSuccess();
      return true;
      
    } catch (error) {
      console.error("Report upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload report. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadReport,
    uploading
  };
};
