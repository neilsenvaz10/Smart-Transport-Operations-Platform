import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const normalizeResponse = (raw: unknown) => {
  if (Array.isArray(raw)) return { data: raw, meta: null };
  if (raw && typeof raw === 'object') {
    const obj = raw as { data?: unknown; drivers?: unknown; items?: unknown; meta?: unknown };
    let data: any[] = [];
    if (Array.isArray(obj.data)) data = obj.data as any[];
    else if (Array.isArray(obj.drivers)) data = obj.drivers as any[];
    else if (Array.isArray(obj.items)) data = obj.items as any[];
    
    return { data, meta: obj.meta || null };
  }
  return { data: [], meta: null };
};

export const useDrivers = (filters?: Record<string, any>) => {
 const queryClient = useQueryClient();

 const queryParams = new URLSearchParams();
 if (filters) {
   Object.entries(filters).forEach(([key, value]) => {
     if (value !== undefined && value !== '') {
       queryParams.append(key, String(value));
     }
   });
 }

 const { data: result, isLoading, isError, error } = useQuery({
 queryKey: ['drivers', filters],
 queryFn: async () => {
 const res = await api.get(`/drivers?${queryParams.toString()}`);
 return normalizeResponse(res.data);
 },
 });

 const drivers = result?.data ?? [];
 const meta = result?.meta;

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
 meta,
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
