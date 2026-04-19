import { HeroSection } from "@/components/sections/hero"
import { ProblemSection } from "@/components/sections/problem"
import { IncludesSection } from "@/components/sections/includes"
import { BonusSection } from "@/components/sections/bonus"
import { InstructorSection } from "@/components/sections/instructor"
import { PricingSection } from "@/components/sections/pricing"
import { FaqSection } from "@/components/sections/faq"
import { FinalCta } from "@/components/sections/final-cta"
import { StickyBar } from "@/components/sections/sticky-bar"
import { Navbar } from "@/components/sections/navbar"

export default function Home() {
  return (
    <>
      <Navbar />
      <StickyBar />
      <main className="flex flex-col">
        <HeroSection />

        <ProblemSection />
        <IncludesSection />
        <BonusSection />
        <PricingSection />
        <InstructorSection />
        <FaqSection />
        <FinalCta />
      </main>
      <footer className="border-t border-white/[.07] bg-black py-10 text-center text-sm text-zinc-600">
        <p className="font-semibold text-zinc-400 mb-2">Periodistas Digitales</p>
        <p className="mb-3">© 2025 Sistema de Ingresos Diarios para Periodistas — José Fiaccini</p>
        <div className="flex justify-center gap-6">
          <a href="#" className="hover:text-indigo-400 transition-colors">Política de privacidad</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">Términos y condiciones</a>
          <a
            href="https://pay.hotmart.com/H99593850B?checkoutMode=10&src=Landing-page-1&sck=b2"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Comprar ahora
          </a>
        </div>
      </footer>
    </>
  )
}
