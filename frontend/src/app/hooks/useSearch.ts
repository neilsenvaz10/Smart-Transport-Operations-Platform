import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useSearch = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim()) return { vehicles: [], drivers: [], trips: [], maintenance: [] };
      const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
      return res.data;
    },
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60, // 1 minute
  });
};
