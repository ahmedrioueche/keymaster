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
  return (
    <div className="border-t pt-0 mt-6">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b py-2 text-left px-6">Rank</th>
            <th className="border-b py-2 text-left px-6">Name</th>
            <th className="border-b py-2 text-left px-6">Speed (WPM)</th>
            <th className="border-b py-2 text-left px-6">Date</th>
          </tr>
        </thead>    
        <tbody>
          {leaderboardData.map((player : User, index : any) => (
            <tr className="hover:scale-105 transition duration-500" key={index}>
              <td className="border-b py-2 px-6">{player.rank}</td>
              <td className="border-b py-2 px-6">{player.name}</td>
              <td className="border-b py-2 px-6">{player.speed}</td>
              <td className="border-b py-2 px-6 text-sm ">{player.lastEntryDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
