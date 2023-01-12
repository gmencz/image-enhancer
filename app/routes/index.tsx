import { Features } from "~/components/Index/Features";
import { Footer } from "~/components/Index/Footer";
import { Gradient } from "~/components/Index/Gradient";
import { Hero } from "~/components/Index/Hero";
import { Nav } from "~/components/Index/Nav";
import { Pricing } from "~/components/Index/Pricing";

export default function Example() {
  return (
    <div className="isolate bg-white">
      <Gradient />
      <Nav />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <Footer />
      </main>
    </div>
  );
}
