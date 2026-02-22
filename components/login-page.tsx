"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, User } from "lucide-react"
import Image from "next/image"
import ShaderBackground from "@/components/shader-background"
import PulsingCircle from "@/components/pulsing-circle"

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    setTimeout(() => {
      if (username === "frenchproductadmin" && password === "fr20252026") {
        onLogin()
      } else {
        setError("Identifiant ou mot de passe incorrect")
      }
      setLoading(false)
    }, 800)
  }

  return (
    <ShaderBackground>
      <PulsingCircle />
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
          {/* Left side - Hero Image */}
          <div className="hidden md:flex flex-col items-center justify-center space-y-6 p-8">
          <div className="relative w-full aspect-square max-w-md">
            <Image
              src="/dashboard-hero.jpg"
              alt="Dashboard Security"
              fill
              className="object-cover rounded-2xl shadow-2xl"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent rounded-2xl" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white">Roblox Whitelist</h1>
            <p className="text-slate-400 text-lg">Gérez vos scripts en toute sécurité</p>
          </div>
          <div className="flex items-center gap-6 text-slate-300">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm">Sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-400" />
              <span className="text-sm">Protégé</span>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md bg-black/30 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="space-y-1 text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
                  <Image src="/roblox-logo.jpg" alt="Roblox" fill className="object-cover" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-white">Connexion</CardTitle>
              <CardDescription className="text-white/60 text-base">
                Accédez au panneau d'administration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-white/90">
                    Identifiant
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="frenchproductadmin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 pl-10 h-12 focus:border-violet-500 focus:ring-violet-500/20"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-white/90">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 pl-10 h-12 focus:border-violet-500 focus:ring-violet-500/20"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium shadow-lg transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-white/40 text-center">
                  Plateforme sécurisée de gestion de whitelist Roblox
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ShaderBackground>
  )
}
