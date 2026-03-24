"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Store, Activity, Coins } from "lucide-react";

export function OverviewTab() {
    const [stats, setStats] = useState<{
        totalMarkets: number;
        openMarkets: number;
        totalUsers: number;
        totalPoints: number;
    } | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("forecastke_token");
                if (!token) return;

                const [marketsRes, usersRes] = await Promise.all([
                    fetch("http://localhost:4000/api/markets", {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch("http://localhost:4000/api/admin/users", {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (!marketsRes.ok || !usersRes.ok) throw new Error("Failed to fetch stats");

                const markets = await marketsRes.json();
                const users = await usersRes.json();

                setStats({
                    totalMarkets: markets.length,
                    openMarkets: markets.filter((m: any) => m.status === "OPEN").length,
                    totalUsers: users.length,
                    totalPoints: users.reduce((acc: number, user: any) => acc + user.points, 0)
                });
            } catch (err) {
                toast({ title: "Error", description: "Failed to load overview stats", variant: "destructive" });
            }
        };
        fetchStats();
    }, [toast]);

    if (!stats) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Markets</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMarkets}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Markets</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.openMarkets}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Points Circulating</CardTitle>
                        <Coins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
