import { SiteHeader } from "@/components/layout/site-header";
import { Hero } from "@/components/landing/hero";
import { GallerySection } from "@/components/landing/gallery-section";
import { getShowcasesForHome } from "@/lib/showcase-data";

export default async function Home() {
  const items = await getShowcasesForHome();

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
        <GallerySection items={items} />
      </main>
      <footer className="border-t border-foreground/10 py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AINterior. Rediseño asistido por IA.
      </footer>
    </>
  );
}
