// Add this function to your PatientDashboard.tsx

// This is a modified portion of the viewReport function
const viewReport = async (fileUrl: string | undefined) => {
  if (!fileUrl) {
    toast({
      title: "Error",
      description: "No file available for this report",
      variant: "destructive"
    });
    return;
  }

  setViewError("");
  
  try {
    console.log("Attempting to access file:", fileUrl);
    
    // First try to get a public URL (simplest approach)
    const { data: publicUrlData } = supabase.storage
      .from('reports')
      .getPublicUrl(fileUrl);
      
    if (publicUrlData && publicUrlData.publicUrl) {
      console.log("Using public URL:", publicUrlData.publicUrl);
      window.open(publicUrlData.publicUrl, '_blank');
      return;
    }

    // If public URL fails, try signed URL as backup
    console.log("Public URL failed, trying signed URL...");
    const { data, error } = await supabase.storage
      .from('reports')
      .createSignedUrl(fileUrl, 60);
    
    if (error) {
      console.error("Error getting signed URL:", error);
      throw new Error(`Could not generate access link for this report: ${error.message}`);
    }
    
    if (!data || !data.signedUrl) {
      throw new Error("No valid URL generated for this report");
    }
    
    // Open the signed URL in a new tab
    console.log("Opening signed URL:", data.signedUrl);
    window.open(data.signedUrl, '_blank');
  } catch (error) {
    console.error('Error getting report file:', error);
    
    const errorMessage = error instanceof Error ? error.message : "Could not retrieve the report file";
    setViewError(errorMessage);
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive"
    });
  }
};
