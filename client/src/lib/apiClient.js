import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const getAccessToken = () => {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
};
  
const getRefreshToken = () => {
  try {
    return localStorage.getItem("refreshToken");
  } catch {
    return null;
  }
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          // No refresh token, redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export async function apiPost(path, body) {
  try {
    const res = await apiClient.post(path, body);
    return res.data;
  } catch (err) {
    return {
      error: true,
      status: err.response?.status,
      data: err.response?.data,
    };
  }
}

export async function apiGet(path) {
  try {
    const res = await apiClient.get(path);
    return res.data;
  } catch (err) {
    return {
      error: true,
      status: err.response?.status,
      data: err.response?.data,
    };
  }
}

export async function apiPut(path, body) {
  try {
    const res = await apiClient.put(path, body);
    return res.data;
  } catch (err) {
    return {
      error: true,
      status: err.response?.status,
      data: err.response?.data,
    };
  }
}

export async function apiDelete(path) {
  try {
    const res = await apiClient.delete(path);
    return res.data;
  } catch (err) {
    return {
      error: true,
      status: err.response?.status,
      data: err.response?.data,
    };
  }
}

export default apiClient;
