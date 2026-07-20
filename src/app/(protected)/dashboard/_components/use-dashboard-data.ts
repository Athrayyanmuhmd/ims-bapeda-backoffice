import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { services } from "@/services";

// Shared by every dashboard widget that needs "recent peserta" + "recent
// absensi" — same queryKeys.*.lookup()/recent() as the rest of the app, so
// this is one fetch/cache entry no matter how many widgets call it.
export function useDashboardData() {
  const { data: pesertaData, isLoading: isLoadingPeserta } = useQuery({
    queryKey: queryKeys.pesertaMagang.lookup(),
    queryFn: () => services.pesertaMagang.getAllPesertaMagang({ rows: 100 }),
  });

  const { data: absensiData, isLoading: isLoadingAbsensi } = useQuery({
    queryKey: queryKeys.absensi.recent(),
    queryFn: () => services.absensi.getAllAbsensi({ rows: 100, orderKey: "tanggal", orderRule: "desc" }),
  });

  return {
    pesertaData,
    absensiData,
    isLoading: isLoadingPeserta || isLoadingAbsensi,
  };
}
