import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderPlayers } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Loader2, User, GripVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import CustomGoogleButton from "@/components/auth/CustomGoogleButton";

interface YourTopTenProps {
  userId: string | null;
  userEmail: string | null;
  isLoading: boolean;
  onGoogleSignIn: () => void;
}

interface Player {
  id: number;
  name: string;
  ranking: number | null;
}

const YourTopTen = ({ userId, userEmail, isLoading, onGoogleSignIn }: YourTopTenProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [playerName, setPlayerName] = useState("");
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  // Fetch user's top ten players
  const {
    data: topTenPlayers,
    isLoading: isLoadingTopTen,
    isError: isErrorTopTen,
    error: errorTopTen,
  } = useQuery<Player[]>({
    queryKey: ["topTenPlayers", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("top_ten_players")
        .select("*")
        .eq("user_id", userId)
        .order("ranking", { ascending: true });

      if (error) {
        console.error("Error fetching top ten players:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!userId,
    retry: false,
  });

  // Add player mutation
  const addPlayerMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!userId) throw new Error("User not authenticated");
      const nextRanking = (topTenPlayers?.length || 0) + 1;
      const { data, error } = await supabase
        .from("top_ten_players")
        .insert([{ user_id: userId, name, ranking: nextRanking }])
        .select("*")
        .single();

      if (error) {
        console.error("Error adding player:", error);
        throw error;
      }
      return data;
    },
    onMutate: async (name: string) => {
      setIsAddingPlayer(true);
      await queryClient.cancelQueries({ queryKey: ["topTenPlayers", userId] });
      const optimisticUpdate = [...(topTenPlayers || []), { id: -1, name, ranking: (topTenPlayers?.length || 0) + 1 }];
      queryClient.setQueryData(["topTenPlayers", userId], optimisticUpdate);
      return { optimisticUpdate };
    },
    onError: (_error, _name, context: any) => {
      toast({
        title: "Failed to add player",
        description: "Please try again.",
        variant: "destructive",
      });
      queryClient.setQueryData(["topTenPlayers", userId], context.optimisticUpdate);
    },
    onSettled: () => {
      setIsAddingPlayer(false);
      queryClient.invalidateQueries({ queryKey: ["topTenPlayers", userId] });
    },
  });

  // Update player rankings mutation
  const updateRankingsMutation = useMutation({
    mutationFn: async (updates: { id: number; ranking: number | null }[]) => {
      if (!userId) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("top_ten_players")
        .upsert(
          updates.map(({ id, ranking }) => ({ id, ranking, user_id: userId })),
          { onConflict: "id" }
        )
        .select("*");

      if (error) {
        console.error("Error updating rankings:", error);
        throw error;
      }
      return data;
    },
    onError: () => {
      toast({
        title: "Failed to update rankings",
        description: "Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["topTenPlayers", userId] });
    },
  });

  // Delete player mutation
  const deletePlayerMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("top_ten_players").delete().eq("id", id);
      if (error) {
        console.error("Error deleting player:", error);
        throw error;
      }
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["topTenPlayers", userId] });
      const optimisticUpdate = (topTenPlayers || []).filter((player) => player.id !== id);
      queryClient.setQueryData(["topTenPlayers", userId], optimisticUpdate);
      return { optimisticUpdate };
    },
    onError: (_error, id, context: any) => {
      toast({
        title: "Failed to delete player",
        description: "Please try again.",
        variant: "destructive",
      });
      queryClient.setQueryData(["topTenPlayers", userId], context.optimisticUpdate);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["topTenPlayers", userId] });
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

  const handleDeletePlayer = async (id: number) => {
    try {
      await deletePlayerMutation.mutateAsync(id);
    } catch (error: any) {
      toast({
        title: "Failed to delete player",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = reorderPlayers(
      topTenPlayers || [],
      result.source.index,
      result.destination.index
    );

    // Prepare updates for Supabase
    const updates = items.map((player: any, index: number) => ({
      id: player.id,
      ranking: index + 1,
    }));

    // Optimistically update the UI
    queryClient.setQueryData(["topTenPlayers", userId], items);

    try {
      // Call the updateRankingsMutation to update the rankings in Supabase
      await updateRankingsMutation.mutateAsync(updates);
    } catch (error: any) {
      // If the mutation fails, revert the UI to the previous state
      queryClient.setQueryData(["topTenPlayers", userId], topTenPlayers);
      toast({
        title: "Failed to update rankings",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
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

  if (isLoadingTopTen) {
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

  if (isErrorTopTen) {
    return (
      <div className="text-center text-red-500">
        Error: {errorTopTen?.message || "Failed to load players"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter player name"
          className="mr-2"
          disabled={topTenPlayers?.length >= 10 || isAddingPlayer}
        />
        <Button
          onClick={handleAddPlayer}
          disabled={topTenPlayers?.length >= 10 || isAddingPlayer}
        >
          {isAddingPlayer ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Add Player"
          )}
        </Button>
      </div>

      {topTenPlayers?.length >= 10 && (
        <div className="text-sm text-muted-foreground">
          You have reached the maximum of 10 players.
        </div>
      )}

      {topTenPlayers?.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No players added yet. Add some players to create your Top 10!
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="players">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {topTenPlayers?.map((player, index) => (
                  <Draggable key={player.id} draggableId={String(player.id)} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center justify-between px-4 py-2 bg-white rounded-md shadow-sm border border-gray-200"
                      >
                        <div className="flex items-center">
                          <GripVertical className="mr-2 h-5 w-5 text-gray-400 cursor-move" />
                          <span>{index + 1}. {player.name}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeletePlayer(player.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-trash"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </Button>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default YourTopTen;
