import { Hero } from "../components/home/hero";
import { Pillars } from "../components/home/pillars";
import { WhyThemeKit } from "../components/home/why-theme-kit";
import { FrameworkMatrix } from "../components/home/framework-matrix";
import { SsrIntegrations } from "../components/home/ssr-integrations";
import { AdapterStory } from "../components/home/adapter-story";
import { Capabilities } from "../components/home/capabilities";
import { ThemeGallery } from "../components/home/theme-gallery";
import { LearningPath } from "../components/learning-path";
import { GetStarted } from "../components/home/get-started";
import { Reveal } from "../components/reveal";

export default function Home() {
  return (
    <>
      <Hero />
      <Reveal>
        <Pillars />
      </Reveal>
      <Reveal delay={60}>
        <WhyThemeKit />
      </Reveal>
      <Reveal delay={60}>
        <FrameworkMatrix />
      </Reveal>
      <Reveal delay={60}>
        <SsrIntegrations />
      </Reveal>
      <Reveal delay={60}>
        <Capabilities />
      </Reveal>
      <Reveal delay={60}>
        <AdapterStory />
      </Reveal>
      <Reveal delay={60}>
        <ThemeGallery />
      </Reveal>
      <Reveal delay={60}>
        <LearningPath />
      </Reveal>
      <Reveal delay={80}>
        <GetStarted />
      </Reveal>
    </>
  );
}
