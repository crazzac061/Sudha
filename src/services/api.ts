import { User, LoginCredentials, RegisterData } from '../types/user';

const API_BASE_URL = 'http://192.168.1.80:3000/api'; // Development server URL

interface WasteListing {
  type: string;
  quantity: number;
  unit: string;
  location: {
    type: string;
    coordinates: [number, number];
    address?: string;
  };
  condition: string;
  description: string;
  images: string[];
  status?: 'available' | 'collected' | 'recycled';
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ImageUpload {
  uri: string;
  type: string;
  name: string;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const api = {
  // Authentication
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      return handleResponse<LoginResponse>(response);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData: RegisterData): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return handleResponse<LoginResponse>(response);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Waste Management
  createWasteListing: async (listing: WasteListing, token: string): Promise<ApiResponse<WasteListing>> => {
    try {
      const formData = new FormData();
      
      // Handle non-file fields
      Object.entries(listing).forEach(([key, value]) => {
        if (key === 'images') {
          // Skip images array, we'll handle it separately
          return;
        } else if (key === 'location') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      // Handle image uploads
      listing.images.forEach((imageUri, index) => {
        const imageUpload: ImageUpload = {
          uri: imageUri,
          type: 'image/jpeg',
          name: `image-${index}.jpg`,
        };
        formData.append('images', imageUpload as unknown as Blob);
      });

      const response = await fetch(`${API_BASE_URL}/waste`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      return handleResponse<ApiResponse<WasteListing>>(response);
    } catch (error) {
      console.error('Create listing error:', error);
      throw error;
    }
  },

  getWasteListings: async (params: {
    type?: string;
    status?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }, token: string): Promise<ApiResponse<WasteListing[]>> => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      
      const response = await fetch(`${API_BASE_URL}/waste?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse<ApiResponse<WasteListing[]>>(response);
    } catch (error) {
      console.error('Get listings error:', error);
      throw error;
    }
  },

  getWasteDetails: async (id: string, token: string): Promise<ApiResponse<WasteListing>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/waste/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse<ApiResponse<WasteListing>>(response);
    } catch (error) {
      console.error('Get waste details error:', error);
      throw error;
    }
  },

  updateWasteStatus: async (id: string, status: string, token: string): Promise<ApiResponse<WasteListing>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/waste/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      return handleResponse<ApiResponse<WasteListing>>(response);
    } catch (error) {
      console.error('Update waste status error:', error);
      throw error;
    }
  },

  // User Profile
  getCurrentUser: async (token: string): Promise<ApiResponse<User>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse<ApiResponse<User>>(response);
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  updateProfile: async (profileData: Partial<User>, token: string): Promise<ApiResponse<User>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      return handleResponse<ApiResponse<User>>(response);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
};
