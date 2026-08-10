import { forwardRef } from "react"
import type { LucideProps } from "lucide-react"

export const GitHubIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      {...props}
    >
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.57-.3-5.27-1.29-5.27-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.16 1.18a10.96 10.96 0 0 1 5.75 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.12 3.05.73.81 1.17 1.83 1.17 3.09 0 4.41-2.7 5.39-5.28 5.68.42.36.79 1.06.79 2.14v3.27c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  )
)

GitHubIcon.displayName = "GitHubIcon"
