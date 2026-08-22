"use client"

import { DemoVariants } from "@/components/demos/demo-variants"
import {
  SplitText,
  type SplitAnimation,
} from "@/registry/default/split-text/split-text"

const animations: SplitAnimation[] = ["rise", "fade", "blur", "scale"]

export function SplitTextDemo() {
  return (
    <DemoVariants
      label="Animation"
      variants={
        animations.map((animation) => ({
          id: animation,
          label: animation,
          render: () => (
            <p className="text-center text-3xl font-semibold text-balance">
              <SplitText
                key={animation}
                animation={animation}
                trigger="mount"
                by="character"
              >
                Good interfaces deserve a little mischief
              </SplitText>
            </p>
          ),
        })) as [
          { id: string; label: string; render: () => React.ReactNode },
          ...{ id: string; label: string; render: () => React.ReactNode }[],
        ]
      }
    />
  )
}
