
import { Link } from "react-router-dom";
import { Eye, Download, Share2, FileText } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Sample data for reports
const reportsData = [
  {
    id: 1,
    name: "Blood Test Report",
    date: "15/9/2023",
    lab: "HealthLabs",
    type: "Blood Test",
    fileUrl: "#" // In a real app, this would be the file URL
  },
  {
    id: 2,
    name: "Chest X-Ray",
    date: "22/8/2023",
    lab: "CityRadiology",
    type: "Radiology",
    fileUrl: "#"
  },
  {
    id: 3,
    name: "Lipid Profile",
    date: "10/7/2023",
    lab: "PremiumDiagnostics",
    type: "Blood Test",
    fileUrl: "#"
  },
  {
    id: 4,
    name: "ECG Report",
    date: "5/6/2023",
    lab: "HeartCare Center",
    type: "Cardiology",
    fileUrl: "#"
  }
];

const PatientDashboard = () => {
  const { toast } = useToast();

  // Handle view report
  const handleViewReport = (report: typeof reportsData[0]) => {
    // In a real app, this would open the report for viewing
    toast({
      title: "Viewing Report",
      description: `Opening ${report.name}`
    });
  };

  // Handle download report
  const handleDownloadReport = (report: typeof reportsData[0]) => {
    // In a real app, this would initiate a download
    toast({
      title: "Downloading Report",
      description: `Downloading ${report.name}`
    });
  };

  // Handle share report
  const handleShareReport = (report: typeof reportsData[0]) => {
    // In a real app, this would open sharing options
    toast({
      title: "Share Report",
      description: `Sharing options for ${report.name}`
    });
  };

  return (
    <DashboardLayout 
      title="Good Morning, John Doe" 
      subtitle="Here's an overview of your health reports and records"
    >
      <div className="space-y-6">
        {/* Reports Button */}
        <div>
          <Button 
            variant="outline" 
            className="bg-white hover:bg-gray-50 text-gray-800 border-gray-200"
          >
            <FileText className="mr-2 h-5 w-5" />
            My Reports
          </Button>
        </div>

        {/* Reports Timeline */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold">Reports Timeline</h2>
            </div>
            <p className="text-gray-600 mb-6">View all your reports in chronological order</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-3 px-4 font-medium">Report Name</th>
                    <th className="py-3 px-4 font-medium">Date</th>
                    <th className="py-3 px-4 font-medium">Lab</th>
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportsData.map((report) => (
                    <tr key={report.id}>
                      <td className="py-4 px-4">{report.name}</td>
                      <td className="py-4 px-4 text-gray-500">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-1">◷</span>
                          {report.date}
                        </div>
                      </td>
                      <td className="py-4 px-4">{report.lab}</td>
                      <td className="py-4 px-4">{report.type}</td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-0 w-8 h-8" 
                            title="View"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-0 w-8 h-8" 
                            title="Download"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-0 w-8 h-8" 
                            title="Share"
                            onClick={() => handleShareReport(report)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
