import React from 'react';
import { User } from '../lib/types';

interface LeaderboardProps {
  leaderboardData: User[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboardData }) => {
  // Remove duplicate players based on the 'id' field and filter out users without speed
  const uniqueLeaderboardData =
    leaderboardData && leaderboardData.length > 0
      ? leaderboardData.reduce((acc, player) => {
          if (player.speed && !acc.find((p) => p.id === player.id)) {
            acc.push(player);
          }
          return acc;
        }, [] as User[])
      : null;
  if (
    !uniqueLeaderboardData || // Check for null, undefined, or other falsy values
    (Array.isArray(uniqueLeaderboardData) && uniqueLeaderboardData.length === 0) || // Check if it's an empty array
    (typeof uniqueLeaderboardData === 'object' && Object.keys(uniqueLeaderboardData).length === 0) // Check if it's an empty object
  ) {
    return null;
  }

  // Sort players by speed in descending order
  const sortedLeaderboardData = uniqueLeaderboardData.sort((a, b) => (b.speed ?? 0) - (a.speed ?? 0));

  return (
    <div className="border-t pt-0">
      <table className="min-w-full border-collapse rounded-lg overflow-hidden shadow-lg">
        <thead>
          <tr>
            <th className="border-b py-2 text-left px-4">Rank</th>
            <th className="border-b py-2 text-left px-4">Name</th>
            <th className="border-b py-2 text-left px-4">Speed (WPM)</th>
            <th className="border-b py-2 text-left px-4">Date</th>
          </tr>
        </thead>
        <tbody>
          {sortedLeaderboardData.map((player: User, index: number) => (
            <tr key={player.id}>
              <td className="border-b py-2 px-5">{index + 1}</td> {/* Rank based on index + 1 */}
              <td className="border-b py-2 px-4">{player.username}</td>
              <td className="border-b py-2 px-4">{player.speed}</td>
              <td className="border-b py-2 px-4 text-sm">
                {player?.lastEntryDate
                  ? new Date(player.lastEntryDate).toLocaleDateString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
