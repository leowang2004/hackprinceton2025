import axios from 'axios';

// Backend URL - update this with your actual backend URL
const BASE_URL = 'http://localhost:3000';

export class NetworkService {
  /**
   * Send login request to backend
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Response with credit score
   */
  static async login(email, password) {
    try {
      const response = await axios.post(`${BASE_URL}/api/login`, {
        email,
        password,
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with error
        throw new Error(error.response.data.message || 'Login failed');
      } else if (error.request) {
        // Request made but no response
        throw new Error('Network error. Please check your connection.');
      } else {
        // Something else happened
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  }

  /**
   * Check backend health
   * @returns {Promise<Object>} Health status
   */
  static async checkHealth() {
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to connect to backend');
    }
  }

  /**
   * Update base URL (useful for development/production)
   * @param {string} url - New base URL
   */
  static setBaseURL(url) {
    BASE_URL = url;
  }
}
