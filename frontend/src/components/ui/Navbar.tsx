"use client";

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './button';
import { Coins, LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="border-b bg-background sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="font-bold text-xl tracking-tight text-indigo-600 dark:text-indigo-400">
                    ForecastKE
                </Link>

                <div className="flex items-center space-x-4">
                    <ThemeToggle />

                    {user ? (
                        <>
                            <div className="flex items-center bg-secondary px-3 py-1.5 rounded-full text-sm font-medium">
                                <Coins className="w-4 h-4 mr-1 text-yellow-500" />
                                {user.points} pts
                            </div>
                            <Link href={`/profile/${user.username}`} className="text-sm font-medium hover:text-primary">
                                {user.username}
                            </Link>
                            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <div className="space-x-2">
                            <Button variant="outline" asChild>
                                <Link href="/auth/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/auth/register">Sign Up</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
