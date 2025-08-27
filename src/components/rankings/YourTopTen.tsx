
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PlayerSearch, { Player } from "./PlayerSearch";
import DraggablePlayerItem from "./DraggablePlayerItem";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type RankingRow = {
  player_id: string | null;
  rank_position: number;
};

interface YourTopTenProps {
  userId: string | null;
}

const YourTopTen = ({ userId }: YourTopTenProps) => {
  const { toast } = useToast();

  // Replacement dialog state for when stack is full
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [candidateToAdd, setCandidateToAdd] = useState<Player | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // state: ordered list of player IDs
  const [playerIds, setPlayerIds] = useState<string[]>([]);

  // Prefill from existing rankings when loaded
  useEffect(() => {
    if (rankingsQuery.data && rankingsQuery.data.length > 0) {
      const sortedRankings = [...rankingsQuery.data]
        .filter((r): r is RankingRow & { player_id: string } => !!r.player_id)
        .sort((a, b) => a.rank_position - b.rank_position);
      setPlayerIds(sortedRankings.map(r => r.player_id));
    }
  }, [rankingsQuery.data]);

  const chosenPlayerIds = useMemo(() => new Set(playerIds), [playerIds]);

  const handleAddPlayer = (player: Player) => {
    if (playerIds.length >= 10) {
      setCandidateToAdd(player);
      setIsReplaceOpen(true);
    } else {
      // Add player to the bottom of the list
      setPlayerIds(prev => [...prev, player.id]);
    }
  };

  const handleReplacePlayer = (positionIndex: number) => {
    if (!candidateToAdd) return;
    
    setPlayerIds(prev => {
      const newIds = [...prev];
      newIds[positionIndex] = candidateToAdd.id;
      return newIds;
    });
    
    setIsReplaceOpen(false);
    setCandidateToAdd(null);
  };

  const handleRemovePlayer = (playerId: string) => {
    setPlayerIds(prev => prev.filter(id => id !== playerId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPlayerIds(prev => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    if (!userId) {
      toast({ title: "Please sign in", description: "Sign in to save your rankings.", variant: "destructive" });
      return;
    }

    console.log("[YourTopTen] Saving rankings for user:", userId);

    // Delete existing rankings for this user
    const { error: delErr } = await supabase
      .from("user_rankings")
      .delete()
      .eq("user_id", userId);

    if (delErr) {
      console.error("[YourTopTen] Delete failed:", delErr);
      toast({ title: "Save failed", description: delErr.message, variant: "destructive" });
      return;
    }

    if (playerIds.length === 0) {
      toast({ title: "Rankings saved", description: "Your rankings have been cleared." });
      rankingsQuery.refetch();
      return;
    }

    // Insert the new list
    const rows = playerIds.map((player_id, index) => ({
      user_id: userId,
      rank_position: index + 1,
      player_id,
    }));

    const { error: insErr } = await supabase
      .from("user_rankings")
      .insert(rows);

    if (insErr) {
      console.error("[YourTopTen] Insert failed:", insErr);
      toast({ title: "Save failed", description: insErr.message, variant: "destructive" });
      return;
    }
    
    toast({ title: "Rankings saved", description: "Your Top 10 has been saved successfully." });
    rankingsQuery.refetch();
  };

  // Authentication status display
  if (!userId) {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-muted/50 border rounded-md text-center">
          <p className="text-muted-foreground">
            Sign in using the button in the top-right corner to create and save your Top 10 rankings.
          </p>
        </div>
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

  const rankedPlayers = playerIds.map(id => getPlayerById(id)).filter(Boolean) as Player[];

  return (
    <div className="space-y-6">
      {/* Draggable player list */}
      <div className="space-y-2">
        <div className="text-sm font-medium">
          Your Top 10 ({rankedPlayers.length}/10)
        </div>
        
        {rankedPlayers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No players added yet.</p>
            <p className="text-xs">Search for players below to start building your rankings.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={playerIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {rankedPlayers.map((player, index) => (
                  <DraggablePlayerItem
                    key={player.id}
                    player={player}
                    position={index + 1}
                    onRemove={handleRemovePlayer}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Player search moved below the list */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Add players to your rankings</div>
        <PlayerSearch
          onAdd={handleAddPlayer}
          disabledIds={chosenPlayerIds}
        />
      </div>

      {rankedPlayers.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save rankings</Button>
        </div>
      )}

      {/* Replace player dialog when stack is full */}
      <Dialog open={isReplaceOpen} onOpenChange={setIsReplaceOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {candidateToAdd ? `Replace a player with ${candidateToAdd.name}` : "Replace a player"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-auto">
            <p className="text-sm text-muted-foreground mb-4">
              Your rankings are full. Choose which player to replace:
            </p>
            {rankedPlayers.map((player, index) => (
              <Button
                key={player.id}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => handleReplacePlayer(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{player.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {player.team ?? "—"} • {player.position ?? "—"}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default YourTopTen;
