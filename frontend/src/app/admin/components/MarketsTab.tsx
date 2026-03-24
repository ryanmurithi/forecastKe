"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit2, PlayCircle, Trash2 } from "lucide-react";

export interface Market {
    id: string;
    title: string;
    description: string;
    category: string;
    closeDate: string;
    status: "OPEN" | "CLOSED" | "RESOLVED";
    resolutionSource: string;
    yesPoints: number;
    noPoints: number;
    result: "YES" | "NO" | null;
}

const CATEGORIES = ["Politics", "Sports", "Economy", "Entertainment", "Tech", "Other"];

export function MarketsTab() {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "", description: "", category: "Politics", closeDate: "", resolutionSource: ""
    });

    const [editingMarket, setEditingMarket] = useState<Market | null>(null);
    const [resolvingMarket, setResolvingMarket] = useState<Market | null>(null);
    const [deletingMarket, setDeletingMarket] = useState<Market | null>(null);

    const fetchMarkets = async () => {
        try {
            const token = localStorage.getItem("forecastke_token");
            const res = await fetch("http://localhost:4000/api/markets", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch markets");
            const data = await res.json();
            setMarkets(data);
        } catch (err) {
            toast({ title: "Error", description: "Could not load markets", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarkets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const token = localStorage.getItem("forecastke_token");
            const res = await fetch("http://localhost:4000/api/markets", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...formData, closeDate: new Date(formData.closeDate).toISOString() })
            });
            if (!res.ok) throw new Error("Creation failed");
            toast({ title: "Success", description: "Market created successfully!" });
            setFormData({ title: "", description: "", category: "Politics", closeDate: "", resolutionSource: "" });
            fetchMarkets();
        } catch (err) {
            toast({ title: "Error", description: "Failed to create market", variant: "destructive" });
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMarket) return;
        setFormLoading(true);
        try {
            const token = localStorage.getItem("forecastke_token");
            const res = await fetch(`http://localhost:4000/api/markets/${editingMarket.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    title: editingMarket.title,
                    description: editingMarket.description,
                    category: editingMarket.category,
                    closeDate: new Date(editingMarket.closeDate).toISOString(),
                    resolutionSource: editingMarket.resolutionSource
                })
            });
            if (!res.ok) throw new Error("Edit failed");
            toast({ title: "Success", description: "Market updated!" });
            setEditingMarket(null);
            fetchMarkets();
        } catch (err) {
            toast({ title: "Error", description: "Failed to update market", variant: "destructive" });
        } finally {
            setFormLoading(false);
        }
    };

    const handleResolve = async (result: "YES" | "NO") => {
        if (!resolvingMarket) return;
        setFormLoading(true);
        try {
            const token = localStorage.getItem("forecastke_token");
            const res = await fetch(`http://localhost:4000/api/markets/${resolvingMarket.id}/resolve`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ result })
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Resolution failed");
            }
            toast({ title: "Success", description: `Market resolved as ${result}!` });
            setResolvingMarket(null);
            fetchMarkets();
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingMarket) return;
        setFormLoading(true);
        try {
            const token = localStorage.getItem("forecastke_token");
            const res = await fetch(`http://localhost:4000/api/markets/${deletingMarket.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Deletion failed");
            toast({ title: "Success", description: "Market deleted!" });
            setDeletingMarket(null);
            fetchMarkets();
        } catch (err) {
            toast({ title: "Error", description: "Failed to delete market", variant: "destructive" });
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Create Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Create New Market</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Market Question/Title" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Detailed rules and explanation..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Close Date (Local Time)</label>
                                <Input type="datetime-local" required value={formData.closeDate} onChange={e => setFormData({ ...formData, closeDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Resolution Source</label>
                                <Input required value={formData.resolutionSource} onChange={e => setFormData({ ...formData, resolutionSource: e.target.value })} placeholder="E.g. NYT, API, Official Results" />
                            </div>
                        </div>
                        <Button type="submit" disabled={formLoading} className="w-full md:w-auto">
                            {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Market
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Markets Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Manage Markets</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Stats (YES / NO)</TableHead>
                                        <TableHead>Close Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {markets.map(m => {
                                        const total = m.yesPoints + m.noPoints;
                                        const yesPct = total > 0 ? Math.round((m.yesPoints / total) * 100) : 50;
                                        return (
                                            <TableRow key={m.id}>
                                                <TableCell className="font-medium max-w-[200px] truncate" title={m.title}>{m.title}</TableCell>
                                                <TableCell>{m.category}</TableCell>
                                                <TableCell>
                                                    <Badge variant={m.status === "OPEN" ? "default" : m.status === "CLOSED" ? "secondary" : "outline"}>
                                                        {m.status}{m.status === "RESOLVED" && ` (${m.result})`}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-xs">
                                                        <span className="text-green-600 font-semibold">{yesPct}%</span> / <span className="text-red-600 font-semibold">{100 - yesPct}%</span>
                                                        <div className="text-muted-foreground mt-1">Staked: {total} pt</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {new Date(m.closeDate).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingMarket(m)}>
                                                            <Edit2 className="w-4 h-4 text-blue-500" />
                                                        </Button>
                                                        {m.status === "OPEN" && (
                                                            <Button variant="ghost" size="sm" onClick={() => setResolvingMarket(m)}>
                                                                <PlayCircle className="w-4 h-4 text-emerald-500" />
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="sm" onClick={() => setDeletingMarket(m)}>
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                    {markets.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No markets found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Editing Dialog */}
            <Dialog open={!!editingMarket} onOpenChange={(open) => !open && setEditingMarket(null)}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Edit Market</DialogTitle>
                    </DialogHeader>
                    {editingMarket && (
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input required value={editingMarket.title} onChange={e => setEditingMarket({ ...editingMarket, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea required className="min-h-[100px]" value={editingMarket.description} onChange={e => setEditingMarket({ ...editingMarket, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Close Date</label>
                                    <Input type="datetime-local" required value={editingMarket.closeDate.slice(0, 16)} onChange={e => setEditingMarket({ ...editingMarket, closeDate: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={editingMarket.category}
                                        onChange={e => setEditingMarket({ ...editingMarket, category: e.target.value })}
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingMarket(null)}>Cancel</Button>
                                <Button type="submit" disabled={formLoading}>
                                    {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Resolving Dialog */}
            <Dialog open={!!resolvingMarket} onOpenChange={(open) => !open && setResolvingMarket(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resolve Market</DialogTitle>
                        <DialogDescription>
                            Please confirm the correct outcome. Warning: This action is permanent and distributes points instantly.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-4 justify-center py-6">
                        <Button size="lg" className="w-32 bg-green-600 hover:bg-green-700" onClick={() => handleResolve("YES")} disabled={formLoading}>
                            {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} YES
                        </Button>
                        <Button size="lg" className="w-32 bg-red-600 hover:bg-red-700" onClick={() => handleResolve("NO")} disabled={formLoading}>
                            {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} NO
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Deleting Dialog */}
            <Dialog open={!!deletingMarket} onOpenChange={(open) => !open && setDeletingMarket(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Market</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to completely delete {deletingMarket?.title}? This removes all associated predictions and comments immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDeletingMarket(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
                            {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Delete Market
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
