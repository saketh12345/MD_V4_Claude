
import React, { createContext, useState, useContext } from "react";

interface ReportFormState {
  name: string;
  type: string;
  file: File | null;
  patientId: string | null;
  patientName: string | null;
  labId: string | null;
}

interface ReportFormContextType {
  formState: ReportFormState;
  setName: (name: string) => void;
  setType: (type: string) => void;
  setFile: (file: File | null) => void;
  setPatient: (id: string, name: string | null) => void;
  setLabId: (id: string | null) => void;
  resetForm: () => void;
}

const initialState: ReportFormState = {
  name: "",
  type: "Blood Test",
  file: null,
  patientId: null,
  patientName: null,
  labId: null
};

const ReportFormContext = createContext<ReportFormContextType | undefined>(undefined);

export const ReportFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formState, setFormState] = useState<ReportFormState>(initialState);

  const setName = (name: string) => {
    setFormState(prev => ({ ...prev, name }));
  };

  const setType = (type: string) => {
    setFormState(prev => ({ ...prev, type }));
  };

  const setFile = (file: File | null) => {
    setFormState(prev => ({ ...prev, file }));
  };

  const setPatient = (id: string, name: string | null) => {
    setFormState(prev => ({ ...prev, patientId: id, patientName: name }));
  };

  const setLabId = (id: string | null) => {
    setFormState(prev => ({ ...prev, labId: id }));
  };

  const resetForm = () => {
    setFormState(initialState);
  };

  return (
    <ReportFormContext.Provider 
      value={{ 
        formState, 
        setName, 
        setType, 
        setFile, 
        setPatient, 
        setLabId, 
        resetForm 
      }}
    >
      {children}
    </ReportFormContext.Provider>
  );
};

export const useReportForm = () => {
  const context = useContext(ReportFormContext);
  if (context === undefined) {
    throw new Error("useReportForm must be used within a ReportFormProvider");
  }
  return context;
};
