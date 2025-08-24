import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PlayerSearch, { Player } from "./PlayerSearch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  // Assignment dialog state for placing a selected player into a position
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [candidate, setCandidate] = useState<Player | null>(null);

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
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nba_players")
        .select("id,name,team,position,image_url")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rankingsQuery = useQuery({
    queryKey: ["user_rankings", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_rankings")
        .select("player_id,rank_position")
        .eq("user_id", userId);
      if (error) throw error;
      return data ?? [];
    },
  });

  // state: selection for positions 1..10 -> player_id
  const [selection, setSelection] = useState<Record<number, string | null>>({});

  // Prefill from existing rankings when loaded
  useEffect(() => {
    if (rankingsQuery.data && rankingsQuery.data.length > 0) {
      const prefill: Record<number, string | null> = {};
      rankingsQuery.data.forEach((r: RankingRow) => {
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
    const { error } = await supabase
      .from("user_rankings")
      .upsert(rows, { onConflict: "user_id,rank_position" });
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Rankings saved", description: "Your Top 10 has been saved successfully." });
    rankingsQuery.refetch();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const isLocalhost = window.location.origin.includes('localhost');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: isLocalhost ? {} : {
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

  // New: start assignment flow when a player is picked from global search
  const handleStartAssign = (player: Player) => {
    setCandidate(player);
    setIsAssignOpen(true);
  };

  // New: assign currently selected candidate to chosen position (move if already placed)
  const handleAssignPosition = (pos: number) => {
    if (!candidate) return;
    const candidateId = candidate.id;
    setSelection((prev) => {
      const next = { ...prev };
      // Remove candidate from any previous position
      for (const key of Object.keys(next)) {
        const k = Number(key);
        if (next[k] === candidateId) next[k] = null;
      }
      // Place into selected position (overwrites if occupied)
      next[pos] = candidateId;
      return next;
    });
    setIsAssignOpen(false);
    setCandidate(null);
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
  const getPlayerById = (id: string | null | undefined) =>
    id ? players.find((p) => p.id === id) ?? null : null;

  return (
    <div className="space-y-6">
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

      {/* One global search */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Search players</div>
        <PlayerSearch
          onPick={handleStartAssign}
          disabledIds={chosenPlayerIds}
        />
      </div>

      {/* Single-column list of positions, resembling collective rankings */}
      <div className="space-y-2">
        {positions.map((pos) => {
          const playerId = selection[pos] ?? null;
          const player = getPlayerById(playerId);
          return (
            <div
              key={pos}
              className="flex items-center gap-3 p-3 rounded-md border bg-card text-card-foreground"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                {pos}
              </div>

              {player ? (
                <>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={player.image_url ?? undefined} alt={player.name} />
                    <AvatarFallback>{player.name?.slice(0, 2).toUpperCase() ?? "PL"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{player.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {player.team ?? "—"} • {player.position ?? "—"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleChange(pos, null)}
                  >
                    Remove
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm text-muted-foreground">
                      Empty — select a player above, then choose where to place them
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save rankings</Button>
      </div>

      {/* Assign position dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {candidate ? `Choose a position for ${candidate.name}` : "Choose a position"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {positions.map((pos) => {
              const occupant = getPlayerById(selection[pos] ?? null);
              return (
                <Button
                  key={pos}
                  variant={occupant ? "secondary" : "outline"}
                  className="justify-start h-auto py-3"
                  onClick={() => handleAssignPosition(pos)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {pos}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">
                        {occupant ? occupant.name : "Empty slot"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {occupant ? `${occupant.team ?? "—"} • ${occupant.position ?? "—"}` : "Click to place here"}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default YourTopTen;
