import { useQuery } from "@tanstack/react-query";

export function useWikiImage(title: string) {
  return useQuery({
    queryKey: ["wiki", title],
    staleTime: Infinity,
    queryFn: async () => {
      const r = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
      if (!r.ok) return null;
      const j = await r.json();
      return (j.originalimage?.source ?? j.thumbnail?.source ?? null) as string | null;
    },
  });
}
