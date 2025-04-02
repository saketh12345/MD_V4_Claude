
interface AuthUser {
  id: string;
  fullName?: string;
  centerName?: string;
  phone: string;
  userType: 'patient' | 'center';
}

// Mock storage for users since we're not using a backend
const USERS_STORAGE_KEY = 'medivault_users';
const CURRENT_USER_KEY = 'medivault_current_user';

// Get all registered users from localStorage
export const getUsers = (): Record<string, AuthUser> => {
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : {};
};

// Save users to localStorage
export const saveUsers = (users: Record<string, AuthUser>) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Register a new user
export const registerUser = (
  phone: string, 
  password: string, 
  userType: 'patient' | 'center',
  fullName?: string,
  centerName?: string,
  licenseNumber?: string
): { success: boolean; message: string } => {
  const users = getUsers();
  
  // Check if user already exists
  if (users[phone]) {
    return { 
      success: false, 
      message: 'A user with this phone number already exists'
    };
  }
  
  // Create a new user
  const newUser: AuthUser = {
    id: Date.now().toString(),
    phone,
    userType,
    ...(fullName ? { fullName } : {}),
    ...(centerName ? { centerName } : {})
  };
  
  // Add user to the users object
  users[phone] = newUser;
  
  // Store the user's password separately
  const passwordsJson = localStorage.getItem('medivault_passwords') || '{}';
  const passwords = JSON.parse(passwordsJson);
  passwords[phone] = password;
  localStorage.setItem('medivault_passwords', JSON.stringify(passwords));
  
  // Save the updated users
  saveUsers(users);
  
  return { 
    success: true, 
    message: 'Registration successful'
  };
};

// Login a user
export const loginUser = (
  phone: string,
  password: string
): { success: boolean; message: string; userType?: 'patient' | 'center' } => {
  const users = getUsers();
  const user = users[phone];
  
  // Check if user exists
  if (!user) {
    return { 
      success: false, 
      message: 'No account found with this phone number'
    };
  }
  
  // Check password
  const passwordsJson = localStorage.getItem('medivault_passwords') || '{}';
  const passwords = JSON.parse(passwordsJson);
  
  if (passwords[phone] !== password) {
    return { 
      success: false, 
      message: 'Incorrect password'
    };
  }
  
  // Set current user in localStorage
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  
  return { 
    success: true, 
    message: 'Login successful',
    userType: user.userType
  };
};

// Get current user
export const getCurrentUser = (): AuthUser | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Logout user
export const logoutUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Update user data
export const updateUserData = (updatedUser: AuthUser): boolean => {
  try {
    const users = getUsers();
    
    // Update user in users collection
    users[updatedUser.phone] = updatedUser;
    
    // Save updated users back to localStorage
    saveUsers(users);
    
    // Update current user if this is the current user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
};
