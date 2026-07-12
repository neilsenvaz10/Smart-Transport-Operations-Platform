import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const normalizeDrivers = (raw: unknown): any[] => {
 if (Array.isArray(raw)) return raw;
 if (raw && typeof raw === 'object') {
 const obj = raw as { data?: unknown; drivers?: unknown; items?: unknown };
 if (Array.isArray(obj.data)) return obj.data as any[];
 if (Array.isArray(obj.drivers)) return obj.drivers as any[];
 if (Array.isArray(obj.items)) return obj.items as any[];
 }
 return [];
};

export const useDrivers = () => {
 const queryClient = useQueryClient();

 const { data, isLoading, isError, error } = useQuery({
 queryKey: ['drivers'],
 queryFn: async () => {
 const res = await api.get('/drivers');
 return normalizeDrivers(res.data);
 },
 });

 const drivers = data ?? [];

 const create = useMutation({
 mutationFn: (newDriver: any) => api.post('/drivers', newDriver),
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
 });

 const update = useMutation({
 mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/drivers/${id}`, data),
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
 error,
 createDriver: create.mutate,
 createDriverAsync: create.mutateAsync,
 updateDriver: update.mutate,
 updateDriverAsync: update.mutateAsync,
 deleteDriver: del.mutate,
 deleteDriverAsync: del.mutateAsync,
 };
};
