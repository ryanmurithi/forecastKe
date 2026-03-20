"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Flame, Target, Coins, Activity } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function UserProfile({ params }: { params: { username: string } }) {
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [predictions, setPredictions] = useState<any[]>([]);

    useEffect(() => {
        // We didn't build a public profile fetch endpoint in MVP spec, 
        // but assuming /api/auth/profile fetched by ID or JWT.
        // For this prototype, if it's the logged-in user, fetch own predictions.
        // If we had a public /api/users/:username, we'd call it here.
        if (currentUser?.username === params.username) {
            api.get("/auth/profile").then(res => setProfile(res.data));
            api.get("/predictions/me").then(res => setPredictions(res.data));
        } else {
            // Fallback for demo purposes if looking at others
            setProfile({ username: params.username, points: '---', accuracy: '---', streak: '---' });
        }
    }, [params.username, currentUser]);

    if (!profile) return <div className="text-center py-20 animate-pulse">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            <div className="flex flex-col md:flex-row items-center gap-6 bg-card border p-8 rounded-2xl shadow-sm">
                <Avatar className="w-24 h-24 bg-primary/10 flex items-center justify-center text-4xl text-primary font-bold">
                    {profile.username[0].toUpperCase()}
                </Avatar>
                <div className="text-center md:text-left space-y-2 flex-1">
                    <h1 className="text-3xl font-bold">{profile.username}</h1>
                    <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                        Joined {profile.createdAt ? formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true }) : 'recently'}
                        {currentUser?.username === profile.username && <Badge variant="secondary">You</Badge>}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Points" value={profile.points} icon={<Coins className="w-5 h-5 text-yellow-500" />} />
                <StatCard title="Accuracy Rate" value={`${profile.accuracy}%`} icon={<Target className="w-5 h-5 text-yes" />} />
                <StatCard title="Current Streak" value={`${profile.streak} days`} icon={<Flame className="w-5 h-5 text-orange-500" />} />
                <StatCard title="Markets Predicted" value={predictions.length || "---"} icon={<Activity className="w-5 h-5 text-blue-500" />} />
            </div>

            {currentUser?.username === profile.username && (
                <div className="space-y-4 pt-8">
                    <h2 className="text-2xl font-bold">Prediction History</h2>

                    {predictions.length === 0 ? (
                        <div className="text-center py-10 bg-secondary/50 rounded-xl border border-dashed text-muted-foreground">
                            No predictions yet. <Link href="/" className="text-primary hover:underline">Explore markets</Link>
                        </div>
                    ) : (
                        <div className="bg-card rounded-xl border shadow-sm overflow-hidden text-sm">
                            <table className="w-full text-left">
                                <thead className="bg-secondary/50">
                                    <tr>
                                        <th className="py-3 px-4 font-semibold">Market</th>
                                        <th className="py-3 px-4 font-semibold">Prediction</th>
                                        <th className="py-3 px-4 font-semibold">Staked</th>
                                        <th className="py-3 px-4 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {predictions.map(p => (
                                        <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                                            <td className="py-3 px-4">
                                                <Link href={`/markets/${p.market.id}`} className="hover:text-primary font-medium line-clamp-1">
                                                    {p.market.title}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className={p.prediction === 'YES' ? 'text-yes border-yes border-opacity-50' : 'text-no border-no border-opacity-50'}>
                                                    {p.prediction}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 font-medium">{p.pointsStaked} pts</td>
                                            <td className="py-3 px-4">
                                                {p.market.status === 'OPEN' ? (
                                                    <Badge variant="secondary">Pending</Badge>
                                                ) : p.market.result === p.prediction ? (
                                                    <Badge variant="outline" className="bg-yes/10 text-yes">Won</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-destructive/10 text-destructive">Lost</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
    return (
        <div className="bg-card border p-4 rounded-xl shadow-sm flex flex-col justify-center items-center text-center space-y-2 hover:border-primary/50 transition-colors">
            <div className="p-2 bg-secondary rounded-full">{icon}</div>
            <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">{title}</div>
            <div className="text-xl md:text-2xl font-bold">{value}</div>
        </div>
    );
}
