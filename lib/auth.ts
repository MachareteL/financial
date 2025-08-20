import { supabase } from "./supabase"

export async function signUp(email: string, password: string, name: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) throw authError

  if (authData.user) {
    // Criar perfil SEM família inicialmente
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email,
      name,
      family_id: null, // Sem família inicialmente
    })

    if (profileError) throw profileError
  }

  return authData
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  // 1️⃣ Busca o perfil do usuário
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    console.error("Error fetching profile:", profileError)
    return null
  }

  // 2️⃣ Se não existe perfil, cria um automaticamente
  if (!profile) {
    console.log("Profile not found, creating one...")

    const { data: newProfile, error: newProfileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email || "",
        name: user.email?.split("@")[0] || "Usuário",
        family_id: null, // Sem família inicialmente
      })
      .select()
      .single()

    if (newProfileError) {
      console.error("Error creating profile:", newProfileError)
      return null
    }

    return {
      ...newProfile,
      family: null,
    }
  }

  // 3️⃣ Busca a família se o perfil já existe e tem family_id
  let family: { id: string; name: string } | null = null
  if (profile.family_id) {
    const { data: familyData, error: familyError } = await supabase
      .from("families")
      .select("*")
      .eq("id", profile.family_id)
      .maybeSingle()

    if (familyError) {
      console.error("Error fetching family:", familyError)
    } else {
      family = familyData || null
    }
  }

  return {
    ...profile,
    family,
  }
}

// Nova função para criar família
export async function createFamily(familyName: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Usuário não autenticado")

  // Verificar se usuário já tem família
  const profile = await getUserProfile()
  if (profile?.family_id) {
    throw new Error("Você já faz parte de uma família")
  }

  // Criar família
  const familyId = crypto.randomUUID()
  const { error: familyError } = await supabase.from("families").insert({ id: familyId, name: familyName })

  if (familyError) throw familyError

  // Atualizar perfil com family_id
  const { error: profileError } = await supabase.from("profiles").update({ family_id: familyId }).eq("id", user.id)

  if (profileError) throw profileError

  // Criar categorias padrão
  const defaultCategories = [
    { name: "Moradia", classification: "necessidades" },
    { name: "Transporte", classification: "necessidades" },
    { name: "Alimentação", classification: "necessidades" },
    { name: "Lazer", classification: "desejos" },
    { name: "Saúde", classification: "necessidades" },
    { name: "Investimentos", classification: "poupanca" },
    { name: "Outros", classification: "necessidades" },
  ]

  const categoriesToInsert = defaultCategories.map((cat) => ({
    ...cat,
    family_id: familyId,
  }))

  const { error: categoriesError } = await supabase.from("categories").insert(categoriesToInsert)

  if (categoriesError) {
    console.error("Error creating default categories:", categoriesError)
  }

  return { familyId, familyName }
}

// Hook para monitorar mudanças de autenticação
export function useAuthStateChange(callback: (user: any) => void) {
  supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
}
