import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://gwuqnldfuvrzctjvedbk.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3dXFubGRmdXZyemN0anZlZGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MTIzNDYsImV4cCI6MjA1MzQ4ODM0Nn0.wGhIY6o7ibfsnENNZcFC6RUGCwJYaFeMhHGcUyZlZlg"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

export async function initializeDatabase() {
  try {
    const { error } = await supabase.rpc("create_items_disponibles_if_not_exists")
    if (error) throw error
    console.log("Base de datos inicializada correctamente")
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
  }
}

