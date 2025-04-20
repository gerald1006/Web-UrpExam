import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://klxnawelvudmfwzavakb.supabase.co"; // Reemplaza con tu URL de Supabase
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtseG5hd2VsdnVkbWZ3emF2YWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwOTg1OTYsImV4cCI6MjA2MDY3NDU5Nn0.RiHeEjVHrnqCHkJnNnGnqd7M9x_uZDKoqIeVzOkm7BM"; // Reemplaza con tu clave pública

export const supabase = createClient(supabaseUrl, supabaseKey);