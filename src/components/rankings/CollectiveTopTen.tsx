
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

type CollectiveRankingRow = {
  id: string | null;
  avg_rank: number | null;
  vote_count: number | null;
  collective_rank: number | null;
  name: string | null;
  team: string | null;
  position: string | null;
  image_url: string | null;
};

const CollectiveTopTen = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["collective-top10"],
    queryFn: async (): Promise<CollectiveRankingRow[]> => {
      console.log("[CollectiveTopTen] Fetching via RPC get_collective_rankings...");
      const { data, error } = await (supabase as any).rpc("get_collective_rankings");

      if (!error && Array.isArray(data)) {
        return (data ?? []) as CollectiveRankingRow[];
      }

      console.warn(
        "[CollectiveTopTen] RPC unavailable or failed, falling back to client-side aggregation.",
        error
      );

      // Fallback: compute rankings on the client if RPC is missing
      const [{ data: rankings, error: rErr }, { data: players, error: pErr }] = await Promise.all([
        supabase.from("user_rankings").select("player_id,rank_position"),
        supabase.from("nba_players").select("id,name,team,position,image_url"),
      ]);

      if (rErr) {
        console.error("[CollectiveTopTen] Failed to fetch user_rankings:", rErr);
        throw rErr;
      }
      if (pErr) {
        console.error("[CollectiveTopTen] Failed to fetch nba_players:", pErr);
        throw pErr;
      }

      if (!rankings || rankings.length === 0) {
        return [];
      }

      // Aggregate average rank and vote count by player
      const agg = new Map<string, { sum: number; count: number }>();
      for (const row of rankings) {
        if (!row.player_id) continue;
        const prev = agg.get(row.player_id) ?? { sum: 0, count: 0 };
        agg.set(row.player_id, { sum: prev.sum + row.rank_position, count: prev.count + 1 });
      }

      const results: CollectiveRankingRow[] = Array.from(agg.entries()).map(([playerId, a]) => {
        const p = players?.find((pl) => pl.id === playerId);
        const avg = a.count > 0 ? a.sum / a.count : null;
        return {
          id: p?.id ?? playerId,
          avg_rank: avg,
          vote_count: a.count,
          collective_rank: null,
          name: p?.name ?? null,
          team: p?.team ?? null,
          position: p?.position ?? null,
          image_url: p?.image_url ?? null,
        };
      });

      results.sort((x, y) => (x.avg_rank ?? Infinity) - (y.avg_rank ?? Infinity));
      results.forEach((row, i) => (row.collective_rank = i + 1));

      return results.slice(0, 10);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-full" />
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
          <Avatar className="h-14 w-14">
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
