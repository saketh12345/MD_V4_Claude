
import React from "react";
import { useReportForm } from "@/contexts/ReportFormContext";

const PatientInfo: React.FC = () => {
  const { formState } = useReportForm();
  const { patientId, patientName } = formState;

  if (!patientId) return null;

  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
      <p className="text-sm font-medium">
        Patient: {patientName || "Unknown"}
      </p>
      <p className="text-xs text-green-700">
        Report will be linked to this patient's account
      </p>
    </div>
  );
};

export default PatientInfo;
