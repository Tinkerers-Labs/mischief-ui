import type { NextConfig } from "next"

const isGitHubPages = process.env.DEPLOY_TARGET === "github-pages"

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
