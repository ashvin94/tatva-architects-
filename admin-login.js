const loginForm = document.getElementById("login-form");
const authStatus = document.getElementById("auth-status");

const supabaseUrl = window.SUPABASE_URL;
const supabaseAnonKey = window.SUPABASE_ANON_KEY;
const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
    : null;

const redirectIfAuthed = async () => {
  if (!supabaseClient) return;
  const { data } = await supabaseClient.auth.getSession();
  if (data?.session) window.location.href = "admin-projects.html";
};

redirectIfAuthed();

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;
  try {
    if (!supabaseClient) {
      authStatus.textContent =
        "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in supabase-config.js";
      return;
    }
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    window.location.href = "admin-projects.html";
  } catch (error) {
    const message = error?.message || "";
    authStatus.textContent = message ? `Login failed: ${message}` : "Login failed.";
  }
});
