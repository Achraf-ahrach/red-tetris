import React from "react";
import { useLeaderboard } from "@/api/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Leaderboard = () => {
  const { data, isLoading, isError } = useLeaderboard("classic");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>

        <Card>
          <CardHeader>
            <CardTitle>Top Players</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <p className="text-muted-foreground">Loading leaderboard...</p>
            )}
            {isError && (
              <p className="text-muted-foreground">
                Leaderboard not available yet. Play some games to see rankings!
              </p>
            )}
            {!isLoading &&
              !isError &&
              Array.isArray(data) &&
              data.length === 0 && (
                <p className="text-muted-foreground">No scores yet.</p>
              )}
            {!isLoading &&
              !isError &&
              Array.isArray(data) &&
              data.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 pr-4">#</th>
                        <th className="py-2 pr-4">Player</th>
                        <th className="py-2 pr-4">Score</th>
                        <th className="py-2 pr-4">Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, idx) => (
                        <tr
                          key={row.id || idx}
                          className="border-b last:border-0"
                        >
                          <td className="py-2 pr-4 font-medium">{idx + 1}</td>
                          <td className="py-2 pr-4">
                            {row.username || row.player || "Unknown"}
                          </td>
                          <td className="py-2 pr-4">
                            {row.score ?? row.points ?? 0}
                          </td>
                          <td className="py-2 pr-4 capitalize">
                            {row.mode || "classic"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
