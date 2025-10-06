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

export async function apiPost(path, body) {
  try {
    const res = await axios.post(`${API_BASE_URL}${path}`, body, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data;
  } catch (err) {
    return {
      error: true,
      status: err.response?.status,
      data: err.response?.data,
    };
  }
}
