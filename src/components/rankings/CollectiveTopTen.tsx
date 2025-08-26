
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

type CollectiveRow = {
  id: string | null;
  name: string | null;
  team: string | null;
  position: string | null;
  image_url: string | null;
  avg_rank: number | null;
  vote_count: number | null;
  collective_rank: number | null;
};

const CollectiveTopTen = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["collective-top10"],
    queryFn: async (): Promise<CollectiveRow[]> => {
      console.log("[CollectiveTopTen] Fetching via RPC get_collective_rankings...");
      const { data, error } = await supabase.rpc("get_collective_rankings");
      if (error) {
        console.error("[CollectiveTopTen] RPC error:", error);
        throw error;
      }
      return (data ?? []) as CollectiveRow[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">Failed to load collective rankings.</p>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <Users className="h-4 w-4" />
        No votes yet. Be the first to submit your Top 10!
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {data.map((row, idx) => (
        <li key={`${row.id}-${idx}`} className="flex items-center gap-3">
          <div className="w-6 text-right font-semibold">{row.collective_rank ?? idx + 1}</div>
          <Avatar className="h-12 w-12">
            <AvatarImage src={row.image_url ?? undefined} alt={row.name ?? "Player"} />
            <AvatarFallback>{row.name?.slice(0, 2).toUpperCase() ?? "PL"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{row.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.team} • {row.position}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Avg rank</div>
            <div className="font-medium">{row.avg_rank != null ? row.avg_rank.toFixed(2) : "—"}</div>
            <div className="text-xs text-muted-foreground">{row.vote_count} votes</div>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default CollectiveTopTen;
