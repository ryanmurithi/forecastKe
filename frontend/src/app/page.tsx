"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Users, MessageSquare } from "lucide-react";

interface Market {
  id: string;
  title: string;
  category: string;
  closeDate: string;
  yesPoints: number;
  noPoints: number;
  _count: { predictions: number; comments: number };
}

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [category, setCategory] = useState("All");

  const categories = ["All", "Politics", "Sports", "Entertainment", "Economy", "Tech", "Other"];

  useEffect(() => {
    // Fetch trending markets
    api.get("/markets/trending").then((res) => {
      setMarkets(res.data);
    });
  }, []);

  const filteredMarkets = category === "All" ? markets : markets.filter((m) => m.category === category);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="text-center space-y-4 py-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Kenya's Prediction Hub
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Forecast outcomes, discuss with the community, and climb the leaderboard using virtual points.
        </p>
      </section>

      <div className="flex justify-center flex-wrap gap-2">
        {categories.map((c) => (
          <Badge
            key={c}
            variant={category === c ? "default" : "secondary"}
            className="cursor-pointer text-sm px-4 py-1.5"
            onClick={() => setCategory(c)}
          >
            {c}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMarkets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
        {filteredMarkets.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No markets found.
          </div>
        )}
      </div>
    </div>
  );
}

function MarketCard({ market }: { market: Market }) {
  const totalPoints = market.yesPoints + market.noPoints;
  const yesProb = totalPoints === 0 ? 50 : Math.round((market.yesPoints / totalPoints) * 100);
  const noProb = 100 - yesProb;

  return (
    <Link href={`/markets/${market.id}`}>
      <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer h-full flex flex-col group">
        <CardHeader className="space-y-2 pb-4">
          <div className="flex justify-between items-start">
            <Badge variant="outline">{market.category}</Badge>
            <span className="text-xs text-muted-foreground">
              Closes {formatDistanceToNow(new Date(market.closeDate), { addSuffix: true })}
            </span>
          </div>
          <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors">
            {market.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-yes">YES {yesProb}%</span>
              <span className="text-no">NO {noProb}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3 flex overflow-hidden">
              <div className="bg-yes transition-all duration-1000" style={{ width: `${yesProb}%` }} />
              <div className="bg-no transition-all duration-1000" style={{ width: `${noProb}%` }} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t text-sm text-muted-foreground flex justify-between">
          <span>{totalPoints.toLocaleString()} pts staked</span>
          <div className="flex space-x-3">
            <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> {market._count.predictions}</span>
            <span className="flex items-center"><MessageSquare className="w-4 h-4 mr-1" /> {market._count.comments}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
