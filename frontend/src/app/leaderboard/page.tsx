"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { TrendingUp, Award, Flame } from "lucide-react";

interface UserRank {
    id: string;
    username: string;
    points: number;
    accuracy: number;
    streak: number;
}

export default function Leaderboard() {
    const [pointsLeaderboard, setPointsLeaderboard] = useState<UserRank[]>([]);
    const [accLeaderboard, setAccLeaderboard] = useState<UserRank[]>([]);

    useEffect(() => {
        api.get("/leaderboard").then(res => setPointsLeaderboard(res.data));
        api.get("/leaderboard/accuracy").then(res => setAccLeaderboard(res.data));
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight">Leaderboard</h1>
                <p className="text-muted-foreground">Top forecasters on the platform</p>
            </div>

            <Tabs defaultValue="points" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto mb-8">
                    <TabsTrigger value="points">By Points</TabsTrigger>
                    <TabsTrigger value="accuracy">By Accuracy</TabsTrigger>
                </TabsList>

                <TabsContent value="points" className="space-y-4">
                    <LeaderboardTable data={pointsLeaderboard} metric="points" icon={<Award className="w-5 h-5 text-yellow-500" />} />
                </TabsContent>
                <TabsContent value="accuracy" className="space-y-4">
                    <LeaderboardTable data={accLeaderboard} metric="accuracy" icon={<TrendingUp className="w-5 h-5 text-yes" />} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function LeaderboardTable({ data, metric, icon }: { data: UserRank[], metric: "points" | "accuracy", icon: React.ReactNode }) {
    if (data.length === 0) return <div className="text-center py-10 opacity-50">No users found...</div>;

    return (
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-secondary/50 text-muted-foreground text-sm uppercase tracking-wider">
                            <th className="py-4 px-6 font-semibold">Rank</th>
                            <th className="py-4 px-6 font-semibold">Forecaster</th>
                            <th className="py-4 px-6 font-semibold flex items-center gap-1.5">{icon} {metric === "points" ? "Points" : "Accuracy"}</th>
                            <th className="py-4 px-6 font-semibold">🔥 Streak</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm md:text-base">
                        {data.map((user, idx) => (
                            <tr key={user.id} className="hover:bg-secondary/20 transition-colors group">
                                <td className="py-4 px-6">
                                    <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold
                    ${idx === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                                            idx === 1 ? 'bg-slate-300 text-slate-700' :
                                                idx === 2 ? 'bg-amber-700/20 text-amber-700' : 'text-muted-foreground'}`
                                    }>
                                        {idx + 1}
                                    </span>
                                </td>
                                <td className="py-4 px-6 font-medium">
                                    <Link href={`/profile/${user.username}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                                        <Avatar className="w-8 h-8 bg-primary/10 flex items-center justify-center text-xs">
                                            {user.username[0].toUpperCase()}
                                        </Avatar>
                                        {user.username}
                                    </Link>
                                </td>
                                <td className="py-4 px-6 font-bold tabular-nums">
                                    {metric === 'points' ? user.points.toLocaleString() : `${user.accuracy}%`}
                                </td>
                                <td className="py-4 px-6 text-muted-foreground font-medium flex items-center gap-1.5 pt-4">
                                    <Flame className="w-4 h-4 text-orange-500" /> {user.streak} days
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
