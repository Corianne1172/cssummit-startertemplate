import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import designConfig from "@/design.config";
import { resolveDesign } from "@/lib/design";

export default function Home() {
  const design = resolveDesign(designConfig);
  return (
    <>
      <Hero layout={design.layout} />
      <Features />
    </>
  );
}
