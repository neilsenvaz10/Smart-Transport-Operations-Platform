import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Coerce the API response into a Vehicle[] shape.
// The backend may return an array directly, or an envelope like { data: [...] }.
// On error, axios rejects the promise so we still end up with [] in the cache.
const normalizeVehicles = (raw: unknown): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const obj = raw as { data?: unknown; vehicles?: unknown; items?: unknown };
    if (Array.isArray(obj.data)) return obj.data as any[];
    if (Array.isArray(obj.vehicles)) return obj.vehicles as any[];
    if (Array.isArray(obj.items)) return obj.items as any[];
  }
  return [];
};

export const useVehicles = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await api.get('/vehicles');
      return normalizeVehicles(res.data);
    },
  });
  const vehicles = data ?? [];
  const create = useMutation({
    mutationFn: (newVehicle: any) => api.post('/vehicles', newVehicle),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/vehicles/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
  return {
    vehicles,
    isLoading,
    isError,
    createVehicle: create.mutate,
    updateVehicle: update.mutate,
    deleteVehicle: del.mutate,
  };
};
