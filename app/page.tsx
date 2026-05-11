import { readData } from "@/lib/db";
import type { HomeData } from "@/lib/types";
import HolaMundo from "@/components/ui/HolaMundo";

export default function HomePage(): JSX.Element {
  const homeData = readData<HomeData>("home.json");

  return (
    <main className="min-h-screen flex items-center justify-center bg-black overflow-hidden">
      <HolaMundo
        greeting={homeData.hero.greeting}
        subtitle={homeData.hero.subtitle}
      />
    </main>
  );
}
