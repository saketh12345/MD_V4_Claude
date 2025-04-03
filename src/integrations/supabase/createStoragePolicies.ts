
import { supabase } from "./client";

// This function should be called once during app initialization
// It sets up the necessary RLS policies for the reports bucket
export const setupStoragePolicies = async () => {
  try {
    // First, check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      return { success: false, error: listError };
    }
    
    const reportsBucketExists = buckets?.some(bucket => bucket.name === 'reports');
    
    if (!reportsBucketExists) {
      console.log("Creating reports bucket with public access...");
      const { error: createError } = await supabase.storage.createBucket('reports', {
        public: true,
        fileSizeLimit: 50000000 // 50MB limit
      });
      
      if (createError) {
        console.error("Error creating reports bucket:", createError);
        return { success: false, error: createError };
      }
    }
    
    console.log("Reports bucket is ready");
    return { success: true };
  } catch (error) {
    console.error("Error setting up storage policies:", error);
    return { success: false, error };
  }
};
