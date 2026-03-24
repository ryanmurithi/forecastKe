"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LayoutDashboard, Store, Users as UsersIcon } from "lucide-react";
import { OverviewTab } from "./components/OverviewTab";
import { MarketsTab } from "./components/MarketsTab";
import { UsersTab } from "./components/UsersTab";

// Types
type Role = "ADMIN" | "USER";
interface User {
    id: string;
    username: string;
    role: Role;
    points: number;
}

export default function AdminDashboard() {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            try {
                const token = localStorage.getItem("forecastke_token");
                const userStr = localStorage.getItem("forecastke_user");
                if (!token || !userStr) {
                    router.push("/auth/login");
                    return;
                }

                const user = JSON.parse(userStr) as User;
                if (user.role !== "ADMIN") {
                    router.push("/auth/login");
                } else {
                    setIsAdmin(true);
                }
            } catch (err) {
                router.push("/auth/login");
            }
        };
        checkAuth();
    }, [router]);

    if (isAdmin === null) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="p-8 text-center text-red-500 font-semibold bg-red-50/50 rounded-lg border border-red-100">
                Unauthorized Access
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-8rem)]">
            {/* Sidebar for Desktop, hidden on mobile */}
            <aside className="hidden md:flex flex-col w-64 bg-card rounded-xl border p-4 shadow-sm h-fit">
                <h2 className="text-xl font-bold mb-6 px-2 text-primary">Admin Panel</h2>
                <nav className="flex flex-col gap-2">
                    <Button
                        variant={activeTab === "overview" ? "default" : "ghost"}
                        className="justify-start gap-3"
                        onClick={() => setActiveTab("overview")}
                    >
                        <LayoutDashboard className="h-5 w-5" /> Overview
                    </Button>
                    <Button
                        variant={activeTab === "markets" ? "default" : "ghost"}
                        className="justify-start gap-3"
                        onClick={() => setActiveTab("markets")}
                    >
                        <Store className="h-5 w-5" /> Markets
                    </Button>
                    <Button
                        variant={activeTab === "users" ? "default" : "ghost"}
                        className="justify-start gap-3"
                        onClick={() => setActiveTab("users")}
                    >
                        <UsersIcon className="h-5 w-5" /> Users
                    </Button>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto">
                {/* Mobile Tabs (only visible on small screens) */}
                <div className="md:hidden mb-6 block">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="markets">Markets</TabsTrigger>
                            <TabsTrigger value="users">Users</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Content Views */}
                <div className="bg-card border shadow-sm rounded-xl p-6 min-h-[600px]">
                    {activeTab === "overview" && (
                        <div>
                            <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>
                            <p className="text-muted-foreground">Stats will load here...</p>
                        </div>
                    )}
                    {activeTab === "markets" && (
                        <MarketsTab />
                    )}
                    {activeTab === "users" && (
                        <UsersTab />
                    )}
                </div>
            </main>
        </div>
    );
}
