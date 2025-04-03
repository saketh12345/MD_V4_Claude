// This file contains type definitions for Supabase RPC functions

// RPC function parameter types
export interface GetPatientByPhoneParams {
  phone: string;
}

export interface InsertPatientParams {
  p_name: string;
  p_phone: string;
  p_email: string | null;
}

export interface FindOrCreateLabParams {
  lab_name: string;
}

export interface InsertReportParams {
  r_name: string;
  r_type: string;
  r_lab: string;
  r_patient_id: string;
  r_file_url: null;
  r_uploaded_by: string;
}

// RPC function response types
export interface PatientResponse {
  id: string;
  name: string;
}

export interface LabResponse {
  id: string;
}
