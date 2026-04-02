import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Hero } from "@/components/landing/hero";
import { GallerySection } from "@/components/landing/gallery-section";
import { getShowcasesForHome } from "@/lib/showcase-data";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const viewerIsPlus =
    session?.user?.role === "USER" && Boolean(session.user.isPlus);
  const items = await getShowcasesForHome(viewerIsPlus);

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
        <GallerySection items={items} />
      </main>
      <SiteFooter />
    </>
  );
}
