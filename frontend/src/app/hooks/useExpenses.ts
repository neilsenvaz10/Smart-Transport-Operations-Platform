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

export const useExpenses = () => {
 const queryClient = useQueryClient();
 const { data, isLoading, isError } = useQuery({
 queryKey: ['expenses'],
 queryFn: async () => {
 const res = await api.get('/expenses');
 return normalizeArray(res.data, 'expenses');
 },
 });
 
 const expenses = data ?? [];
 
 const create = useMutation({
 mutationFn: (newExpense: any) => api.post('/expenses', newExpense),
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
 });
 
 return { expenses, isLoading, isError, createExpense: create.mutate };
};
