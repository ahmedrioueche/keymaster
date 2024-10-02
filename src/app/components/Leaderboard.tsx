// Leaderboard.tsx
import React from "react";
import { User } from "../types/types";

interface LeaderboardProps {
  leaderboardData: User[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboardData }) => {
  if(!leaderboardData || leaderboardData.length == 0){
    return null
  }

  console.log("leaderboardData", leaderboardData);

  return (
    <div className="border-t pt-0">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b py-2 text-left px-4">Rank</th>
            <th className="border-b py-2 text-left px-4">Name</th>
            <th className="border-b py-2 text-left px-4">Speed (WPM)</th>
            <th className="border-b py-2 text-left px-4">Date</th>
          </tr>
        </thead>    
        <tbody>
          {leaderboardData && leaderboardData.length > 0 && leaderboardData.map((player : User, index : number) => (
            <tr className="hover:scale-105 transition duration-500" key={index}>
              <td className="border-b py-2 px-5">{player.rank}</td>
              <td className="border-b py-2 px-4">{player.name}</td>
              <td className="border-b py-2 px-4">{player.speed}</td>
              <td className="border-b py-2 px-4 text-sm ">{player.lastEntryDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
