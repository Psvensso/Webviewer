import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const SignInForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setIsAuthenticated(!!response.data?.user);
      setError(response.error?.message || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (isAuthenticated) {
    return <div>Welcome! You are signed in.</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Sign In</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
};
