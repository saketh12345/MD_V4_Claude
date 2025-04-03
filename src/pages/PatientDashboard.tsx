// Import Supabase Client
import { createClient } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast"; // Ensure correct import for toast

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// View Report Function
const viewReport = async (fileUrl: string | undefined) => {
  if (!fileUrl) {
    toast({
      title: "Error",
      description: "No file available for this report",
      variant: "destructive",
    });
    return;
  }

  setViewError("");

  try {
    console.log("Attempting to access file:", fileUrl);

    // 1️⃣ Try to get the public URL first
    const { publicUrl } = supabase.storage.from("reports").getPublicUrl(fileUrl);

    if (publicUrl) {
      console.log("Using public URL:", publicUrl);
      window.open(publicUrl, "_blank");
      return;
    }

    // 2️⃣ If public URL fails, try generating a signed URL
    console.log("Public URL failed, trying signed URL...");
    const { data, error } = await supabase.storage
      .from("reports")
      .createSignedUrl(fileUrl, 60);

    if (error || !data?.signedUrl) {
      throw new Error(error?.message || "No valid URL generated for this report");
    }

    // 3️⃣ Open the signed URL
    console.log("Opening signed URL:", data.signedUrl);
    window.open(data.signedUrl, "_blank");
  } catch (error) {
    console.error("Error getting report file:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Could not retrieve the report file";

    setViewError(errorMessage);

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  }
};

export default viewReport;
