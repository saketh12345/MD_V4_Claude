
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const DiagnosticSettings = () => {
  const [labInfo, setLabInfo] = useState({
    labName: "City Diagnostics",
    labDirector: "Dr. Jane Smith",
    email: "info@citydiagnostics.com",
    phone: "+1 (555) 123-4567",
    address: "123 Medical Plaza, Suite 100, New York, NY 10001",
    description: "Providing accurate and timely diagnostic services since 2005."
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setLabInfo({
      ...labInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would save the data to the backend here
    console.log("Saving lab info:", labInfo);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-4xl mx-auto">
        <div className="my-6">
          <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white">
            Lab Profile
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Lab Information</h2>
              <p className="text-gray-600">
                Update your diagnostic center's details and contact information
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="labName" className="block text-sm font-medium mb-1">
                    Lab Name
                  </label>
                  <Input
                    id="labName"
                    name="labName"
                    value={labInfo.labName}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="labDirector" className="block text-sm font-medium mb-1">
                    Lab Director
                  </label>
                  <Input
                    id="labDirector"
                    name="labDirector"
                    value={labInfo.labDirector}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={labInfo.email}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={labInfo.phone}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">
                  Address
                </label>
                <Input
                  id="address"
                  name="address"
                  value={labInfo.address}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Lab Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={labInfo.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full resize-none"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DiagnosticSettings;
