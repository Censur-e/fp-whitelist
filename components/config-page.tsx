"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, ArrowLeft, Copy, Check, Search, ExternalLink, Filter } from "lucide-react"

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

interface GameGroup {
  placeId: string
  entries: WhitelistEntry[]
}

export default function ConfigPage({ isAuthenticated, setIsAuthenticated, onBackToHome }: ConfigPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [newPlaceId, setNewPlaceId] = useState("")
  const [newProductName, setNewProductName] = useState("")
  const [copied, setCopied] = useState(false)
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterProduct, setFilterProduct] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "games">("games")

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

  const groupByGame = (): GameGroup[] => {
    const groups = new Map<string, WhitelistEntry[]>()
    
    whitelist.forEach((entry) => {
      if (!groups.has(entry.place_id)) {
        groups.set(entry.place_id, [])
      }
      groups.get(entry.place_id)?.push(entry)
    })

    return Array.from(groups.entries()).map(([placeId, entries]) => ({
      placeId,
      entries,
    }))
  }

  const getUniqueProducts = (): string[] => {
    const products = new Set<string>()
    whitelist.forEach((entry) => products.add(entry.product_name))
    return Array.from(products)
  }

  const filteredWhitelist = whitelist.filter((entry) => {
    const matchesSearch = 
      entry.place_id.includes(searchQuery) || 
      entry.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterProduct === "all" || entry.product_name === filterProduct
    return matchesSearch && matchesFilter
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === "frenchproductadmin" && password === "fr20252026") {
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
local lienWebhook = "https://discord.com/api/webhooks/1412800811393613886/BaqZLEnWuCzW7OZUYqPIkiBVtmZE-juzWp6a4yazhCx8nKa9me7njSdROgqn48bto8O5"

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
			local embedauto = {
				["username"] = "French Product - WL",
				["embeds"] = {{
					["title"] = "Produit d�tect� sur un jeu whitelist",
					["description"] = nomProduit .. " a �t� d�tect� sur " .. "https://www.roblox.com/games/" .. placeId,
					["color"] = tonumber("22ff00")
				}}
			}
			
			pcall(function()
				HttpService:PostAsync(lienWebhook, HttpService:JSONEncode(embedauto))
			end)
			
			print("[French Product WL] Autoris�")
			return true
		end
	end

	local message = {
		["username"] = "French Product - WL",
		["embeds"] = {{
			["title"] = "Produit d�tect� sur un jeu non whitelist�",
			["description"] = nomProduit .. " a �t� d�tect� sur " .. "https://www.roblox.com/games/" .. placeId,
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
      <div className="max-w-7xl mx-auto">
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
            <div>
              <h1 className="text-3xl font-light text-white">Configuration Whitelist</h1>
              <p className="text-white/60 text-sm mt-1">
                {whitelist.length} produit{whitelist.length > 1 ? "s" : ""} • {groupByGame().length} jeu
                {groupByGame().length > 1 ? "x" : ""}
              </p>
            </div>
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
        <Card className="mb-6 bg-white/5 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Ajouter un nouveau produit</CardTitle>
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

        {/* Search and filters */}
        <div className="mb-6 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input
              placeholder="Rechercher par Place ID ou nom de produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 pl-10"
            />
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/20 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("games")}
              className={`${
                viewMode === "games"
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              Par Jeux
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`${
                viewMode === "list" ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              Liste
            </Button>
          </div>
          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="bg-white/5 border border-white/20 text-white rounded-lg px-4 py-2 outline-none"
          >
            <option value="all">Tous les produits</option>
            {getUniqueProducts().map((product) => (
              <option key={product} value={product}>
                {product}
              </option>
            ))}
          </select>
        </div>

        {/* Whitelist entries - Games View */}
        {viewMode === "games" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupByGame()
              .filter((group) =>
                group.entries.some(
                  (entry) =>
                    entry.place_id.includes(searchQuery) ||
                    entry.product_name.toLowerCase().includes(searchQuery.toLowerCase())
                )
              )
              .filter((group) => filterProduct === "all" || group.entries.some((e) => e.product_name === filterProduct))
              .map((group) => (
                <Card key={group.placeId} className="bg-white/5 backdrop-blur-sm border-white/20 hover:border-white/30 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2">Jeu #{group.placeId}</CardTitle>
                        <a
                          href={`https://www.roblox.com/games/${group.placeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
                        >
                          Ouvrir sur Roblox
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                        {group.entries.length} produit{group.entries.length > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {group.entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Badge className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30">
                              {entry.product_name}
                            </Badge>
                            <span className="text-white/50 text-xs">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </span>
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
              ))}
          </div>
        ) : (
          <Card className="bg-white/5 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">
                Produits autorisés ({filteredWhitelist.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredWhitelist.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium">Place ID: {entry.place_id}</p>
                          <a
                            href={`https://www.roblox.com/games/${entry.place_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <p className="text-white/50 text-sm">
                          Ajouté le {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30">
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
        )}

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
