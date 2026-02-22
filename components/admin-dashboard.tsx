"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Trash2,
  Plus,
  Search,
  ExternalLink,
  LogOut,
  Shield,
  Server,
  Package,
  Copy,
  Check,
  Filter,
  LayoutGrid,
  List,
} from "lucide-react"

interface AdminDashboardProps {
  onLogout: () => void
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

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [newPlaceId, setNewPlaceId] = useState("")
  const [newProductName, setNewProductName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterProduct, setFilterProduct] = useState("all")
  const [viewMode, setViewMode] = useState<"games" | "list">("games")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadWhitelist()
  }, [])

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

  const addToWhitelist = async () => {
    if (!newPlaceId || !newProductName) return

    setLoading(true)
    try {
      const response = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place_id: newPlaceId,
          product_name: newProductName,
        }),
      })

      if (response.ok) {
        await loadWhitelist()
        setNewPlaceId("")
        setNewProductName("")
      }
    } catch (error) {
      console.error("Error adding to whitelist:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWhitelist = async (id: string) => {
    try {
      await fetch("/api/whitelist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      await loadWhitelist()
    } catch (error) {
      console.error("Error removing from whitelist:", error)
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
      entry.place_id.includes(searchQuery) || entry.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterProduct === "all" || entry.product_name === filterProduct
    return matchesSearch && matchesFilter
  })

  const scriptContent = `local HttpService = game:GetService("HttpService")
local placeId = tostring(game.PlaceId)
local productName = "PRODUCT_NAME"

local success, result = pcall(function()
  return HttpService:GetAsync("YOUR_SITE_URL/api/verify?placeId=" .. placeId .. "&productName=" .. productName)
end)

if success then
  local data = HttpService:JSONDecode(result)
  if data.authorized then
    print("Script authorized")
  else
    game.Players.LocalPlayer:Kick("Unauthorized")
  end
else
  game.Players.LocalPlayer:Kick("Verification failed")
end`

  const copyScript = () => {
    navigator.clipboard.writeText(scriptContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-xl font-bold text-white">Roblox Whitelist Manager</h1>
                <p className="text-xs text-slate-400">Panneau d'administration</p>
              </div>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-600/10 to-blue-700/5 border-blue-500/20 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-300">Total Produits</p>
                  <p className="text-3xl font-bold text-white mt-2">{whitelist.length}</p>
                </div>
                <Package className="w-12 h-12 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-600/10 to-violet-700/5 border-violet-500/20 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-300">Jeux Actifs</p>
                  <p className="text-3xl font-bold text-white mt-2">{groupByGame().length}</p>
                </div>
                <Server className="w-12 h-12 text-violet-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/10 to-green-700/5 border-green-500/20 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-300">Produits Uniques</p>
                  <p className="text-3xl font-bold text-white mt-2">{getUniqueProducts().length}</p>
                </div>
                <Shield className="w-12 h-12 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add New Product */}
        <Card className="mb-6 bg-slate-900/50 backdrop-blur border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Ajouter un produit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Place ID (ex: 123456789)"
                value={newPlaceId}
                onChange={(e) => setNewPlaceId(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                disabled={loading}
              />
              <Input
                placeholder="Nom du produit (ex: Team-System)"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                disabled={loading}
              />
              <Button
                onClick={addToWhitelist}
                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white min-w-[140px]"
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-2" />
                {loading ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Roblox Script */}
        <Card className="mb-6 bg-slate-900/50 backdrop-blur border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Script Roblox</CardTitle>
              <Button
                onClick={copyScript}
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copié
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
            <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800">
              <pre className="text-emerald-400 text-sm overflow-x-auto font-mono leading-relaxed">{scriptContent}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
            <Input
              placeholder="Rechercher par Place ID ou produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-900/50 border border-slate-800 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("games")}
                className={`${
                  viewMode === "games"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Jeux
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`${
                  viewMode === "list"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <List className="w-4 h-4 mr-2" />
                Liste
              </Button>
            </div>

            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="bg-slate-900/50 border border-slate-800 text-white rounded-lg px-4 py-2 outline-none cursor-pointer"
            >
              <option value="all">Tous les produits</option>
              {getUniqueProducts().map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Games View */}
        {viewMode === "games" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <Card
                  key={group.placeId}
                  className="bg-slate-900/50 backdrop-blur border-slate-800 hover:border-slate-700 transition-all"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2 flex items-center gap-2">
                          <Server className="w-5 h-5 text-blue-400" />
                          Jeu #{group.placeId}
                        </CardTitle>
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
                      <Badge className="bg-slate-800 text-slate-300 border-slate-700">
                        {group.entries.length} produit{group.entries.length > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {group.entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <Package className="w-4 h-4 text-violet-400" />
                            <Badge className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-violet-300 border-violet-500/30">
                              {entry.product_name}
                            </Badge>
                            <span className="text-slate-500 text-xs">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <Button
                            onClick={() => removeFromWhitelist(entry.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
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
          <Card className="bg-slate-900/50 backdrop-blur border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Tous les produits ({filteredWhitelist.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredWhitelist.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <Server className="w-5 h-5 text-blue-400" />
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
                        <p className="text-slate-500 text-sm">
                          Ajouté le {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-violet-300 border-violet-500/30">
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
      </div>
    </div>
  )
}
