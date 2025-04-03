
import { useEffect } from "react";
import { useReportForm } from "@/contexts/ReportFormContext";
import { supabase } from "@/integrations/supabase/client";
import { FindOrCreateLabParams, LabResponse } from "@/types/supabase-rpc";

interface LabInitializerProps {
  centerName: string;
}

const LabInitializer: React.FC<LabInitializerProps> = ({ centerName }) => {
  const { setLabId } = useReportForm();

  useEffect(() => {
    // Find or create the lab entry for this diagnostic center
    const findOrCreateLab = async () => {
      try {
        // Cast parameter object to the proper type
        const params: FindOrCreateLabParams = { lab_name: centerName };
        
        const { data, error } = await supabase
          .rpc<LabResponse>('find_or_create_lab', params)
          .single();
        
        if (error) {
          console.error("Error with lab:", error);
          return;
        }
        
        if (data) {
          setLabId(data.id);
        }
      } catch (err) {
        console.error("Lab creation error:", err);
      }
    };
    
    if (centerName) {
      findOrCreateLab();
    }
  }, [centerName, setLabId]);

  return null; // This is a utility component with no UI
};

export default LabInitializer;
