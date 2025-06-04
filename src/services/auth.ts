// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { AuthData, LoginCredentials, RegisterData, User } from '../types/user';

// // Use your local IP address here, not localhost
// const API_URL = 'http://192.168.1.80:3000/api'; // Update this with your actual local IP

// class AuthService {
//   private static AUTH_TOKEN_KEY = '@auth_token';
//   private static USER_KEY = '@user_data';

//   async login(credentials: LoginCredentials): Promise<AuthData> {
//     try {
//       const response = await fetch(`${API_URL}/auth/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(credentials),
//       });

//       if (!response.ok) {
//         throw new Error('Invalid credentials');
//       }

//       const data = await response.json();
//       await this.saveAuthData(data);
//       return data;
//     } catch (error) {
//       throw error;
//     }
//   }

//   async register(data: RegisterData): Promise<AuthData> {
//     try {
//       const response = await fetch(`${API_URL}/auth/register`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//         },
//         body: JSON.stringify(data),
//       });

//       const responseData = await response.json();

//       if (!response.ok) {
//         throw new Error(responseData.message || 'Registration failed');
//       }

//       await this.saveAuthData(responseData);
//       return responseData;
//     } catch (error: any) {
//       console.error('Registration error:', error);
//       throw new Error(error.message || 'Registration failed. Please try again.');
//     }
//   }

//   async logout(): Promise<void> {
//     try {
//       await AsyncStorage.multiRemove([AuthService.AUTH_TOKEN_KEY, AuthService.USER_KEY]);
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   }

//   async updateProfile(userData: Partial<User>): Promise<User> {
//     const token = await this.getToken();
//     try {
//       const response = await fetch(`${API_URL}/users/profile`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify(userData),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update profile');
//       }

//       const updatedUser = await response.json();
//       await this.saveUser(updatedUser);
//       return updatedUser;
//     } catch (error) {
//       throw error;
//     }
//   }
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthData, LoginCredentials, RegisterData, User } from '../types/user';

const API_URL = 'http://192.168.1.80:3000/api'; // Updated to match backend port
const TIMEOUT_MS = 10000; // 10 second timeout

interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}

class AuthService {
  private static AUTH_TOKEN_KEY = '@auth_token';
  private static USER_KEY = '@user_data';

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return response;
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your internet connection');
      }
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthData> {
    try {
      const response = await this.fetchWithTimeout(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = new Error(data.message || 'Login failed');
        error.statusCode = response.status;
        error.details = data;
        throw error;
      }

      await this.saveAuthData(data);
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  }

  async register(data: RegisterData): Promise<AuthData> {
    try {
      const response = await this.fetchWithTimeout(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const error: ApiError = new Error(responseData.message || 'Registration failed');
        error.statusCode = response.status;
        error.details = responseData;
        throw error;
      }

      await this.saveAuthData(responseData);
      return responseData;
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.statusCode === 409) {
        throw new Error('Email already registered. Please use a different email.');
      }
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AuthService.AUTH_TOKEN_KEY, AuthService.USER_KEY]);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout. Please try again.');
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await this.fetchWithTimeout(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = new Error(data.message || 'Failed to update profile');
        error.statusCode = response.status;
        error.details = data;
        throw error;
      }

      await this.saveUser(data);
      return data;
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.message || 'Failed to update profile. Please try again.');
    }
  }

 

  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(AuthService.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AuthService.AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  private async saveAuthData(data: AuthData): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [AuthService.AUTH_TOKEN_KEY, data.token],
        [AuthService.USER_KEY, JSON.stringify(data.user)],
      ]);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  }

  private async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
