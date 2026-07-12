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

export const useFuel = () => {
 const queryClient = useQueryClient();
 const { data, isLoading, isError } = useQuery({
 queryKey: ['fuel'],
 queryFn: async () => {
 const res = await api.get('/fuel');
 return normalizeArray(res.data, 'fuelLogs');
 },
 });
 
 const fuelLogs = data ?? [];
 
 const create = useMutation({
 mutationFn: (newFuel: any) => api.post('/fuel', newFuel),
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fuel'] }),
 });
 
 return { fuelLogs, isLoading, isError, createFuelLog: create.mutate };
};
