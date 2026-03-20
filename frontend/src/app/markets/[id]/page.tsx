"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { PredictModal } from "@/components/markets/PredictModal";
import { Badge } from "@/components/ui/badge";
import { CommentThread } from "@/components/discussion/CommentThread";
import { getSocket } from "@/lib/socket";

export default function MarketDetail({ params }: { params: { id: string } }) {
    const [market, setMarket] = useState<any>(null);
    const [predictOption, setPredictOption] = useState<"YES" | "NO" | null>(null);
    const [livePoints, setLivePoints] = useState<{ yes: number, no: number } | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        api.get(`/markets/${params.id}`).then((res) => {
            setMarket(res.data);
            setLivePoints({ yes: res.data.yesPoints, no: res.data.noPoints });
        });

        const socket = getSocket();
        socket.connect();

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        socket.emit('join_market', params.id);

        socket.on('probability_update', (data) => {
            setLivePoints({ yes: data.yesPoints, no: data.noPoints });
        });

        return () => {
            socket.emit('leave_market', params.id);
            socket.off('probability_update');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [params.id]);

    if (!market || !livePoints) return <div className="text-center py-20 animate-pulse">Loading market...</div>;

    const totalPoints = livePoints.yes + livePoints.no;
    const yesProb = totalPoints === 0 ? 50 : Math.round((livePoints.yes / totalPoints) * 100);
    const noProb = 100 - yesProb;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <Badge variant="outline">{market.category}</Badge>
                <h1 className="text-3xl md:text-5xl font-bold leading-tight">{market.title}</h1>
                <p className="text-lg text-muted-foreground">{market.description}</p>
            </div>

            <div className="bg-card border rounded-2xl p-6 md:p-10 space-y-8 shadow-sm">
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <div className="text-3xl md:text-5xl font-black text-yes tracking-tighter">{yesProb}% YES</div>
                            <div className="text-muted-foreground text-sm font-medium">{livePoints.yes.toLocaleString()} pts staked</div>
                        </div>

                        {isConnected && (
                            <Badge variant="outline" className="text-yes border-yes bg-yes/10 mb-2">
                                <span className="w-2 h-2 rounded-full bg-yes mr-2 animate-pulse" /> Live
                            </Badge>
                        )}

                        <div className="space-y-1 text-right">
                            <div className="text-3xl md:text-5xl font-black text-no tracking-tighter">{noProb}% NO</div>
                            <div className="text-muted-foreground text-sm font-medium">{livePoints.no.toLocaleString()} pts staked</div>
                        </div>
                    </div>

                    <div className="w-full bg-secondary rounded-full h-8 flex overflow-hidden ring-1 ring-inset ring-black/5">
                        <div className="bg-yes transition-all duration-1000 ease-out" style={{ width: `${yesProb}%` }} />
                        <div className="bg-no transition-all duration-1000 ease-out" style={{ width: `${noProb}%` }} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <Button
                        size="lg"
                        className="h-16 text-xl bg-yes hover:bg-yes/90"
                        onClick={() => setPredictOption("YES")}
                        disabled={market.status !== "OPEN"}
                    >
                        Predict YES 🟢
                    </Button>
                    <Button
                        size="lg"
                        className="h-16 text-xl bg-no hover:bg-no/90"
                        onClick={() => setPredictOption("NO")}
                        disabled={market.status !== "OPEN"}
                    >
                        Predict NO 🔴
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-secondary p-4 rounded-xl">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Pool</div>
                    <div className="text-xl font-semibold mt-1">{totalPoints.toLocaleString()}</div>
                </div>
                <div className="bg-secondary p-4 rounded-xl">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Predictions</div>
                    <div className="text-xl font-semibold mt-1">{market._count.predictions}</div>
                </div>
                <div className="bg-secondary p-4 rounded-xl">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Time Left</div>
                    <div className="text-xl font-semibold mt-1 text-primary">
                        {market.status === 'OPEN' ? formatDistanceToNow(new Date(market.closeDate)) : market.status}
                    </div>
                </div>
                <div className="bg-secondary p-4 rounded-xl">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Resolution</div>
                    <div className="text-sm font-semibold mt-1 overflow-hidden text-ellipsis whitespace-nowrap" title={market.resolutionSource}>
                        {market.resolutionSource}
                    </div>
                </div>
            </div>

            {/* Discussion component */}
            <div className="pt-10">
                <h2 className="text-2xl font-bold mb-6">Discussion</h2>
                <CommentThread marketId={market.id} />
            </div>

            <PredictModal
                marketId={market.id}
                predictionOption={predictOption}
                isOpen={!!predictOption}
                onClose={() => setPredictOption(null)}
                onSuccess={() => {
                    // Re-fetch market immediately on success as a fallback
                    api.get(`/markets/${params.id}`).then((res) => setMarket(res.data));
                }}
            />
        </div>
    );
}
