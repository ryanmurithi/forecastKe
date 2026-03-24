"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, ShieldAlert, ShieldCheck } from "lucide-react";

export interface User {
    id: string;
    username: string;
    email: string;
    points: number;
    role: "ADMIN" | "USER";
    status?: "ACTIVE" | "BANNED";
    createdAt: string;
}

export function UsersTab() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    const [actionLoading, setActionLoading] = useState(false);
    const [banningUser, setBanningUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("forecastke_token");
            const res = await fetch("http://localhost:4000/api/admin/users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            toast({ title: "Error", description: "Could not load users", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleBanToggle = async () => {
        if (!banningUser) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem("forecastke_token");
            const res = await fetch(`http://localhost:4000/api/admin/users/${banningUser.id}/ban`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Action failed");
            toast({ title: "Success", description: `User status updated successfully!` });
            fetchUsers();
        } catch (err) {
            toast({ title: "Error", description: "Failed to update user status", variant: "destructive" });
        } finally {
            setActionLoading(false);
            setBanningUser(null);
        }
    };

    const handlePromote = async (user: User) => {
        if (!confirm(`Are you sure you want to promote ${user.username} to ADMIN?`)) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem("forecastke_token");
            const res = await fetch(`http://localhost:4000/api/admin/users/${user.id}/promote`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Promotion failed");
            toast({ title: "Success", description: `${user.username} has been promoted to Admin!` });
            fetchUsers();
        } catch (err) {
            toast({ title: "Error", description: "Failed to promote user", variant: "destructive" });
        } finally {
            setActionLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
                    <div>
                        <CardTitle>User Management</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Total Users: {users.length}</p>
                    </div>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by username or email..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Points</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map(u => (
                                        <TableRow key={u.id}>
                                            <TableCell>
                                                <div className="font-medium">{u.username}</div>
                                                <div className="text-sm text-muted-foreground">{u.email}</div>
                                            </TableCell>
                                            <TableCell>{u.points.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>{u.role}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={u.status === "BANNED" ? "destructive" : "outline"}>
                                                    {u.status || "ACTIVE"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {u.role === "USER" && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePromote(u)}
                                                            disabled={actionLoading}
                                                            title="Promote to Admin"
                                                        >
                                                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setBanningUser(u)}
                                                        disabled={actionLoading}
                                                        title={u.status === "BANNED" ? "Unban User" : "Ban User"}
                                                    >
                                                        <ShieldAlert className={`w-4 h-4 ${u.status === "BANNED" ? "text-orange-500" : "text-red-500"}`} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No users found matching "{searchQuery}"
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Ban Confirm Dialog */}
            <Dialog open={!!banningUser} onOpenChange={(open) => !open && setBanningUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{banningUser?.status === "BANNED" ? "Unban User" : "Ban User"}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {banningUser?.status === "BANNED" ? "unban" : "ban"} {banningUser?.username}?
                            {banningUser?.status !== "BANNED" && " They will lose access to placing predictions and commenting."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setBanningUser(null)}>Cancel</Button>
                        <Button variant={banningUser?.status === "BANNED" ? "default" : "destructive"} onClick={handleBanToggle} disabled={actionLoading}>
                            {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
