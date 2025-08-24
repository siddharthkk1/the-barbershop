
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

type Player = {
  id: string;
  name: string;
  team: string | null;
  position: string | null;
};

type RankingRow = {
  player_id: string | null;
  rank_position: number;
};

const positions = Array.from({ length: 10 }).map((_, idx) => idx + 1);

const YourTopTen = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setUserEmail(session?.user?.email ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const playersQuery = useQuery({
    queryKey: ["nba_players"],
    queryFn: async (): Promise<Player[]> => {
      console.log("[YourTopTen] Fetching nba_players...");
      const { data, error } = await supabase
        .from("nba_players")
        .select("id,name,team,position")
        .order("name", { ascending: true });
      if (error) {
        console.error("[YourTopTen] nba_players error:", error);
        throw error;
      }
      return (data ?? []) as Player[];
    },
  });

  const rankingsQuery = useQuery({
    queryKey: ["user_rankings", userId],
    enabled: !!userId,
    queryFn: async (): Promise<RankingRow[]> => {
      console.log("[YourTopTen] Fetching user_rankings for user:", userId);
      const { data, error } = await supabase
        .from("user_rankings")
        .select("player_id,rank_position")
        .eq("user_id", userId);
      if (error) {
        console.error("[YourTopTen] user_rankings error:", error);
        throw error;
      }
      return data ?? [];
    },
  });

  // state: selection for positions 1..10 -> player_id
  const [selection, setSelection] = useState<Record<number, string | null>>({});

  // Prefill from existing rankings when loaded
  useEffect(() => {
    if (rankingsQuery.data && rankingsQuery.data.length > 0) {
      const prefill: Record<number, string | null> = {};
      rankingsQuery.data.forEach((r) => {
        prefill[r.rank_position] = r.player_id;
      });
      setSelection(prefill);
    }
  }, [rankingsQuery.data]);

  const chosenPlayerIds = useMemo(
    () => new Set(Object.values(selection).filter(Boolean) as string[]),
    [selection]
  );

  const handleChange = (pos: number, playerId: string | null) => {
    setSelection((prev) => {
      const next = { ...prev };
      // remove previous selection to allow re-assigning a player to another slot
      const prevAtPos = prev[pos];
      if (prevAtPos && prevAtPos === playerId) return prev;
      next[pos] = playerId;
      return next;
    });
  };

  const handleSave = async () => {
    if (!userId) {
      toast({ title: "Please sign in", description: "Sign in to save your rankings.", variant: "destructive" });
      return;
    }
    // Validate uniqueness and completeness (optional: allow partial)
    const nonNullEntries = Object.entries(selection).filter(([, v]) => !!v) as [string, string][];
    const uniqueSet = new Set(nonNullEntries.map(([, v]) => v));
    if (uniqueSet.size !== nonNullEntries.length) {
      toast({
        title: "Duplicate players found",
        description: "Each player can only appear once in your Top 10.",
        variant: "destructive",
      });
      return;
    }

    const rows = nonNullEntries.map(([posStr, player_id]) => ({
      user_id: userId,
      rank_position: Number(posStr),
      player_id,
    }));

    console.log("[YourTopTen] Upserting rows:", rows);

    const { error } = await supabase
      .from("user_rankings")
      .upsert(rows, {
        onConflict: "user_id,rank_position",
      });

    if (error) {
      console.error("[YourTopTen] upsert error:", error);
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Rankings saved", description: "Your Top 10 has been saved successfully." });
    rankingsQuery.refetch();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/rankings`,
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
  };

  if (!userId) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Sign in to create and save your Top 10 rankings
        </p>
        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue with Google
        </Button>
      </div>
    );
  }

  if (playersQuery.isLoading || rankingsQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (playersQuery.error) {
    return <p className="text-sm text-destructive">Failed to load players.</p>;
  }

  const players = playersQuery.data ?? [];

  return (
    <div className="space-y-4">
      {/* Signed in indicator */}
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <p className="text-sm font-medium text-green-800">
            Signed in as {userEmail}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {positions.map((pos) => {
          const selectedId = selection[pos] ?? null;
          return (
            <div key={pos} className="flex items-center gap-3">
              <div className="w-6 text-right font-semibold">{pos}</div>
              <Select
                value={selectedId ?? ""}
                onValueChange={(val) => handleChange(pos, val || null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                      disabled={selectedId !== p.id && chosenPlayerIds.has(p.id)}
                    >
                      {p.name} • {p.team ?? "—"} • {p.position ?? "—"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedId && (
                <Button
                  variant="ghost"
                  className="text-xs"
                  onClick={() => handleChange(pos, null)}
                >
                  Clear
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save rankings</Button>
      </div>
    </div>
  );
};

export default YourTopTen;
