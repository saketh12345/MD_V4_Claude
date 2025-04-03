
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ReportRow = Database['public']['Tables']['reports']['Row'];

export const getReports = async (patientId: string): Promise<ReportRow[]> => {
    const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .eq('patient_id', patientId);

    return error ? [] : reports || [];
};
