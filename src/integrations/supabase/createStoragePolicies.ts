
import { supabase } from "./client";

// This function should be called once during app initialization
// It sets up the necessary storage configuration for the reports bucket
export const setupStoragePolicies = async () => {
  try {
    console.log("Setting up storage for the reports bucket...");
    
    // First, check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      return { success: false, error: listError };
    }
    
    const reportsBucketExists = buckets?.some(bucket => bucket.name === 'reports');
    
    if (!reportsBucketExists) {
      console.log("Creating reports bucket...");
      const { error: createError } = await supabase.storage.createBucket('reports', {
        public: false, // Not public by default, access will be controlled by policies
        fileSizeLimit: 50000000 // 50MB limit
      });
      
      if (createError) {
        // Check if it's because the bucket already exists (race condition)
        if (createError.message.includes("already exists")) {
          console.log("Bucket already exists (created by another process)");
        } else {
          console.error("Error creating reports bucket:", createError);
          return { success: false, error: createError };
        }
      } else {
        console.log("Reports bucket created successfully");
      }
    } else {
      console.log("Reports bucket already exists");
    }
    
    // Test the storage permissions by attempting to list files
    // This helps verify our policies are working
    console.log("Testing storage access...");
    const { error: testError } = await supabase.storage.from('reports').list();
    
    if (testError) {
      console.warn("Storage access test warning:", testError);
      console.log("Storage policies may need additional configuration");
    } else {
      console.log("Storage access test successful");
    }
    
    console.log("Storage setup complete");
    return { success: true };
  } catch (error) {
    console.error("Error setting up storage:", error);
    return { success: false, error };
  }
};
