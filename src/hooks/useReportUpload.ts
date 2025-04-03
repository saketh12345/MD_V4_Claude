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

// Define parameter type for the insert_report RPC function
interface InsertReportParams {
  r_name: string;
  r_type: string;
  r_lab: string;
  r_patient_id: string;
  r_file_url: string | null;
  r_uploaded_by: string;
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
      
      // Cast parameter object to the proper type
      const params = {
        r_name: name,
        r_type: type,
        r_lab: centerName,
        r_patient_id: patientId,
        r_file_url: fileUrl,
        r_uploaded_by: labId
      } as InsertReportParams;
      
      const { error: reportError } = await supabase
        .rpc('insert_report', params);
        
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
