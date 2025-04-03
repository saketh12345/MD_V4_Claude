
import React from "react";
import { Button } from "@/components/ui/button";
import { useReportForm } from "@/contexts/ReportFormContext";
import { ReportFormProvider } from "@/contexts/ReportFormContext";
import { useReportUpload } from "@/hooks/useReportUpload";
import PatientLookup from "@/components/PatientLookup";
import PatientInfo from "@/components/report/PatientInfo";
import ReportFormFields from "@/components/report/ReportFormFields";
import LabInitializer from "@/components/report/LabInitializer";

interface ReportUploadFormProps {
  centerName: string;
  centerId: string;
  onSuccess: () => void;
}

const ReportUploadFormContent: React.FC<ReportUploadFormProps> = ({ centerName, centerId, onSuccess }) => {
  const { formState, resetForm } = useReportForm();
  const { uploadReport, uploading } = useReportUpload(onSuccess);

  const handlePatientFound = (id: string, name: string | null) => {
    formState.setPatient(id, name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.patientId || !formState.labId) {
      return; // Button should be disabled in this case anyway
    }
    
    const success = await uploadReport({
      name: formState.name,
      type: formState.type,
      patientId: formState.patientId,
      labId: formState.labId,
      centerName,
      file: formState.file
    });
    
    if (success) {
      resetForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <LabInitializer centerName={centerName} />
      <PatientLookup onPatientFound={handlePatientFound} />
      <PatientInfo />
      <ReportFormFields />
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={uploading || !formState.patientId || !formState.labId}
      >
        {uploading ? "Uploading..." : "Upload Report"}
      </Button>
    </form>
  );
};

// Wrapper component that provides the context
const ReportUploadForm: React.FC<ReportUploadFormProps> = (props) => {
  return (
    <ReportFormProvider>
      <ReportUploadFormContent {...props} />
    </ReportFormProvider>
  );
};

export default ReportUploadForm;
