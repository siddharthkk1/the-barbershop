import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
  team: string;
  image_url: string;
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
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
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
      const { data, error } = await supabase
        .from("user_rankings")
        .select("rankings")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user rankings:", error);
        toast({
          title: "Error fetching rankings",
          description: "Failed to retrieve your rankings. Please try again.",
          variant: "destructive",
        });
      }

      if (data && data.rankings) {
        // Ensure the fetched rankings are of the correct type (Player[])
        setRankings(data.rankings as Player[]);
      } else {
        setRankings([]); // Initialize with an empty array if no data is found
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
      // Upsert the user rankings
      const { error } = await supabase
        .from("user_rankings")
        .upsert(
          {
            user_id: userId,
            rankings: rankings,
            updated_at: new Date(),
          },
          { onConflict: "user_id" }
        );

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
    setAvailablePlayers(availablePlayers.filter((p) => p.id !== player.id));
  };

  const removePlayer = (playerToRemove: Player) => {
    setRankings(rankings.filter((player) => player.id !== playerToRemove.id));
    setAvailablePlayers([...availablePlayers, playerToRemove]);
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

  return (
    <div className="space-y-6">
      <PlayerSearch onSelectPlayer={addPlayer} />

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
                  id={player.id}
                  player={player}
                  rank={index + 1}
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
