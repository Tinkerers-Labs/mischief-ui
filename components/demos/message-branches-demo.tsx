"use client"

import * as React from "react"

import { Message } from "@/registry/default/message/message"
import {
  MessageBranches,
  type BranchNode,
} from "@/registry/default/message-branches/message-branches"

type Turn = BranchNode & { role: "user" | "assistant"; text: string }

const turns: Turn[] = [
  {
    id: "q1",
    parentId: null,
    role: "user",
    label: "Undo the last commit, keep changes",
    text: "How do I undo my last commit but keep the changes?",
  },
  {
    id: "a1",
    parentId: "q1",
    role: "assistant",
    label: "git reset --soft HEAD~1",
    text: "Run git reset --soft HEAD~1. The commit goes away and its changes stay staged, ready to commit again.",
  },
  {
    id: "a1-retry",
    parentId: "q1",
    role: "assistant",
    label: "git reset HEAD~1",
    text: "Run git reset HEAD~1. That uses the default mixed mode, so the commit goes away and your edits stay in the working tree, unstaged.",
  },
  {
    id: "q2",
    parentId: null,
    role: "user",
    label: "Undo a commit already pushed",
    text: "How do I undo a commit I already pushed?",
  },
  {
    id: "a2",
    parentId: "q2",
    role: "assistant",
    label: "git revert <commit>",
    text: "Use git revert with the commit hash. It adds a new commit that reverses the old one, so nobody else's history is rewritten.",
  },
  {
    id: "q2-follow",
    parentId: "a2",
    role: "user",
    label: "Does that work for a merge?",
    text: "Does that work for a merge commit?",
  },
  {
    id: "a2-follow",
    parentId: "q2-follow",
    role: "assistant",
    label: "git revert -m 1",
    text: "Yes. Add -m 1 to say which parent to keep: git revert -m 1 followed by the merge commit's hash.",
  },
  {
    id: "q3",
    parentId: null,
    role: "user",
    label: "Change the last commit message",
    text: "How do I change the message of my last commit?",
  },
  {
    id: "a3",
    parentId: "q3",
    role: "assistant",
    label: "git commit --amend",
    text: "Run git commit --amend and edit the message. If the commit is already pushed this rewrites history, so keep it to your own branch.",
  },
]

const byId = new Map(turns.map((turn) => [turn.id, turn]))

/** From the chosen message up to the first, then down its newest replies. */
function pathThrough(id: string) {
  const path: string[] = []
  for (let at = byId.get(id); at; at = byId.get(at.parentId ?? "")) {
    path.unshift(at.id)
  }

  for (;;) {
    const last = path[path.length - 1]
    const replies = turns.filter((turn) => turn.parentId === last)
    if (replies.length === 0) return path
    path.push(replies[replies.length - 1]!.id)
  }
}

export function MessageBranchesDemo() {
  const [activePath, setActivePath] = React.useState(() => pathThrough("q2"))

  return (
    <div className="bg-background border-border w-full max-w-[36rem] rounded-[1.25rem] border p-4 shadow-sm sm:p-5">
      {activePath.map((id) => {
        const turn = byId.get(id)!

        return (
          <div
            key={id}
            className={`flex flex-col ${turn.role === "user" ? "items-end" : "items-start"}`}
          >
            <Message className="w-full" role={turn.role}>
              {turn.text}
            </Message>
            <MessageBranches
              activePath={activePath}
              className="-mt-2 mb-1"
              messageId={id}
              nodes={turns}
              onSelect={(branchId) => setActivePath(pathThrough(branchId))}
            />
          </div>
        )
      })}
    </div>
  )
}
