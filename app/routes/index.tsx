import { Features } from "~/components/Index/Features";
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
        <Pricing />
        <Features />

        <footer>I am the footer</footer>
      </main>
    </div>
  );
}
