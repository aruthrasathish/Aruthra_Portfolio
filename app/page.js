import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Education from "@/components/Education";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Awards from "@/components/Awards";
import Certifications from "@/components/Certifications";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Distributed-network field. Fixed, behind everything, pointer-inert. */}
      <AnimatedBackground />

      <a href="#main" className="skip-link btn-primary">
        Skip to content
      </a>

      <Navbar />

      {/*
        Narrative order: who I am, then where I trained, then where I have
        worked, what I can do, what I have built, and finally the credentials
        that back it up. Navbar order and scroll spy follow this list.
      */}
      <main id="main">
        <Hero />
        <About />
        <Education />
        <Experience />
        <Skills />
        <Projects />
        <Awards />
        <Certifications />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
