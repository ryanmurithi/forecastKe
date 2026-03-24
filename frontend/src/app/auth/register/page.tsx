"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!acceptTerms) {
            setError("You must accept the Terms and Conditions and Privacy Policy.");
            return;
        }
        try {
            const res = await api.post("/auth/register", { username, email, password, termsAccepted: acceptTerms });
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
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-start space-x-2 pt-2">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                        required
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                        I agree to the{" "}
                        <Link href="/terms" className="text-primary hover:underline" target="_blank">
                            Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                            Privacy Policy
                        </Link>
                    </label>
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
