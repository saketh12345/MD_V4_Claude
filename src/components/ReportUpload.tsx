
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
  const [isCheckingBucket, setIsCheckingBucket] = useState(false);
  const [patientPhone, setPatientPhone] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("");
  const [labName, setLabName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Check if the reports bucket exists, and create it if needed with robust error handling
  const ensureReportsBucketExists = async () => {
    setIsCheckingBucket(true);
    setErrorMessage(null);
    setDebugInfo(null);
    
    try {
      console.log("Checking if reports bucket exists...");
      
      // First, check if the bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("Error listing buckets:", listError);
        setDebugInfo(`Bucket list error: ${JSON.stringify(listError, null, 2)}`);
        
        // Check if this is a permissions issue
        if (listError.message.includes("permission") || listError.message.includes("not authorized")) {
          throw new Error(`You don't have permission to list storage buckets. This might be due to restrictive Row Level Security policies.`);
        } else {
          throw new Error(`Failed to check if reports bucket exists: ${listError.message}`);
        }
      }
      
      const reportsBucketExists = buckets?.some(bucket => bucket.name === 'reports');
      
      if (!reportsBucketExists) {
        console.log("Reports bucket does not exist, creating it now...");
        
        try {
          // First try with public access
          const { data, error } = await supabase.storage.createBucket('reports', {
            public: true,
            fileSizeLimit: 50000000 // 50MB limit
          });
          
          if (error) {
            console.error("Error creating public bucket:", error);
            
            // If the first attempt fails with public access, try without specifying public
            console.log("Retrying with default bucket settings...");
            const { error: retryError } = await supabase.storage.createBucket('reports');
            
            if (retryError) {
              console.error("Error creating bucket with default settings:", retryError);
              setDebugInfo(`Bucket creation retry error: ${JSON.stringify(retryError, null, 2)}`);
              
              // Check for specific error messages
              if (retryError.message.includes("already exists")) {
                console.log("Bucket appears to already exist despite not showing in list");
                // If it already exists, we can continue
                return true;
              } else {
                throw new Error(`Failed to create reports bucket: ${retryError.message}`);
              }
            }
          }
        } catch (bucketCreateError) {
          console.error("Bucket creation exception:", bucketCreateError);
          setDebugInfo(`Bucket creation exception: ${JSON.stringify(bucketCreateError, null, 2)}`);
          throw bucketCreateError;
        }
        
        console.log("Reports bucket created successfully");
      } else {
        console.log("Reports bucket already exists");
      }
      
      // Add public policy for the bucket if it doesn't already have one
      try {
        console.log("Attempting to create a public policy for the reports bucket...");
        const { error: policyError } = await supabase.storage.from('reports').createSignedUrl('test-policy.txt', 60);
        
        if (policyError && !policyError.message.includes("not found")) {
          console.log("Setting public policy for reports bucket");
          const policies = [
            { name: 'public-read', definition: { bucket_id: 'reports', action: 'SELECT', role: '*' } },
            { name: 'authenticated-insert', definition: { bucket_id: 'reports', action: 'INSERT', role: 'authenticated' } }
          ];
          
          // Note: This won't actually work in the client, but might inform the user about what's needed
          console.log("Policies should be configured on the server side");
        }
      } catch (policyError) {
        console.warn("Policy check/create error (non-fatal):", policyError);
      }
      
      return true;
    } catch (error) {
      console.error("Error ensuring reports bucket exists:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to initialize storage bucket");
      return false;
    } finally {
      setIsCheckingBucket(false);
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
    setErrorMessage(null);
    setDebugInfo(null);

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
      setDebugInfo(JSON.stringify(error, null, 2));
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
    setErrorMessage(null);
    setDebugInfo(null);

    try {
      // First, ensure the reports bucket exists
      const bucketReady = await ensureReportsBucketExists();
      if (!bucketReady) {
        throw new Error("Failed to initialize storage for upload. Please try again.");
      }

      // Verify patient exists before attempting upload
      const { data: patientCheck, error: patientError } = await supabase
        .from("patients")
        .select("id")
        .eq("id", patientId)
        .single();

      if (patientError || !patientCheck) {
        const errorDetails = JSON.stringify(patientError, null, 2);
        setDebugInfo(`Patient verification error: ${errorDetails}`);
        throw new Error(`Patient not found. Please verify the patient exists. Details: ${errorDetails}`);
      }

      // Create a unique filename to avoid conflicts
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = fileName; // Use just the filename without redundant "reports/" prefix

      console.log(`Attempting to upload file ${fileName} to reports bucket...`);

      // Upload file to Supabase storage - FIX: removed redundant "reports/" path prefix
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("reports")
        .upload(filePath, file);

      if (uploadError) {
        setDebugInfo(`File upload error: ${JSON.stringify(uploadError, null, 2)}`);
        throw uploadError;
      }

      console.log("File uploaded successfully:", uploadData);
      
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        throw new Error("You must be logged in to upload reports");
      }

      // Create a report record
      const { error: reportError, data: reportData } = await supabase.from("reports").insert({
        patient_id: patientId,
        name: reportName,
        type: reportType,
        lab: labName,
        file_url: filePath, // Store the path, not the full URL
        uploaded_by: currentUser.id,
        date: new Date().toISOString().split("T")[0],
      }).select();

      if (reportError) {
        setDebugInfo(`Report creation error: ${JSON.stringify(reportError, null, 2)}`);
        throw reportError;
      }

      console.log("Report record created:", reportData);

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
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
      if (!debugInfo) {
        setDebugInfo(JSON.stringify(error, null, 2));
      }
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

      {errorMessage && (
        <Alert className="bg-red-50 border-red-200 mb-4" variant="destructive">
          <AlertTitle>Upload Failed</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {debugInfo && (
        <Alert className="bg-yellow-50 border-yellow-200 mb-4">
          <AlertTitle className="text-yellow-800">Debug Information</AlertTitle>
          <AlertDescription className="text-yellow-700 whitespace-pre-wrap overflow-auto max-h-60">
            {debugInfo}
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
          disabled={isUploading || isCheckingBucket || !file || !patientId || !reportName || !reportType || !labName}
          className="w-full flex items-center gap-2"
        >
          {(isUploading || isCheckingBucket) ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="h-4 w-4" />
          )}
          {isCheckingBucket ? "Checking storage..." : isUploading ? "Uploading..." : "Upload Report"}
        </Button>
      </div>
    </div>
  );
};

export default ReportUpload;
