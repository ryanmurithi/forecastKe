"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Trash2 } from "lucide-react";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: { username: string };
    userId: string;
    reactions: Reaction[];
    replies: Comment[];
}

interface Reaction {
    id: string;
    reactionType: string;
    userId: string;
}

export function CommentThread({ marketId }: { marketId: string }) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [marketId]);

    const fetchComments = () => {
        api.get(`/comments/${marketId}`).then((res) => setComments(res.data));
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        setLoading(true);
        try {
            await api.post("/comments", { marketId, content: newComment });
            setNewComment("");
            fetchComments();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this comment?")) return;
        try {
            await api.delete(`/comments/${id}`);
            fetchComments();
        } catch (e) {
            console.error(e);
        }
    };

    const handleReact = async (commentId: string, reactionType: string) => {
        try {
            await api.post("/comments/react", { commentId, reactionType });
            fetchComments();
        } catch (e) {
            console.error(e);
        }
    };

    const reactionEmojis = ["🔥", "😂", "🎯", "💀", "👀"];

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                    {user ? user.username[0].toUpperCase() : "?"}
                </div>
                <div className="flex-1 space-y-2">
                    <Textarea
                        placeholder="Add to the discussion..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={!user || loading}
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                            {!user ? "Please log in to comment" : ""}
                        </span>
                        <Button onClick={handlePostComment} disabled={!user || !newComment.trim() || loading}>
                            Post Comment
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to discuss!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-foreground font-bold">
                                {comment.user.username[0].toUpperCase()}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-semibold">{comment.user.username}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                                <div className="flex items-center gap-3 pt-1">
                                    {reactionEmojis.map(emoji => {
                                        const count = comment.reactions.filter(r => r.reactionType === emoji).length;
                                        const hasReacted = comment.reactions.some(r => r.reactionType === emoji && r.userId === user?.id);
                                        return (
                                            <button
                                                key={emoji}
                                                onClick={() => handleReact(comment.id, emoji)}
                                                className={`text-xs flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-secondary transition-colors ${hasReacted ? 'bg-secondary ring-1 ring-primary/20' : ''}`}
                                                disabled={!user}
                                            >
                                                <span>{emoji}</span> {count > 0 && <span className="font-medium">{count}</span>}
                                            </button>
                                        )
                                    })}

                                    <button className="text-xs text-muted-foreground font-medium flex items-center hover:text-foreground">
                                        <MessageCircle className="w-3.5 h-3.5 mr-1" /> Reply
                                    </button>

                                    {(user?.id === comment.userId || user?.role === "ADMIN") && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="text-xs text-destructive hover:bg-destructive/10 px-2 py-1 flex items-center rounded ml-auto transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
