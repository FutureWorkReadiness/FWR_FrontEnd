// Authentication utilities using localStorage

// User data structure
const createUser = (email, name, industry = null) => ({
  id: Date.now().toString(),
  email,
  name,
  industry,
  createdAt: new Date().toISOString(),
  readinessScore: 0,
  technicalScore: 0,
  softSkillsScore: 0,
  leadershipScore: 0,
  completedTests: [],
  badges: [],
  recentActivity: []
});

// Register a new user
export const registerUser = (email, password, name) => {
  try {
    // Check if user already exists
    const existingUsers = getUsers();
    if (existingUsers.find(user => user.email === email)) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const newUser = createUser(email, name);
    
    // Store user credentials (in real app, password would be hashed on backend)
    const credentials = getCredentials();
    credentials[email] = { password, userId: newUser.id };
    localStorage.setItem('userCredentials', JSON.stringify(credentials));
    
    // Store user data
    const users = [...existingUsers, newUser];
    localStorage.setItem('users', JSON.stringify(users));
    
    // Set current user
    setCurrentUser(newUser);
    
    return { success: true, user: newUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Login user
export const loginUser = (email, password) => {
  try {
    const credentials = getCredentials();
    const userCredential = credentials[email];
    
    if (!userCredential || userCredential.password !== password) {
      throw new Error('Invalid email or password');
    }
    
    // Find user data
    const users = getUsers();
    const user = users.find(u => u.id === userCredential.userId);
    
    if (!user) {
      throw new Error('User data not found');
    }
    
    // Set current user
    setCurrentUser(user);
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('currentUser');
};

// Get current user
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// Set current user
export const setCurrentUser = (user) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

// Check if user is logged in
export const isLoggedIn = () => {
  return getCurrentUser() !== null;
};

// Update user data
export const updateUser = (updatedUser) => {
  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    users[userIndex] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));
    setCurrentUser(updatedUser);
    
    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Helper functions
const getUsers = () => {
  try {
    const usersStr = localStorage.getItem('users');
    return usersStr ? JSON.parse(usersStr) : [];
  } catch {
    return [];
  }
};

const getCredentials = () => {
  try {
    const credStr = localStorage.getItem('userCredentials');
    return credStr ? JSON.parse(credStr) : {};
  } catch {
    return {};
  }
};

// Update user's selected industry
export const updateUserIndustry = (industry) => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, industry };
    return updateUser(updatedUser);
  }
  return { success: false, error: 'No user logged in' };
};

// Update user's scores
export const updateUserScores = (scores) => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...scores };
    return updateUser(updatedUser);
  }
  return { success: false, error: 'No user logged in' };
};
