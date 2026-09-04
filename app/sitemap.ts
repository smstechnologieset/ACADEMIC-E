import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/content";
import { getCmsCourses, slugify } from "@/lib/cms-repo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/apply`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/track`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/payment-instructions`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic course routes
  try {
    const courses = await getCmsCourses();
    const courseRoutes: MetadataRoute.Sitemap = courses.map((course) => {
      const slug = course.slug || slugify(course.title);
      return {
        url: `${baseUrl}/courses/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      };
    });

    return [...staticRoutes, ...courseRoutes];
  } catch {
    return staticRoutes;
  }
}
