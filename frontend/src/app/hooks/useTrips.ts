import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const normalizeResponse = (raw: unknown, key: string) => {
  if (Array.isArray(raw)) return { data: raw, meta: null };
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const inner = obj[key] ?? obj.data ?? obj.items;
    let data: any[] = [];
    if (Array.isArray(inner)) data = inner as any[];
    return { data, meta: (obj.meta as any) || null };
  }
  return { data: [], meta: null };
};

export const useTrips = (filters?: Record<string, any>) => {
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
 queryKey: ['trips', filters],
 queryFn: async () => {
 const res = await api.get(`/trips?${queryParams.toString()}`);
 return normalizeResponse(res.data, 'trips');
 },
 });
 
 const trips = result?.data ?? [];
 const meta = result?.meta;
 const create = useMutation({
 mutationFn: (newTrip: any) => api.post('/trips', newTrip),
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
 });
 const dispatch = useMutation({
 mutationFn: (id: string) => api.patch(`/trips/${id}/dispatch`),
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
 });
 const complete = useMutation({
 mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/trips/${id}/complete`, data),
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
 });
 const cancel = useMutation({
 mutationFn: (id: string) => api.patch(`/trips/${id}/cancel`),
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
 });
 return {
 trips,
 meta,
 isLoading,
 isError,
 createTrip: create.mutate,
 dispatchTrip: dispatch.mutate,
 completeTrip: complete.mutate,
 cancelTrip: cancel.mutate,
 };
};
