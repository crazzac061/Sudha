const API_BASE_URL = 'https://api.circularchain.com'; // Replace with your actual API URL

interface WasteListing {
  type: string;
  quantity: number;
  unit: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  condition: string;
  images: string[];
  availableFrom: string;
}

export const api = {
  // Authentication
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Waste Listings
  createWasteListing: async (listing: WasteListing, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/waste/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(listing),
      });
      return await response.json();
    } catch (error) {
      console.error('Create listing error:', error);
      throw error;
    }
  },

  getWasteListings: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/waste/listings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Get listings error:', error);
      throw error;
    }
  },

  // QR Code
  verifyQRCode: async (qrData: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/waste/verify-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ qrData }),
      });
      return await response.json();
    } catch (error) {
      console.error('QR verification error:', error);
      throw error;
    }
  },

  // User Profile
  getUserProfile: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateUserProfile: async (profileData: any, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
};
