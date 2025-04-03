
import { useEffect } from "react";
import { useReportForm } from "@/contexts/ReportFormContext";
import { supabase } from "@/integrations/supabase/client";

interface LabInitializerProps {
  centerName: string;
}

interface LabResponse {
  id: string;
}

// Define parameter type for find_or_create_lab RPC function
interface FindOrCreateLabParams {
  lab_name: string;
}

const LabInitializer: React.FC<LabInitializerProps> = ({ centerName }) => {
  const { setLabId } = useReportForm();

  useEffect(() => {
    // Find or create the lab entry for this diagnostic center
    const findOrCreateLab = async () => {
      try {
        // Create params object with the proper type
        const params: FindOrCreateLabParams = {
          lab_name: centerName
        };
        
        // Call the RPC function with explicit typing
        const { data, error } = await supabase
          .rpc('find_or_create_lab', params)
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
  }, [centerName, setLabId]);

  return null; // This is a utility component with no UI
};

export default LabInitializer;
