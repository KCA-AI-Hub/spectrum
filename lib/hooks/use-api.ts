import { useCallback } from 'react';
import { useApiStore } from '../store';

export function useApi<T = unknown>(key: string) {
  const { getState, getStatus, setLoading, setSuccess, setError, reset } = useApiStore();

  const state = getState(key);
  const status = getStatus(key);

  const execute = useCallback(
    async (apiCall: () => Promise<T>) => {
      setLoading(key);
      try {
        const result = await apiCall();
        setSuccess(key, result);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setError(key, errorMessage);
        throw error;
      }
    },
    [key, setLoading, setSuccess, setError]
  );

  const clear = useCallback(() => {
    reset(key);
  }, [key, reset]);

  return {
    data: state.data as T | null,
    loading: state.loading,
    error: state.error,
    status,
    execute,
    clear,
  };
}
