import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function ProfileHeader({ user }) {
  return (
    <div className="flex items-start gap-6 mb-8">
      <Avatar className="w-20 h-20 border border-border">
        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
        <AvatarFallback className="text-lg bg-muted">
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <h1 className="text-4xl font-bold mb-1 tracking-tight">{user.name}</h1>
        <p className="text-sm text-muted-foreground font-mono mb-3">
          @{user.username}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Joined {user.joinDate}
          </span>
        </div>
      </div>
    </div>
  );
}
