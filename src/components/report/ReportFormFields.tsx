
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReportForm } from "@/contexts/ReportFormContext";

const ReportFormFields: React.FC = () => {
  const { formState, setName, setType } = useReportForm();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "name") {
      setName(value);
    }
  };

  const handleTypeChange = (value: string) => {
    setType(value);
  };

  return (
    <>
      <div>
        <Label htmlFor="name">Report Name</Label>
        <Input 
          id="name" 
          name="name" 
          placeholder="e.g. Complete Blood Count" 
          value={formState.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="type">Report Type</Label>
        <Select 
          value={formState.type} 
          onValueChange={handleTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Blood Test">Blood Test</SelectItem>
            <SelectItem value="Urine Test">Urine Test</SelectItem>
            <SelectItem value="X-Ray">X-Ray</SelectItem>
            <SelectItem value="MRI">MRI</SelectItem>
            <SelectItem value="CT Scan">CT Scan</SelectItem>
            <SelectItem value="Ultrasound">Ultrasound</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default ReportFormFields;
