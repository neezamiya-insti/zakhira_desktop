import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL ya Key nahi mil rahi. Check karo .env file mein.")
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// ==== NAYA FUNCTION (Business ID nikalne ke liye) ====
export const getCurrentBusinessId = async (): Promise<string> => {
  // 1. localStorage se logged-in user uthao
  const userStr = localStorage.getItem('zakhira_user');
  if (!userStr) throw new Error("User not logged in");
  
  const user = JSON.parse(userStr);

  // 2. Us user ki id se businesses table mein check karo
  const { data, error } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (error) {
    console.error("Business fetch error:", error);
    throw error;
  }
  return data.id;
};