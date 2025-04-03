
import React, { createContext, useState, useContext } from "react";

interface ReportFormState {
  name: string;
  type: string;
  file: File | null;
  patientId: string | null;
  patientName: string | null;
  labId: string | null;
  setPatient: (id: string, name: string | null) => void;
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

const initialState = {
  name: "",
  type: "Blood Test",
  file: null,
  patientId: null,
  patientName: null,
  labId: null,
  setPatient: () => {}  // This is a placeholder; actual implementation is in context provider
};

const ReportFormContext = createContext<ReportFormContextType | undefined>(undefined);

export const ReportFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(initialState);

  const setName = (name: string) => {
    setState(prev => ({ ...prev, name }));
  };

  const setType = (type: string) => {
    setState(prev => ({ ...prev, type }));
  };

  const setFile = (file: File | null) => {
    setState(prev => ({ ...prev, file }));
  };

  const setPatient = (id: string, name: string | null) => {
    setState(prev => ({ ...prev, patientId: id, patientName: name }));
  };

  const setLabId = (id: string | null) => {
    setState(prev => ({ ...prev, labId: id }));
  };

  const resetForm = () => {
    setState(initialState);
  };

  // Create a formState object that includes the state values and the setPatient method
  const formState: ReportFormState = {
    ...state,
    setPatient
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
