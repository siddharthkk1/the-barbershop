
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";

export type Player = {
  id: string;
  name: string;
  team: string | null;
  position: string | null;
  image_url?: string | null;
};

type PlayerSearchProps = {
  onAdd: (player: Player) => void;
  disabledIds?: Set<string>;
  initialQuery?: string;
};

const LIMIT = 50;

const PlayerSearch = ({ onAdd, disabledIds, initialQuery = "" }: PlayerSearchProps) => {
  const [query, setQuery] = useState(initialQuery);
  const debounced = useDebounce(query, 300);
  const shouldShowResults = debounced.trim().length > 0;

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["player-search", debounced],
    enabled: shouldShowResults,
    queryFn: async (): Promise<Player[]> => {
      const q = debounced.trim();
      let builder = supabase
        .from("nba_players")
        .select("id,name,team,position,image_url")
        .order("name", { ascending: true });

      if (q.length > 0) {
        // Search in name, team, and position
        builder = builder.or(
          `name.ilike.%${q}%,team.ilike.%${q}%,position.ilike.%${q}%`
        );
      }

      const { data, error } = await builder.limit(LIMIT);
      if (error) {
        console.error("[PlayerSearch] Error fetching players:", error);
        throw error;
      }
      return (data ?? []) as Player[];
    },
  });

  // De-duplicate results by id (extra safety even after DB cleanup/constraint)
  const list = (() => {
    const arr = data ?? [];
    const map = new Map<string, Player>();
    for (const p of arr) {
      if (!map.has(p.id)) map.set(p.id, p);
    }
    return Array.from(map.values());
  })();

  return (
    <div className="relative">
      <div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, team, or position (e.g., 'Lakers', 'PG', 'LeBron')"
          className="w-full"
        />
      </div>

      {shouldShowResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-[50vh] overflow-hidden">
          {isLoading || isFetching ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-destructive">Failed to load players.</div>
          ) : list.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No players found. Try a different search.
            </div>
          ) : (
            <div className="overflow-auto max-h-[45vh]">
              <ul className="p-2 space-y-2">
                {list.map((p) => {
                  const disabled = !!disabledIds && disabledIds.has(p.id);
                  return (
                    <li key={p.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={p.image_url ?? undefined} alt={p.name} />
                        <AvatarFallback>{p.name?.slice(0, 2).toUpperCase() ?? "PL"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.team ?? "—"} • {p.position ?? "—"}
                        </div>
                      </div>
                      <Button
                        variant={disabled ? "secondary" : "default"}
                        disabled={disabled}
                        onClick={() => onAdd(p)}
                        size="sm"
                      >
                        {disabled ? "Added" : "Add"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
              
              <div className="p-2 border-t bg-muted/20">
                <Button variant="outline" size="sm" onClick={() => refetch()} className="w-full">
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerSearch;
