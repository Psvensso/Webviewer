import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import { SignInForm } from "./components/SignInForm.tsx";
import "./index.css";
import { supabase } from "./lib/supabaseClient.ts";

function AppApp() {
  const [authenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session?.user);
    });
  }, []);
  if (!authenticated) {
    return <SignInForm></SignInForm>;
  }

  return <App />;
}
ReactDOM.createRoot(document.getElementById("root")!).render(<AppApp />);
