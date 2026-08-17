export const API_URL = 
  import.meta.env.VITE_API_URL || "https://truck-load-hub-server.onrender.com";

export const api = async (endpoint, options = {}) => {
  const config = {
    ...options,
    credentials: "include", // Essential for HTTP-only cookies across requests
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.detail || "Something went wrong");
    error.status = response.status;
    throw error;
  }

  return response.json();
};
