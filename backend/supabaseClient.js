import { createClient } from "@supabase/supabase-js";

const supabaseURL = "https://qwnvawfjlnguyzzwksme.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3bnZhd2ZqbG5ndXl6endrc21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTc2MDYsImV4cCI6MjA3Mzc5MzYwNn0.xDnc-bi_I75ZUgEd-gtQoSYQrJNuVw-WwWcKjF3APEk";

export const supabase = createClient(supabaseURL, supabaseAnonKey);
