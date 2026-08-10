import type { NextConfig } from "next"

const isGitHubPages = process.env.GITHUB_ACTIONS === "true"

const nextConfig: NextConfig = {
  agentRules: false,
  output: "export",
  basePath: isGitHubPages ? "/mischief-ui" : "",
  assetPrefix: isGitHubPages ? "/mischief-ui/" : undefined,
  reactStrictMode: true,
  trailingSlash: true,
  typedRoutes: true,
}

export default nextConfig
