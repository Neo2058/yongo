import { projects } from "@/content/projects"
import type { MetadataRoute } from "next"
import {
  getPublishedSitePage,
  listPublishedPublicPosts,
  listPublishedShopServices,
} from "@/data/content"
import { publicSiteUrl } from "@/data/site-url"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicSiteUrl()
  const [posts, services, work, about] = await Promise.all([
    listPublishedPublicPosts(),
    listPublishedShopServices(),
    getPublishedSitePage("work"),
    getPublishedSitePage("about"),
  ])

  const now = new Date()
  const pages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/order`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ]

  if (work) {
    pages.push({
      url: `${base}/work`,
      lastModified: work.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  }
  if (work) {
    for (const project of projects) {
      pages.push({ url: `${base}/work/${project.slug}`, changeFrequency: "monthly", priority: 0.8 })
    }
  }
  if (about) {
    pages.push({
      url: `${base}/about`,
      lastModified: about.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  }

  for (const service of services) {
    pages.push({
      url: `${base}/services/${service.slug}`,
      lastModified: service.updatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    })
  }
  for (const post of posts) {
    pages.push({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    })
  }

  return pages
}
