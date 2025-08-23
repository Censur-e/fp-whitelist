"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, ArrowLeft, Copy, Check } from "lucide-react"

interface ConfigPageProps {
  isAuthenticated: boolean
  setIsAuthenticated: (auth: boolean) => void
  onBackToHome: () => void
}

interface WhitelistEntry {
  id: string
  place_id: string
  product_name: string
  created_at: string
}

export default function ConfigPage({ isAuthenticated, setIsAuthenticated, onBackToHome }: ConfigPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [newPlaceId, setNewPlaceId] = useState("")
  const [newProductName, setNewProductName] = useState("")
  const [copied, setCopied] = useState(false)
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadWhitelist()
    }
  }, [isAuthenticated])

  const loadWhitelist = async () => {
    try {
      const response = await fetch("/api/whitelist")
      const result = await response.json()
      if (result.data) {
        setWhitelist(result.data)
      }
    } catch (error) {
      console.error("Error loading whitelist:", error)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === "admin" && password === "roblox2024") {
      setIsAuthenticated(true)
    } else {
      alert("Identifiants incorrects!")
    }
  }

  const addToWhitelist = async () => {
    if (newPlaceId && newProductName) {
      setLoading(true)
      try {
        const response = await fetch("/api/whitelist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            placeId: newPlaceId,
            productName: newProductName,
          }),
        })

        if (response.ok) {
          setNewPlaceId("")
          setNewProductName("")
          await loadWhitelist() // Reload the list
        } else {
          alert("Erreur lors de l'ajout")
        }
      } catch (error) {
        console.error("Error adding to whitelist:", error)
        alert("Erreur lors de l'ajout")
      } finally {
        setLoading(false)
      }
    }
  }

  const removeFromWhitelist = async (id: string) => {
    try {
      const response = await fetch(`/api/whitelist?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadWhitelist() // Reload the list
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Error removing from whitelist:", error)
      alert("Erreur lors de la suppression")
    }
  }

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(luaScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const luaScript = `local HttpService = game:GetService("HttpService")
local placeId = game.PlaceId
local nomProduit = "NomDuProduit"
local lienWebhook = ""

local function verifierWhitelist()
	local success, response = pcall(function()
		return HttpService:PostAsync(
			"https://fp-whitelist.vercel.app/api/verify",
			HttpService:JSONEncode({placeId = placeId, productName = nomProduit}),
			Enum.HttpContentType.ApplicationJson
		)
	end)

	if success and response then
		local decoded
		local ok = pcall(function()
			decoded = HttpService:JSONDecode(response)
		end)

		if ok and decoded and decoded.authorized then
			print("[French Product WL] Autorisé")
			return true
		end
	end

	local message = {
		["username"] = "French Product - WL",
		["embeds"] = {{
			["title"] = "Produit détecté sur un jeu non whitelisté",
			["description"] = nomProduit .. " a été détecté sur " .. "https://www.roblox.com/games/" .. placeId,
			["color"] = tonumber("0x00ff00")
		}}
	}

	pcall(function()
		HttpService:PostAsync(lienWebhook, HttpService:JSONEncode(message))
	end)

	return false
end

verifierWhitelist()
`

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white/5 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToHome}
                className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 rounded-full p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-white">Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <Button type="submit" className="w-full bg-white text-black hover:bg-white/90">
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToHome}
              className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 rounded-full p-3 border border-white/20 hover:border-white/40"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-light text-white">Configuration Whitelist</h1>
          </div>
          <Button
            onClick={() => setIsAuthenticated(false)}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            Déconnexion
          </Button>
        </div>

        {/* Add new entry */}
        <Card className="mb-8 bg-white/5 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToHome}
                className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 rounded-full p-2 border border-white/20 hover:border-white/40"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-white">Ajouter un nouveau produit</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Place ID (ex: 123456789)"
                value={newPlaceId}
                onChange={(e) => setNewPlaceId(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                disabled={loading}
              />
              <Input
                placeholder="Nom du produit (ex: Team-System)"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                disabled={loading}
              />
              <Button onClick={addToWhitelist} className="bg-white text-black hover:bg-white/90" disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                {loading ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Whitelist entries */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Produits autorisés ({whitelist.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {whitelist.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-white font-medium">Place ID: {entry.place_id}</p>
                      <p className="text-white/70 text-sm">
                        Ajouté le {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                      {entry.product_name}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => removeFromWhitelist(entry.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Information */}
        <Card className="mt-8 bg-white/5 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Script Roblox</CardTitle>
              <Button
                onClick={copyScript}
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copié!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copier
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900/80 p-6 rounded-xl border border-white/20 relative">
              <pre className="text-emerald-400 text-sm font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {luaScript}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
