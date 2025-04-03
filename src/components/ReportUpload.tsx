
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCurrentUser } from "@/utils/authUtils";

interface ReportUploadProps {
  onUploadSuccess?: () => void;
}

const ReportUpload = ({ onUploadSuccess }: ReportUploadProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [patientPhone, setPatientPhone] = useState("");
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("");
  const [labName, setLabName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadReport = async (
    patientPhone: string,
    filePath: string,
    reportDetails: {
      name: string;
      type: string;
      lab: string;
    }
  ) => {
    try {
      // Find patient by phone number
      const { data: patients, error: patientError } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", patientPhone)
        .eq("user_type", "patient")
        .maybeSingle();

      if (patientError || !patients) {
        return {
          success: false,
          message: `No patient found with phone number ${patientPhone}`,
        };
      }

      const patientId = patients.id;
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        return {
          success: false,
          message: "You must be logged in to upload reports",
        };
      }

      // Create a report record
      const { error: reportError } = await supabase.from("reports").insert({
        patient_id: patientId,
        name: reportDetails.name,
        type: reportDetails.type,
        lab: reportDetails.lab,
        file_url: filePath,
        uploaded_by: currentUser.id,
        date: new Date().toISOString().split("T")[0],
      });

      if (reportError) {
        console.error("Error creating report record:", reportError);
        return {
          success: false,
          message: "Failed to create report record in database",
        };
      }

      return {
        success: true,
        message: "Report uploaded successfully",
      };
    } catch (error) {
      console.error("Upload report error:", error);
      return {
        success: false,
        message: "An error occurred during report upload",
      };
    }
  };

  const handleUpload = async () => {
    if (!file || !patientPhone || !reportName || !reportType || !labName) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setShowSuccess(false);

    try {
      // Create a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from("reports")
        .upload(filePath, file);

      if (error) {
        throw new Error("File upload failed");
      }

      // Call uploadReport function
      const response = await uploadReport(
        patientPhone, 
        filePath, 
        {
          name: reportName,
          type: reportType,
          lab: labName
        }
      );

      if (response.success) {
        setShowSuccess(true);
        setPatientPhone("");
        setReportName("");
        setReportType("");
        setLabName("");
        setFile(null);
        
        if (onUploadSuccess) {
          onUploadSuccess();
        }
        
        toast({
          title: "Success",
          description: "Report uploaded successfully",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Upload Patient Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {showSuccess && (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <AlertTitle className="text-green-800">Success!</AlertTitle>
              <AlertDescription className="text-green-700">
                Report uploaded successfully.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="phoneInput" className="text-sm font-medium">
              Patient Phone Number
            </label>
            <Input
              id="phoneInput"
              placeholder="Enter patient phone number"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reportName" className="text-sm font-medium">
              Report Name
            </label>
            <Input
              id="reportName"
              placeholder="Enter report name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reportType" className="text-sm font-medium">
              Report Type
            </label>
            <Input
              id="reportType"
              placeholder="Enter report type (e.g., Blood Test, X-Ray)"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="labName" className="text-sm font-medium">
              Lab Name
            </label>
            <Input
              id="labName"
              placeholder="Enter lab name"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="fileInput" className="text-sm font-medium">
              Report File
            </label>
            <Input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500">
              Supported formats: PDF, JPG, PNG
            </p>
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={isUploading || !file || !patientPhone || !reportName || !reportType || !labName}
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Upload Report"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportUpload;
