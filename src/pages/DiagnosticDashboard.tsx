
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const DiagnosticDashboard = () => {
  const [reportForm, setReportForm] = useState({
    reportType: "",
    patientPhone: "",
    file: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReportForm({
        ...reportForm,
        file: e.target.files[0]
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setReportForm({
      ...reportForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would upload the file to the backend here
    console.log("Uploading report:", reportForm);
  };

  return (
    <DashboardLayout 
      title="Diagnostic Lab Dashboard" 
      subtitle="Upload and manage your patient reports"
    >
      <div className="flex justify-center">
        <Card className="max-w-2xl w-full bg-white shadow-sm">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold">Upload Medical Report</h2>
              <p className="text-gray-600">Upload a new medical report for a patient</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reportType" className="text-center block font-medium">
                  Report Type
                </Label>
                <select
                  id="reportType"
                  name="reportType"
                  value={reportForm.reportType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Select report type</option>
                  <option value="blood">Blood Test</option>
                  <option value="radiology">Radiology</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="pathology">Pathology</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientPhone" className="text-center block font-medium">
                  Patient Phone Number
                </Label>
                <Input
                  id="patientPhone"
                  name="patientPhone"
                  value={reportForm.patientPhone}
                  onChange={handleChange}
                  placeholder="Enter patient phone number"
                  className="w-full"
                />
                <p className="text-center text-sm text-gray-600">
                  Enter the patient's phone number to link the report to their account
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file" className="text-center block font-medium">
                  File
                </Label>
                <div className="border border-gray-300 rounded-md p-3">
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">
                      {reportForm.file ? reportForm.file.name : "No file selected."}
                    </span>
                    <label
                      htmlFor="file"
                      className="cursor-pointer text-blue-600 hover:text-blue-800"
                    >
                      Browse...
                    </label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                Upload Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DiagnosticDashboard;
