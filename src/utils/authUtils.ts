import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

interface AuthUser {
  id: string;
  fullName?: string;
  centerName?: string;
  phone: string;
  userType: 'patient' | 'center';
}

// Register a new user
export const registerUser = async (
  phone: string, 
  password: string, 
  userType: 'patient' | 'center',
  fullName?: string,
  centerName?: string,
  licenseNumber?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("Registering new user with phone:", phone);
    // Save phone number in original format for user-friendly display
    const originalPhone = phone.trim();
    // For database operations, use the original format
    
    // Register the user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      phone: originalPhone,
      password,
      options: {
        data: {
          phone: originalPhone,
          user_type: userType,
          full_name: fullName,
          center_name: centerName,
          license_number: licenseNumber
        }
      }
    });
    
    if (authError) {
      console.error("Auth error during signup:", authError);
      return { 
        success: false, 
        message: authError.message 
      };
    }
    
    // Create profile entry
    if (authData.user) {
      const profileData: ProfileInsert = {
        id: authData.user.id,
        phone: originalPhone, // Save the original format
        user_type: userType,
        full_name: fullName,
        center_name: centerName
      };
      
      console.log("Creating profile with data:", profileData);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);
      
      if (profileError) {
        console.error("Profile creation error:", profileError);
        return { 
          success: false, 
          message: "Account created but profile setup failed. Please contact support." 
        };
      }
    }
    
    return { 
      success: true, 
      message: 'Registration successful' 
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { 
      success: false, 
      message: 'An unexpected error occurred during registration' 
    };
  }
};

// Login a user
export const loginUser = async (
  phone: string,
  password: string
): Promise<{ success: boolean; message: string; userType?: 'patient' | 'center' }> => {
  try {
    console.log("Attempting login with phone:", phone);
    // Original format for phone
    const originalPhone = phone.trim();
    
    // Sign in with Supabase using phone
    const { data, error } = await supabase.auth.signInWithPassword({
      phone: originalPhone,
      password
    });
    
    if (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: error.message 
      };
    }
    
    if (!data.user) {
      return { 
        success: false, 
        message: 'No account found with this phone number' 
      };
    }
    
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return { 
        success: false, 
        message: 'Error retrieving user profile' 
      };
    }
    
    // If profile doesn't exist, create one based on auth metadata
    if (!profile) {
      console.log("Profile not found, creating from user metadata");
      const userMeta = data.user.user_metadata;
      
      const newProfile: ProfileInsert = {
        id: data.user.id,
        phone: originalPhone || userMeta.phone,
        user_type: userMeta.user_type as 'patient' | 'center',
        full_name: userMeta.full_name,
        center_name: userMeta.center_name
      };
      
      console.log("Creating profile during login:", newProfile);
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(newProfile);
      
      if (insertError) {
        console.error("Profile creation error during login:", insertError);
        return { 
          success: false, 
          message: 'Failed to create user profile' 
        };
      }
      
      return { 
        success: true, 
        message: 'Login successful',
        userType: userMeta.user_type as 'patient' | 'center'
      };
    }
    
    return { 
      success: true, 
      message: 'Login successful',
      userType: profile.user_type as 'patient' | 'center'
    };
  } catch (error) {
    console.error("Login error:", error);
    return { 
      success: false, 
      message: 'An unexpected error occurred during login' 
    };
  }
};

// Get current user
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (error || !profile) return null;
    
    return {
      id: profile.id,
      fullName: profile.full_name || undefined,
      centerName: profile.center_name || undefined,
      phone: profile.phone,
      userType: profile.user_type as 'patient' | 'center'
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// Update user data
export const updateUserData = async (updatedUser: AuthUser): Promise<boolean> => {
  try {
    console.log("Updating user profile:", updatedUser);
    
    // Keep phone in original format
    const originalPhone = updatedUser.phone.trim();
    
    // Update profile in Supabase
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: updatedUser.fullName,
        center_name: updatedUser.centerName,
        phone: originalPhone,
      })
      .eq('id', updatedUser.id);
    
    if (error) {
      console.error("Profile update error:", error);
      return false;
    }
    
    console.log("Profile updated successfully");
    
    // Also update auth metadata to keep everything in sync
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        phone: originalPhone,
        full_name: updatedUser.fullName,
        center_name: updatedUser.centerName
      }
    });
    
    if (authError) {
      console.error("Auth metadata update error:", authError);
      // Continue anyway as the profile was updated successfully
    }
    
    return true;
  } catch (error) {
    console.error("Update user data error:", error);
    return false;
  }
};

// For backward compatibility with localStorage implementation
// These functions simulate the old behavior but use Supabase under the hood
export const getUsers = async (): Promise<Record<string, AuthUser>> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) return {};
  return { [currentUser.phone]: currentUser };
};

export const saveUsers = async (): Promise<void> => {
  // No-op in Supabase implementation
  return;
};
