import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';

export const useReports = () => {
 const { data: kpis, isLoading: isLoadingKPIs, isError: isErrorKPIs } = useQuery({
 queryKey: ['kpis'],
 queryFn: async () => {
 const res = await api.get('/reports/kpis');
 return res.data?.data || res.data;
 },
 });
 
 const exportCSV = useMutation({
 mutationFn: async () => {
 const res = await api.get('/reports/export', { responseType: 'blob' });
 const url = window.URL.createObjectURL(new Blob([res.data]));
 const link = document.createElement('a');
 link.href = url;
 link.setAttribute('download', `fleet_report_${new Date().toISOString().split('T')[0]}.csv`);
 document.body.appendChild(link);
 link.click();
 link.remove();
 window.URL.revokeObjectURL(url);
 },
 });
 
 return { kpis, isLoadingKPIs, isErrorKPIs, exportCSV: exportCSV.mutate, isExporting: exportCSV.isPending };
};
