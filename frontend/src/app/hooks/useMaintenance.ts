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

export const useMaintenance = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const res = await api.get('/maintenance');
      return normalizeArray(res.data, 'maintenance');
    },
  });
  const maintenance = data ?? [];
  const create = useMutation({
    mutationFn: (newItem: any) => api.post('/maintenance', newItem),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/maintenance/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/maintenance/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
  });
  return {
    maintenance,
    isLoading,
    isError,
    createMaintenance: create.mutate,
    updateMaintenance: update.mutate,
    deleteMaintenance: del.mutate,
  };
};
