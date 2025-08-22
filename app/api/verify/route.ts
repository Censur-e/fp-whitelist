import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { placeId, productName } = await request.json()

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("whitelist")
      .select("*")
      .eq("place_id", placeId)
      .eq("product_name", productName)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Database error:", error)
      return NextResponse.json({ authorized: false, message: "Erreur serveur" }, { status: 500 })
    }

    const isAuthorized = !!data

    return NextResponse.json({
      authorized: isAuthorized,
      message: isAuthorized ? "Accès autorisé" : "PlaceId ou nom de produit non autorisé",
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ authorized: false, message: "Erreur serveur" }, { status: 500 })
  }
}
