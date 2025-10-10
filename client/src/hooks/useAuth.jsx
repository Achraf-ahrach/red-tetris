import { useMe, tokenUtils } from "@/api/auth";

export const useAuth = () => {
  const { data: user, isLoading, error, isError } = useMe();

  const isAuthenticated = () => {
    return tokenUtils.hasTokens() && !!user && !isError;
  };

  return {
    user,
    loading: isLoading,
    isAuthenticated,
    hasTokens: tokenUtils.hasTokens(),
    error,
  };
};
