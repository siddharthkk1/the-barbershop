
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DraggablePlayerItem from "./DraggablePlayerItem";
import PlayerSearch from "./PlayerSearch";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
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

interface Player {
  id: string;
  name: string;
  team: string | null;
  position: string | null;
  image_url?: string | null;
}

interface YourTopTenProps {
  userId: string | null;
  userEmail: string | null;
  isLoading: boolean;
  onGoogleSignIn: () => void;
}

const YourTopTen = ({ userId, userEmail, isLoading, onGoogleSignIn }: YourTopTenProps) => {
  const { toast } = useToast();
  const [rankings, setRankings] = useState<Player[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserRankings(userId);
    } else {
      setRankings([]);
    }
  }, [userId]);

  const fetchUserRankings = async (userId: string) => {
    try {
      // Fetch user rankings joined with player data
      const { data, error } = await supabase
        .from("user_rankings")
        .select(`
          rank_position,
          nba_players (
            id,
            name,
            team,
            position,
            image_url
          )
        `)
        .eq("user_id", userId)
        .order("rank_position", { ascending: true });

      if (error) {
        console.error("Error fetching user rankings:", error);
        toast({
          title: "Error fetching rankings",
          description: "Failed to retrieve your rankings. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        // Transform the data to match our Player interface
        const playerRankings = data
          .filter(item => item.nba_players) // Filter out any null player references
          .map(item => ({
            id: item.nba_players.id,
            name: item.nba_players.name,
            team: item.nba_players.team,
            position: item.nba_players.position,
            image_url: item.nba_players.image_url,
          }));
        
        setRankings(playerRankings);
      } else {
        setRankings([]);
      }
    } catch (error) {
      console.error("Unexpected error fetching user rankings:", error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred while fetching your rankings.",
        variant: "destructive",
      });
    }
  };

  const saveRankings = async () => {
    if (!userId) {
      toast({
        title: "Not signed in",
        description: "Please sign in to save your rankings.",
        variant: "destructive",
      });
      return;
    }

    if (rankings.length !== 10) {
      toast({
        title: "Incomplete ranking",
        description: "Please rank exactly 10 players before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // First, delete existing rankings for this user
      await supabase
        .from("user_rankings")
        .delete()
        .eq("user_id", userId);

      // Then insert new rankings
      const rankingData = rankings.map((player, index) => ({
        user_id: userId,
        player_id: player.id,
        rank_position: index + 1,
      }));

      const { error } = await supabase
        .from("user_rankings")
        .insert(rankingData);

      if (error) {
        console.error("Error saving rankings:", error);
        toast({
          title: "Error saving rankings",
          description: "Failed to save your rankings. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Rankings saved",
          description: "Your NBA player rankings have been successfully saved!",
        });
      }
    } catch (error) {
      console.error("Unexpected error saving rankings:", error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred while saving your rankings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = rankings.findIndex((player) => player.id === active.id);
      const newIndex = rankings.findIndex((player) => player.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setRankings((items) => arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  const addPlayer = (player: Player) => {
    if (rankings.find((p) => p.id === player.id)) {
      toast({
        title: "Player already added",
        description: "This player is already in your Top 10 list.",
        variant: "destructive",
      });
      return;
    }

    if (rankings.length >= 10) {
      toast({
        title: "Maximum players reached",
        description: "You can only rank up to 10 players.",
        variant: "destructive",
      });
      return;
    }

    setRankings([...rankings, player]);
  };

  const removePlayer = (playerId: string) => {
    setRankings(rankings.filter((player) => player.id !== playerId));
  };

  const clearRankings = async () => {
    if (!userId) {
      toast({
        title: "Not signed in",
        description: "Please sign in to clear your rankings.",
        variant: "destructive",
      });
      return;
    }

    setIsClearing(true);
    try {
      const { error } = await supabase
        .from("user_rankings")
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error("Error clearing rankings:", error);
        toast({
          title: "Error clearing rankings",
          description: "Failed to clear your rankings. Please try again.",
          variant: "destructive",
        });
      } else {
        setRankings([]);
        toast({
          title: "Rankings cleared",
          description: "Your NBA player rankings have been successfully cleared!",
        });
      }
    } catch (error) {
      console.error("Unexpected error clearing rankings:", error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred while clearing your rankings.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!userId) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">Sign in to create your rankings</h3>
          <p className="text-muted-foreground mb-6">
            Create and save your personal NBA player Top 10 list
          </p>
          <GoogleSignInButton 
            onSuccess={() => console.log("Google sign-in successful")}
            onError={(error) => console.error("Google sign-in error:", error)}
            disabled={isLoading}
          />
        </div>
      </div>
    );
  }

  // Create a set of player IDs that are already in rankings for PlayerSearch
  const rankedPlayerIds = new Set(rankings.map(player => player.id));

  return (
    <div className="space-y-6">
      <PlayerSearch onAdd={addPlayer} disabledIds={rankedPlayerIds} />

      {rankings.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={rankings.map((player) => player.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-4">
              {rankings.map((player, index) => (
                <DraggablePlayerItem
                  key={player.id}
                  player={player}
                  position={index + 1}
                  onRemove={removePlayer}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">
            No players ranked yet
          </h3>
          <p className="text-muted-foreground">
            Search for players to add to your Top 10 list.
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <Button
          onClick={saveRankings}
          disabled={rankings.length !== 10 || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Rankings"
          )}
        </Button>

        <Button
          variant="destructive"
          onClick={clearRankings}
          disabled={isClearing}
        >
          {isClearing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Clearing...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Rankings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default YourTopTen;
