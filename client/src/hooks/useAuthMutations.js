import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/apiClient";

const storeTokens = ({ accessToken, refreshToken }) => {
  try {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  } catch {}
};

export function useLoginMutation() {
  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: (payload) => apiPost("/auth/login", payload),
    onSuccess: (data) => storeTokens(data),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: (payload) => apiPost("/auth/register", payload),
    
  });
}

export function useRefreshMutation() {
  return useMutation({
    mutationKey: ["auth", "refresh"],
    mutationFn: (payload) => apiPost("/auth/refresh", payload),
    onSuccess: (data) => storeTokens(data),
  });
}
