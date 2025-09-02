import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import CustomGoogleButton from "@/components/auth/CustomGoogleButton";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import DraggablePlayerItem from "./DraggablePlayerItem";

interface YourTopTenProps {
  userId: string | null;
  userEmail: string | null;
  isLoading: boolean;
  onGoogleSignIn: () => void;
}

interface UserRanking {
  id: string;
  user_id: string;
  player_id: string;
  rank_position: number;
  created_at: string;
  updated_at: string;
}

interface Player {
  id: string;
  name: string;
  team: string | null;
  position: string | null;
  image_url?: string | null;
}

const YourTopTen = ({ userId, userEmail, isLoading, onGoogleSignIn }: YourTopTenProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [playerName, setPlayerName] = useState("");
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch user's rankings with player details
  const {
    data: userRankings,
    isLoading: isLoadingRankings,
    isError: isErrorRankings,
    error: errorRankings,
  } = useQuery({
    queryKey: ["userRankings", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("user_rankings")
        .select(`
          id,
          user_id,
          player_id,
          rank_position,
          created_at,
          updated_at
        `)
        .eq("user_id", userId)
        .order("rank_position", { ascending: true });

      if (error) {
        console.error("Error fetching user rankings:", error);
        throw error;
      }

      // Get player details for each ranking
      if (!data || data.length === 0) return [];
      
      const playerIds = data.map(r => r.player_id);
      const { data: playersData, error: playersError } = await supabase
        .from("nba_players")
        .select("id, name, team, position, image_url")
        .in("id", playerIds);

      if (playersError) {
        console.error("Error fetching players:", playersError);
        throw playersError;
      }

      // Combine rankings with player data
      return data.map(ranking => {
        const player = playersData?.find(p => p.id === ranking.player_id);
        return {
          rankingId: ranking.id,
          player: player ? {
            id: player.id,
            name: player.name,
            team: player.team,
            position: player.position,
            image_url: player.image_url,
          } : null,
          rank_position: ranking.rank_position,
        };
      }).filter(item => item.player !== null);
    },
    enabled: !!userId,
    retry: false,
  });

  // Add player mutation
  const addPlayerMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!userId) throw new Error("User not authenticated");
      
      // First, search for the player in nba_players
      const { data: existingPlayers, error: searchError } = await supabase
        .from("nba_players")
        .select("id, name, team, position, image_url")
        .ilike("name", `%${name}%`)
        .limit(1);

      if (searchError) throw searchError;

      let playerId: string;
      
      if (existingPlayers && existingPlayers.length > 0) {
        playerId = existingPlayers[0].id;
      } else {
        // Create new player if not found
        const { data: newPlayer, error: createError } = await supabase
          .from("nba_players")
          .insert([{ name, team: null, position: null }])
          .select("id")
          .single();

        if (createError) throw createError;
        playerId = newPlayer.id;
      }

      // Add to user rankings
      const nextRankPosition = (userRankings?.length || 0) + 1;
      const { data, error } = await supabase
        .from("user_rankings")
        .insert([{ 
          user_id: userId, 
          player_id: playerId, 
          rank_position: nextRankPosition 
        }])
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async () => {
      setIsAddingPlayer(true);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add player",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsAddingPlayer(false);
      queryClient.invalidateQueries({ queryKey: ["userRankings", userId] });
    },
  });

  // Update rankings mutation
  const updateRankingsMutation = useMutation({
    mutationFn: async (updates: { rankingId: string; rank_position: number }[]) => {
      if (!userId) throw new Error("User not authenticated");
      
      const promises = updates.map(({ rankingId, rank_position }) =>
        supabase
          .from("user_rankings")
          .update({ rank_position })
          .eq("id", rankingId)
          .eq("user_id", userId)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error("Failed to update rankings");
      }
    },
    onError: () => {
      toast({
        title: "Failed to update rankings",
        description: "Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userRankings", userId] });
    },
  });

  // Delete player mutation
  const deletePlayerMutation = useMutation({
    mutationFn: async (rankingId: string) => {
      const { error } = await supabase
        .from("user_rankings")
        .delete()
        .eq("id", rankingId);
      
      if (error) throw error;
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete player",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userRankings", userId] });
    },
  });

  // Handlers
  const handleAddPlayer = async () => {
    if (playerName.trim() === "") return;
    try {
      await addPlayerMutation.mutateAsync(playerName);
      setPlayerName("");
    } catch (error: any) {
      toast({
        title: "Failed to add player",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePlayer = async (rankingId: string) => {
    try {
      await deletePlayerMutation.mutateAsync(rankingId);
    } catch (error: any) {
      toast({
        title: "Failed to delete player",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && userRankings) {
      const oldIndex = userRankings.findIndex(item => item.rankingId === active.id);
      const newIndex = userRankings.findIndex(item => item.rankingId === over.id);

      const newOrder = arrayMove(userRankings, oldIndex, newIndex);
      
      // Update positions
      const updates = newOrder.map((item, index) => ({
        rankingId: item.rankingId,
        rank_position: index + 1,
      }));

      // Optimistically update the UI
      queryClient.setQueryData(["userRankings", userId], newOrder);

      try {
        await updateRankingsMutation.mutateAsync(updates);
      } catch (error: any) {
        // Revert on error
        queryClient.setQueryData(["userRankings", userId], userRankings);
        toast({
          title: "Failed to update rankings",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (!userId) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Create Your Rankings</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Sign in to create and save your personal NBA Top 10 player rankings. Join the community and see how your picks compare!
          </p>
        </div>
        
        <div className="space-y-4">
          <GoogleSignInButton 
            onSuccess={onGoogleSignIn}
            disabled={isLoading}
          />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>
          
          <CustomGoogleButton 
            onClick={onGoogleSignIn}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  if (isLoadingRankings) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isErrorRankings) {
    return (
      <div className="text-center text-red-500">
        Error: {errorRankings?.message || "Failed to load rankings"}
      </div>
    );
  }

  const canAddMore = (userRankings?.length || 0) < 10;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter player name"
          className="flex-1"
          disabled={!canAddMore || isAddingPlayer}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddPlayer();
            }
          }}
        />
        <Button
          onClick={handleAddPlayer}
          disabled={!canAddMore || isAddingPlayer}
        >
          {isAddingPlayer ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Add Player
        </Button>
      </div>

      {!canAddMore && (
        <div className="text-sm text-muted-foreground">
          You have reached the maximum of 10 players.
        </div>
      )}

      {!userRankings || userRankings.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No players added yet. Add some players to create your Top 10!
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={userRankings.map(item => item.rankingId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {userRankings.map((item, index) => (
                item.player ? (
                  <DraggablePlayerItem
                    key={item.rankingId}
                    player={{
                      id: item.rankingId,
                      name: item.player.name,
                      team: item.player.team,
                      position: item.player.position,
                      image_url: item.player.image_url,
                    }}
                    position={index + 1}
                    onRemove={() => handleDeletePlayer(item.rankingId)}
                  />
                ) : null
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default YourTopTen;
