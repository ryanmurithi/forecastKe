"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post("/auth/login", { email, password });
            login(res.data.token, res.data.user);
        } catch (err: any) {
            setError(err.response?.data?.error || "Login failed");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 border rounded-2xl bg-card shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-bold">Welcome Back</h1>
                <p className="text-muted-foreground">Sign in to your ForecastKE account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label className="text-sm font-medium">Password</label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full">Sign In</Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account? <Link href="/auth/register" className="text-primary hover:underline">Sign up</Link>
            </div>
        </div>
    );
}
