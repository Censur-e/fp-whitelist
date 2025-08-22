"use client"

import { useState } from "react"
import Header from "@/components/header"
import HeroContent from "@/components/hero-content"
import PulsingCircle from "@/components/pulsing-circle"
import ShaderBackground from "@/components/shader-background"
import ConfigPage from "@/components/config-page"

export default function RobloxWhitelistSystem() {
  const [currentPage, setCurrentPage] = useState<"home" | "config">("home")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (currentPage === "config") {
    return (
      <ShaderBackground>
        <ConfigPage
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          onBackToHome={() => setCurrentPage("home")}
        />
      </ShaderBackground>
    )
  }

  return (
    <ShaderBackground>
      <Header onConfigClick={() => setCurrentPage("config")} />
      <HeroContent />
      <PulsingCircle />
    </ShaderBackground>
  )
}
