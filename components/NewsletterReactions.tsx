"use client";
import { useEffect, useState } from "react";
import { Heart, ThumbsUp, ThumbsDown } from "lucide-react";

type Counts = { love: number; like: number; dislike: number; mine: string | null };

function getClientId() {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem("hcg_client_id");
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem("hcg_client_id", id);
  }
  return id;
}

const OPTIONS = [
  { key: "love", Icon: Heart, label: "Love" },
  { key: "like", Icon: ThumbsUp, label: "Like" },
  { key: "dislike", Icon: ThumbsDown, label: "Dislike" },
] as const;

export default function NewsletterReactions({ issueId }: { issueId: string }) {
  const [counts, setCounts] = useState<Counts>({ love: 0, like: 0, dislike: 0, mine: null });
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    const id = getClientId();
    setClientId(id);
    fetch(`/api/reactions?issue_id=${issueId}&client_id=${id}`)
      .then((r) => r.json()).then(setCounts).catch(() => {});
  }, [issueId]);

  const react = async (reaction: string) => {
    if (!clientId) return;
    const isRemoving = counts.mine === reaction;
    // optimistic update
    setCounts((prev) => {
      const next = { ...prev };
      type ReactionKey = "love" | "like" | "dislike";
      if (prev.mine) next[prev.mine as ReactionKey] -= 1;
      if (!isRemoving) next[reaction as ReactionKey] += 1;
      next.mine = isRemoving ? null : reaction;
      return next;
    });
    try {
      if (isRemoving) {
        await fetch("/api/reactions", {
          method: "DELETE", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ issue_id: issueId, client_id: clientId }),
        });
      } else {
        await fetch("/api/reactions", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ issue_id: issueId, client_id: clientId, reaction }),
        });
      }
    } catch {}
  };

  return (
    <div className="flex items-center gap-2 pt-3 mt-3 border-t border-hairline/10">
      {OPTIONS.map(({ key, Icon, label }) => {
        const active = counts.mine === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => react(key)}
            aria-pressed={active}
            aria-label={label}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
              active
                ? "border-gold bg-gold/15 text-gold"
                : "border-hairline/15 text-parchment/50 hover:border-gold/40 hover:text-gold"
            }`}
          >
            <Icon size={13} strokeWidth={2} className={active ? "fill-current" : ""} />
            {counts[key]}
          </button>
        );
      })}
    </div>
  );
}
