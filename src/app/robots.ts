import type { MetadataRoute } from "next"
import { publicSiteUrl } from "@/data/site-url"

export default function robots(): MetadataRoute.Robots {
  const sitemap = `${publicSiteUrl()}/sitemap.xml`
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/dashboard/"],
    },
    sitemap,
  }
}
