import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import EditProfileDialog from "./EditProfileDialog";
import { getAvatarUrl } from "@/lib/utils";

export default function ProfileHeader({ user }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border border-border">
          <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} />
          <AvatarFallback className="text-base sm:text-lg bg-muted">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 tracking-tight">
                {user.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono mb-2 sm:mb-3">
                @{user.username}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Joined {user.joinDate}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="gap-2 w-full sm:w-auto"
            >
              <Pencil className="w-4 h-4" />
              <span className="sm:inline">Edit Profile</span>
            </Button>
          </div>
        </div>
      </div>

      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={user}
      />
    </>
  );
}
