import React from "react";
import { useLeaderboard } from "@/api/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Leaderboard = () => {
  const { data, isLoading, isError } = useLeaderboard("classic");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>

      
      </div>
    </div>
  );
};

export default Leaderboard;
