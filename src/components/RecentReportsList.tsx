
import React from "react";
import { ArrowRight, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";

type ReportRow = Database['public']['Tables']['reports']['Row'];

interface RecentReportsListProps {
  reports: ReportRow[];
  loading: boolean;
}

const RecentReportsList = ({ reports, loading }: RecentReportsListProps) => {
  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }
  
  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reports uploaded yet. Your uploaded reports will appear here.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {reports.slice(0, 5).map((report) => (
        <div key={report.id} className="flex items-center p-3 border rounded-lg">
          <div className="p-2 bg-blue-50 rounded mr-3">
            <File className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{report.name}</p>
            <p className="text-sm text-gray-500">
              {new Date(report.created_at).toLocaleDateString()} • {report.type}
            </p>
          </div>
          {report.file_url && (
            <a 
              href={report.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              <ArrowRight className="h-5 w-5" />
            </a>
          )}
        </div>
      ))}
      
      {reports.length > 5 && (
        <Button 
          variant="outline" 
          className="w-full mt-4"
        >
          View All Reports
        </Button>
      )}
    </div>
  );
};

export default RecentReportsList;
