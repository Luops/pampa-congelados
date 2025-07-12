import { supabase } from "./supabaseClient";

export async function isAdmin(token: string) {
  if (!token) return { authorized: false, reason: "Token ausente" };

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { authorized: false, reason: "Usuário não autenticado" };
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    return { authorized: false, reason: "Usuário não encontrado" };
  }

  if (userData.role !== Number(process.env.ADMIN_ROLE)) {
    return { authorized: false, reason: "Acesso negado: não é admin" };
  }

  return { authorized: true, user };
}
