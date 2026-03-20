"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboard() {
    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Politics");
    const [closeDate, setCloseDate] = useState("");
    const [resolutionSource, setResolutionSource] = useState("");
    const [msg, setMsg] = useState("");

    if (!user || user.role !== "ADMIN") {
        return <div className="text-center py-20 text-destructive font-bold h-screen">Access Denied</div>;
    }

    const handleCreateMarket = async () => {
        try {
            await api.post("/markets", {
                title, description, category, closeDate: new Date(closeDate).toISOString(), resolutionSource
            });
            setMsg("Market created!");
            setTitle(""); setDescription(""); setCloseDate(""); setResolutionSource("");
        } catch (e: any) {
            setMsg("Error: " + e.response?.data?.error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 space-y-8">
            <h1 className="text-3xl font-bold border-b pb-4">Admin Dashboard</h1>

            <div className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
                <h2 className="text-xl font-semibold">Create New Market</h2>
                <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
                <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                <select
                    className="w-full h-10 px-3 py-2 rounded-md border bg-background"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                >
                    <option>Politics</option>
                    <option>Sports</option>
                    <option>Entertainment</option>
                    <option>Economy</option>
                    <option>Tech</option>
                    <option>Other</option>
                </select>
                <Input type="datetime-local" value={closeDate} onChange={e => setCloseDate(e.target.value)} />
                <Input placeholder="Resolution Source (e.g. Official Results)" value={resolutionSource} onChange={e => setResolutionSource(e.target.value)} />

                <Button onClick={handleCreateMarket} className="w-full">Create Market</Button>
                {msg && <p className="text-sm font-medium text-center">{msg}</p>}
            </div>
        </div>
    );
}
