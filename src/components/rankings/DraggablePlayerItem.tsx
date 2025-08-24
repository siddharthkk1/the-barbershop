
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GripVertical } from "lucide-react";

type Player = {
  id: string;
  name: string;
  team: string | null;
  position: string | null;
  image_url?: string | null;
};

type DraggablePlayerItemProps = {
  player: Player;
  position: number;
  onRemove: (playerId: string) => void;
};

const DraggablePlayerItem = ({ player, position, onRemove }: DraggablePlayerItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-md border bg-card text-card-foreground ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing flex items-center justify-center p-1"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
        {position}
      </div>

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
        onClick={() => onRemove(player.id)}
      >
        Remove
      </Button>
    </div>
  );
};

export default DraggablePlayerItem;
