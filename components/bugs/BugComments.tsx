"use client";

import { useState } from "react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { formatDateTime } from "@/lib/utils";
import { Loader2, Reply, MessageSquare, CornerDownRight } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  message: string;
  createdAt: string;
  user: {
    name: string;
    avatar?: string | null;
    role: string;
  };
  replies?: Comment[];
}

interface BugCommentsProps {
  bugId: string;
  initialComments: Comment[];
}

export function BugComments({ bugId, initialComments }: BugCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/bugs/${bugId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const json = await res.json();
      if (json.success) {
        setComments([...comments, json.data]);
        setMessage("");
        toast.success("Comment added");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setReplySubmitting(true);
    try {
      const res = await fetch(`/api/bugs/${bugId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage, parentId }),
      });
      const json = await res.json();
      if (json.success) {
        setComments(
          comments.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: [...(c.replies || []), json.data],
              };
            }
            return c;
          })
        );
        setReplyMessage("");
        setReplyToId(null);
        toast.success("Reply added");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add reply");
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-base">Discussion</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
          {comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)} comments
        </span>
      </div>

      {/* Comment List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No discussions yet. Start the conversation!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              {/* Main Comment */}
              <div className="p-4 rounded-xl bg-card border border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={comment.user.name} image={comment.user.avatar} size="sm" />
                    <div>
                      <p className="text-sm font-semibold">{comment.user.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium capitalize">{comment.user.role.toLowerCase().replace("_", " ")}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{formatDateTime(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{comment.message}</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    Reply
                  </button>
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-2 pl-6 md:pl-10">
                  <CornerDownRight className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-2" />
                  <div className="flex-1 p-4 rounded-xl bg-card/60 border border-border/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserAvatar name={reply.user.name} image={reply.user.avatar} size="sm" />
                        <div>
                          <p className="text-sm font-semibold">{reply.user.name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium capitalize">{reply.user.role.toLowerCase().replace("_", " ")}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{formatDateTime(reply.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                  </div>
                </div>
              ))}

              {/* Reply Form */}
              {replyToId === comment.id && (
                <form
                  onSubmit={(e) => handleReplySubmit(e, comment.id)}
                  className="flex items-start gap-2 pl-6 md:pl-10 animate-[slide-up_0.15s_ease-out]"
                >
                  <CornerDownRight className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-2" />
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                    <button
                      type="submit"
                      disabled={replySubmitting || !replyMessage.trim()}
                      className="px-4 h-9 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs flex items-center gap-1.5"
                    >
                      {replySubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                      Reply
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))
        )}
      </div>

      {/* Main Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="Join the discussion, mention someone..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
        <button
          type="submit"
          disabled={submitting || !message.trim()}
          className="px-5 h-10 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Comment
        </button>
      </form>
    </div>
  );
}
