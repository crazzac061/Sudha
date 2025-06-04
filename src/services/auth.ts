import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthData, LoginCredentials, RegisterData, User } from '../types/user';

const API_URL = 'https://api.circularchain.com'; // Replace with your actual API URL

class AuthService {
  private static AUTH_TOKEN_KEY = '@auth_token';
  private static USER_KEY = '@user_data';

  async login(credentials: LoginCredentials): Promise<AuthData> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      await this.saveAuthData(data);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthData> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const authData = await response.json();
      await this.saveAuthData(authData);
      return authData;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AuthService.AUTH_TOKEN_KEY, AuthService.USER_KEY]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const token = await this.getToken();
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      await this.saveUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
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
