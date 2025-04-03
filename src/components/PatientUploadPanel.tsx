
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define form validation schema
const patientSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone_number: z.string().min(10, { message: "Please enter a valid phone number" }),
  email: z.string().email({ message: "Please enter a valid email" }).optional().or(z.literal("")),
});

type PatientFormValues = z.infer<typeof patientSchema>;

const PatientUploadPanel = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Initialize form
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      phone_number: "",
      email: "",
    },
  });
  
  const onSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true);
    setShowSuccess(false);
    
    try {
      // Check if patient already exists with the same phone number
      const { data: existingPatient, error: searchError } = await supabase
        .from("patients")
        .select("id")
        .eq("phone_number", data.phone_number)
        .maybeSingle();
        
      if (searchError) throw searchError;
      
      let patientId;
      
      if (existingPatient) {
        // Update existing patient
        patientId = existingPatient.id;
        const { error: updateError } = await supabase
          .from("patients")
          .update({ 
            name: data.name,
            email: data.email || null 
          })
          .eq("id", patientId);
          
        if (updateError) throw updateError;
        
        toast({
          title: "Patient Updated",
          description: "Patient information has been updated",
        });
      } else {
        // Create new patient
        const { data: newPatient, error: insertError } = await supabase
          .from("patients")
          .insert({ 
            name: data.name,
            phone_number: data.phone_number,
            email: data.email || null 
          })
          .select("id")
          .single();
          
        if (insertError) throw insertError;
        
        patientId = newPatient.id;
        
        toast({
          title: "Patient Created",
          description: "New patient has been added to the system",
        });
      }
      
      // Reset form and show success message
      form.reset();
      setShowSuccess(true);
      
    } catch (error) {
      console.error("Error managing patient:", error);
      toast({
        title: "Error",
        description: "Failed to save patient information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Patient information saved successfully. You can now upload reports for this patient.
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Patient"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-gray-500">
        <p>Add patients to the system before uploading their reports</p>
        <p>Patients are identified by their phone number</p>
      </div>
    </div>
  );
};

export default PatientUploadPanel;
