import { useState } from "react";
import Login from "./tabs/login";
import Dashboard from "./tabs/dashboard";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return isAuthenticated ? (
    <Dashboard />
  ) : (
    <Login onLogin={() => setIsAuthenticated(true)} />
  );
}
