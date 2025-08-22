"use client"

export default function HeroContent() {
  return (
    <main className="absolute bottom-8 left-8 z-20 max-w-2xl">
      <div className="text-left">
        <div
          className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6 relative"
          style={{
            filter: "url(#glass-effect)",
          }}
        >
          <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
          <span className="text-white/90 text-sm font-light relative z-10">🔒 Roblox Script Protection</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-7xl md:leading-20 tracking-tight font-light text-white mb-6">
          <span className="font-medium italic instrument bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            Secure
          </span>{" "}
          Script
          <br />
          <span className="font-light tracking-tight text-white">Whitelist System</span>
        </h1>

        {/* Description */}
        <p className="text-sm font-light text-white/80 mb-8 leading-relaxed max-w-xl">
          Protégez vos scripts Roblox contre le leak avec notre système de whitelist avancé. Vérification automatique du
          PlaceId et du nom de produit pour une sécurité maximale.
          <br />
          <span className="text-white/60 text-xs mt-2 block">
            Interface moderne avec animations fluides et gestion intuitive des autorisations.
          </span>
        </p>

        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/70 text-xs">Système actif</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-white/70 text-xs">Protection avancée</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-white/70 text-xs">Interface moderne</span>
          </div>
        </div>

        {/* Enhanced stats section */}
        <div className="mt-8 flex items-center gap-8">
          <div className="text-left">
            <div className="text-2xl font-light text-white">99.9%</div>
            <div className="text-xs text-white/60">Uptime</div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-light text-white">&lt; 50ms</div>
            <div className="text-xs text-white/60">Response</div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-light text-white">24/7</div>
            <div className="text-xs text-white/60">Protection</div>
          </div>
        </div>
      </div>
    </main>
  )
}
