"use client"

import * as React from "react"
import { OtpInput } from "@/registry/default/otp-input/otp-input"

export function OtpInputDemo() {
  const [code, setCode] = React.useState("")

  return (
    <div className="grid w-full max-w-md justify-items-center gap-4">
      <p className="text-muted-foreground text-sm">
        We sent a code to your phone.
      </p>

      <OtpInput value={code} onChange={setCode} />

      <p className="text-muted-foreground text-xs" role="status">
        {code.length === 6 ? "Checking the code" : `${code.length} of 6`}
      </p>
    </div>
  )
}
