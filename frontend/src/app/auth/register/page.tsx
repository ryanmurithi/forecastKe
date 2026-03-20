"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post("/auth/register", { username, email, password });
            login(res.data.token, res.data.user);
        } catch (err: any) {
            setError(err.response?.data?.error || "Registration failed");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 border rounded-2xl bg-card shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-bold">Create Account</h1>
                <p className="text-muted-foreground">Join ForecastKE to start predicting</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Username</label>
                    <Input type="text" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} maxLength={20} />
                </div>
                <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label className="text-sm font-medium">Password</label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full">Sign Up</Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account? <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link>
            </div>
        </div>
    );
}
