
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InsertReportParams } from "@/types/supabase-rpc";

interface ReportData {
  name: string;
  type: string;
  patientId: string;
  labId: string;
  centerName: string;
}

export const useReportUpload = (onSuccess: () => void) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadReport = async (reportData: ReportData) => {
    const { name, type, patientId, labId, centerName } = reportData;
    
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
      // Cast parameter object to the proper type
      const params: InsertReportParams = {
        r_name: name,
        r_type: type,
        r_lab: centerName,
        r_patient_id: patientId,
        r_file_url: null,
        r_uploaded_by: labId
      };
      
      // Use as any for the RPC call
      const { error: reportError } = await supabase
        .rpc('insert_report', params as any);
        
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
