
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCurrentUser } from "@/utils/authUtils";
import { FileUp, Loader2, Search } from "lucide-react";

interface ReportUploadProps {
  onUploadSuccess?: () => void;
}

const ReportUpload = ({ onUploadSuccess }: ReportUploadProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [patientPhone, setPatientPhone] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);
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

  const searchPatient = async () => {
    if (!patientPhone || patientPhone.length < 10) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setPatientId(null);
    setPatientName("");

    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, name")
        .eq("phone_number", patientPhone)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPatientId(data.id);
        setPatientName(data.name || "");
        toast({
          title: "Patient Found",
          description: `Found patient: ${data.name || "Unnamed Patient"}`,
        });
      } else {
        toast({
          title: "Patient Not Found",
          description: "No patient found with this phone number. Please add them first in the Patient Management tab.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching for patient:", error);
      toast({
        title: "Search Error",
        description: "Failed to search for patient",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const uploadReport = async () => {
    if (!file || !patientId || !reportName || !reportType || !labName) {
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
      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const currentUser = await getCurrentUser();

      if (!currentUser) {
        throw new Error("You must be logged in to upload reports");
      }

      // Create a report record
      const { error: reportError } = await supabase.from("reports").insert({
        patient_id: patientId,
        name: reportName,
        type: reportType,
        lab: labName,
        file_url: filePath,
        uploaded_by: currentUser.id,
        date: new Date().toISOString().split("T")[0],
      });

      if (reportError) throw reportError;

      // Reset form and show success
      setReportName("");
      setReportType("");
      setLabName("");
      setFile(null);
      setShowSuccess(true);
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
      toast({
        title: "Success",
        description: "Report uploaded successfully",
      });
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
    <div className="space-y-4">
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200 mb-4">
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Report uploaded successfully.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Enter patient phone number"
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={searchPatient} 
            disabled={isSearching || !patientPhone}
            className="flex-shrink-0"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Search className="h-4 w-4 mr-1" />
            )}
            Search
          </Button>
        </div>

        {patientId && (
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-blue-800 font-medium">Patient: {patientName}</p>
            <p className="text-blue-600 text-sm">ID: {patientId}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="reportName" className="text-sm font-medium">
            Report Name
          </label>
          <Input
            id="reportName"
            placeholder="Enter report name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            disabled={!patientId}
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
            disabled={!patientId}
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
            disabled={!patientId}
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
            disabled={!patientId}
          />
          <p className="text-xs text-gray-500">
            Supported formats: PDF, JPG, PNG
          </p>
        </div>

        <Button 
          onClick={uploadReport} 
          disabled={isUploading || !file || !patientId || !reportName || !reportType || !labName}
          className="w-full flex items-center gap-2"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="h-4 w-4" />
          )}
          {isUploading ? "Uploading..." : "Upload Report"}
        </Button>
      </div>
    </div>
  );
};

export default ReportUpload;
