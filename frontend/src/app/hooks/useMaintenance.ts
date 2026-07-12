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
 
 const maintenanceLogs = data ?? [];
 
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
 isLoading,
 isError,
 createMaintenance: create.mutate,
 updateMaintenance: update.mutate,
 closeMaintenance: closeMaintenance.mutate
 };
};
