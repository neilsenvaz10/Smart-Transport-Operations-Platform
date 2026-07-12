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

export const useExpenses = (filters?: Record<string, any>) => {
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
 queryKey: ['expenses', filters],
 queryFn: async () => {
 const res = await api.get(`/expenses?${queryParams.toString()}`);
 return normalizeResponse(res.data, 'expenses');
 },
 });
 
 const expenses = result?.data ?? [];
 const meta = result?.meta;
 
 const create = useMutation({
 mutationFn: (newExpense: any) => api.post('/expenses', newExpense),
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
 });
 
 return { expenses, meta, isLoading, isError, createExpense: create.mutate };
};
