import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { adminAuthAPI } from "./services/api";
import { useMobileDetection } from "./utils/mobileDetection";
import MobileRestriction from "./components/MobileRestriction";

export default function login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const isMobile = useMobileDetection();

    const isValidUmEmail = (email: string) => /^[A-Za-z0-9._%+-]+@umindanao\.edu\.ph$/i.test(email);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            if (!isValidUmEmail(username)) {
                throw new Error("Please use a valid UMindanao email (@umindanao.edu.ph)");
            }
            const response = await adminAuthAPI.login(username, password);
            // Accept common response shapes
            const token = response?.token || response?.data?.token || response?.result?.token;
            if (!token) {
                const msg = response?.error || response?.message || "Invalid credentials";
                throw new Error(msg);
            }
            localStorage.setItem('adminToken', token);

            const resolvedUsername = response?.user?.username || response?.admin?.username || username;
            if (resolvedUsername) {
                localStorage.setItem('adminUsername', resolvedUsername);
            }
            if (response?.admin) {
                localStorage.setItem('adminUser', JSON.stringify(response.admin));
            }
            navigate("/dashboard", { replace: true });
        } catch (error: any) {
            setError(error.message || "Login failed");
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Show mobile restriction if accessed on mobile device
    if (isMobile) {
        return <MobileRestriction />;
    }

    return (
      <div className="min-h-screen bg-[#292929] text-white">
        <header className="px-12 py-3">
          <h1 className="text-[40px] font-extrabold">
            askVC <span className="text-[#900C27]">AI</span>
          </h1>
        </header>
        <main className="flex justify-center items-center py-16">
          <div className="bg-[#3C3C3C] w-[550px] min-h-[650px] flex flex-col items-center">
            <h2 className="text-[40px] font-extrabold mt-10">Admin</h2>
            <form onSubmit={handleLogin} className="mt-12 w-full flex flex-col items-center">
              <label className="text-[20px] font-extrabold w-[310px] text-left">UMindanao Email</label>
              <input
                className="w-[310px] h-[50px] mt-2 bg-[#292929] text-white px-3"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <label className="text-[20px] font-extrabold mt-8 w-[310px] text-left">Password</label>
              <div className="relative w-[310px]">
                <input
                  className="w-[310px] h-[50px] mt-2 bg-[#292929] text-white px-3 pr-10"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-300 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {error && (
                <div className="text-red-500 mt-4 text-center w-[310px]">
                  {error}
                </div>
              )}
              <button 
                className="bg-[#900C27] text-white w-[310px] h-[40px] mt-8 font-extrabold hover:bg-[#661424] transition-colors disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
                <h2 className="mt-24 font-bold">add new <button className="text-[#900C27]"
                    onClick={()=>navigate("/signup")}>Admin</button>
                </h2>
          </div>
        </main>
      </div>
    )
  }
  