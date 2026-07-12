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

export const useTrips = () => {
 const queryClient = useQueryClient();
 const { data, isLoading, isError } = useQuery({
 queryKey: ['trips'],
 queryFn: async () => {
 const res = await api.get('/trips');
 return normalizeArray(res.data, 'trips');
 },
 });
 const trips = data ?? [];
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
 isLoading,
 isError,
 createTrip: create.mutate,
 dispatchTrip: dispatch.mutate,
 completeTrip: complete.mutate,
 cancelTrip: cancel.mutate,
 };
};
