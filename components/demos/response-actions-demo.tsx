"use client"

import * as React from "react"

import { Message } from "@/registry/default/message/message"
import {
  ResponseActions,
  type ResponseFeedback,
} from "@/registry/default/response-actions/response-actions"

const answer =
  "Rate limiting belongs in middleware so every route inherits it. Keep the counter in Redis with a sliding window, and return 429 with a Retry-After header once the window is full."

export function ResponseActionsDemo() {
  const [feedback, setFeedback] = React.useState<ResponseFeedback>(null)
  const [retries, setRetries] = React.useState(0)

  return (
    <div className="grid w-full max-w-xl gap-3">
      <Message
        role="assistant"
        name="Mischief"
        actions={
          <ResponseActions
            copyText={answer}
            feedback={feedback}
            onFeedbackChange={setFeedback}
            onRetry={() => setRetries((count) => count + 1)}
          />
        }
      >
        {answer}
      </Message>

      <p className="text-muted-foreground text-xs" role="status">
        {feedback === null ? "Not rated" : `Rated ${feedback}`}
        {retries > 0 ? ` · asked again ${retries}×` : ""}
      </p>
    </div>
  )
}
