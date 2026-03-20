"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface PredictModalProps {
    marketId: string;
    predictionOption: "YES" | "NO" | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function PredictModal({ marketId, predictionOption, isOpen, onClose, onSuccess }: PredictModalProps) {
    const { user, refreshProfile } = useAuth();
    const [pointsStaked, setPointsStaked] = useState<number>(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const maxPoints = user?.points || 0;

    const handlePredict = async () => {
        if (!user) return;
        setLoading(true);
        setError("");
        try {
            await api.post("/predictions", { marketId, prediction: predictionOption, pointsStaked });
            await refreshProfile();
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to predict");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Predict {predictionOption}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span>Points to Stake</span>
                        <span className="text-muted-foreground">Balance: {maxPoints} pts</span>
                    </div>

                    <div className="space-y-4">
                        <Slider
                            value={[pointsStaked]}
                            min={10}
                            max={maxPoints > 10 ? maxPoints : 10}
                            step={10}
                            onValueChange={([val]) => setPointsStaked(val)}
                            disabled={maxPoints < 10}
                        />
                        <div className="flex justify-center">
                            <Input
                                type="number"
                                value={pointsStaked}
                                onChange={(e) => setPointsStaked(Math.min(maxPoints, Math.max(10, parseInt(e.target.value) || 10)))}
                                className="w-32 text-center text-lg font-bold"
                                min={10}
                                max={maxPoints}
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-destructive text-center">{error}</p>}

                    <Button
                        className={`w-full text-lg h-12 ${predictionOption === 'YES' ? 'bg-yes hover:bg-yes/90' : 'bg-no hover:bg-no/90'}`}
                        onClick={handlePredict}
                        disabled={loading || maxPoints < 10}
                    >
                        {loading ? "Confirming..." : `Confirm ${pointsStaked} pts`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
