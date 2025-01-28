const { data: _, error: supabaseError } = await supabase
  .from("escenarios")
  .insert([{ ...formData, estado: "pendiente" }])
  .select()

} catch (error: unknown)
{
  // The issue was here, the colon should be outside the parenthesis
  if (error instanceof Error) {
    console.error("Error al crear escenario:", error.message)
    setError(error.message || "Ha ocurrido un error al crear el escenario")
  } else {
    console.error("Error desconocido:", error)
    setError("Ha ocurrido un error desconocido al crear el escenario")
  }
}

