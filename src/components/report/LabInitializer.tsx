
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
        // Create parameter object
        const params = { lab_name: centerName };
        
        // Fix typing by using 'as any' for the parameters
        const { data, error } = await supabase
          .rpc('find_or_create_lab', params as any)
          .single();
        
        if (error) {
          console.error("Error with lab:", error);
          return;
        }
        
        if (data) {
          const labData = data as LabResponse;
          setLabId(labData.id);
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
