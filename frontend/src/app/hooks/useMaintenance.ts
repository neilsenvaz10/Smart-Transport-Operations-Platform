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

export const useMaintenance = (filters?: Record<string, any>) => {
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
 queryKey: ['maintenance', filters],
 queryFn: async () => {
 const res = await api.get(`/maintenance?${queryParams.toString()}`);
 return normalizeResponse(res.data, 'maintenance');
 },
 });
 
 const maintenanceLogs = result?.data ?? [];
 const meta = result?.meta;
 
 const create = useMutation({
 mutationFn: (newLog: any) => api.post('/maintenance', newLog),
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
 });
 
 const update = useMutation({
 mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/maintenance/${id}`, data),
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
 });

 const closeMaintenance = useMutation({
 mutationFn: (id: string) => api.patch(`/maintenance/${id}/close`),
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
 });
 
 return {
 maintenanceLogs,
 meta,
 isLoading,
 isError,
 createMaintenance: create.mutate,
 updateMaintenance: update.mutate,
 closeMaintenance: closeMaintenance.mutate
 };
};
