// Leaderboard.tsx
import React from "react";

interface LeaderboardProps {
  leaderboardData: {
    rank: number;
    name: string;
    speed: number;
    date: string;
  }[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboardData }) => {
  return (
    <div className="border-t pt-0 mt-6">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b py-2 text-left px-3">Rank</th>
            <th className="border-b py-2 text-left px-3">Name</th>
            <th className="border-b py-2 text-left px-3">Speed (WPM)</th>
            <th className="border-b py-2 text-left px-3">Date</th>
          </tr>
        </thead>    
        <tbody>
          {leaderboardData.map((player, index) => (
            <tr key={index}>
              <td className="border-b py-2 px-3">{player.rank}</td>
              <td className="border-b py-2 px-3">{player.name}</td>
              <td className="border-b py-2 px-3">{player.speed}</td>
              <td className="border-b py-2 px-3">{player.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
