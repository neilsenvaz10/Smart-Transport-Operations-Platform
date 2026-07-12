import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const normalizeArray = (raw: unknown, key: string): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const inner = obj[key] ?? obj.data ?? obj.items;
    if (Array.isArray(inner)) return inner as any[];
  }
  return [];
};

export const useDrivers = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const res = await api.get('/drivers');
      return normalizeArray(res.data, 'drivers');
    },
  });
  const drivers = data ?? [];
  const create = useMutation({
    mutationFn: (newDriver: any) => api.post('/drivers', newDriver),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/drivers/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/drivers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });
  return {
    drivers,
    isLoading,
    isError,
    createDriver: create.mutate,
    updateDriver: update.mutate,
    deleteDriver: del.mutate,
  };
};
