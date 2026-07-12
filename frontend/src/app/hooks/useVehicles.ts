import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Coerce the API response into a Vehicle[] shape.
// The backend may return an array directly, or an envelope like { data: [...] }.
// On error, axios rejects the promise so we still end up with [] in the cache.
const normalizeResponse = (raw: unknown) => {
  if (Array.isArray(raw)) return { data: raw, meta: null };
  if (raw && typeof raw === 'object') {
    const obj = raw as { data?: unknown; vehicles?: unknown; items?: unknown; meta?: unknown };
    let data: any[] = [];
    if (Array.isArray(obj.data)) data = obj.data as any[];
    else if (Array.isArray(obj.vehicles)) data = obj.vehicles as any[];
    else if (Array.isArray(obj.items)) data = obj.items as any[];
    
    return { data, meta: obj.meta || null };
  }
  return { data: [], meta: null };
};

export const useVehicles = (filters?: Record<string, any>) => {
 const queryClient = useQueryClient();
 
 const queryParams = new URLSearchParams();
 if (filters) {
   Object.entries(filters).forEach(([key, value]) => {
     if (value !== undefined && value !== '') {
       queryParams.append(key, String(value));
     }
   });
 }

 const { data: result, isLoading, isError } = useQuery({
 queryKey: ['vehicles', filters],
 queryFn: async () => {
 const res = await api.get(`/vehicles?${queryParams.toString()}`);
 return normalizeResponse(res.data);
 },
 });
 
 const vehicles = result?.data ?? [];
 const meta = result?.meta;

 const create = useMutation({
 mutationFn: (newVehicle: any) => api.post('/vehicles', newVehicle),
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
 });
 const update = useMutation({
 mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/vehicles/${id}`, data),
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
 });
 const del = useMutation({
 mutationFn: (id: string) => api.delete(`/vehicles/${id}`),
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
 });
 return {
 vehicles,
 meta,
 isLoading,
 isError,
 createVehicle: create.mutate,
 updateVehicle: update.mutate,
 deleteVehicle: del.mutate,
 };
};
