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

    // Forgot password states
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showResetForm, setShowResetForm] = useState(false);
    const [forgotSuccess, setForgotSuccess] = useState("");

    const isMobile = useMobileDetection();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (!username || username.trim().length === 0) {
                throw new Error("Username is required");
            }
            const response = await adminAuthAPI.login(username, password);

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
            const message = error?.message || "Login failed";
            if (message.includes("401")) {
                setError("Wrong username or password");
            } else {
                setError(message);
            }
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setForgotSuccess("");

        try {
            if (!username || username.trim().length === 0) {
                throw new Error("Username is required");
            }

            await adminAuthAPI.forgotPassword(username);
            setForgotSuccess("Reset code generated! Check the server logs for your reset code.");
            setShowResetForm(true);

        } catch (error: any) {
            setError(error.message || "Failed to request password reset");
            console.error("Forgot password error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setForgotSuccess("");

        try {
            if (!username || !resetCode || !newPassword) {
                throw new Error("All fields are required");
            }

            if (newPassword.length < 8) {
                throw new Error("New password must be at least 8 characters long");
            }

            await adminAuthAPI.resetPassword(username, resetCode, newPassword);
            setForgotSuccess("Password reset successful! You can now login with your new password.");

            // Reset form after 3 seconds
            setTimeout(() => {
                setShowForgotPassword(false);
                setShowResetForm(false);
                setResetCode("");
                setNewPassword("");
                setForgotSuccess("");
            }, 3000);

        } catch (error: any) {
            setError(error.message || "Failed to reset password");
            console.error("Reset password error:", error);
        } finally {
            setLoading(false);
        }
    };


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
              <label className="text-[20px] font-extrabold w-[310px] text-left">Username</label>
              <input
                className="w-[310px] h-[50px] mt-2 bg-[#292929] text-white px-3"
                type="text"
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

              {!showForgotPassword && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-gray-400 hover:text-white mt-4 text-sm underline"
                >
                  Forgot Password?
                </button>
              )}
            </form>

            {showForgotPassword && (
              <div className="mt-8 w-full flex flex-col items-center">
                <h3 className="text-[24px] font-extrabold mb-4">
                  {showResetForm ? "Reset Password" : "Forgot Password"}
                </h3>

                <form
                  onSubmit={showResetForm ? handleResetPassword : handleForgotPassword}
                  className="w-full flex flex-col items-center"
                >
                  <label className="text-[16px] font-bold w-[310px] text-left">Username</label>
                  <input
                    className="w-[310px] h-[40px] mt-2 bg-[#292929] text-white px-3"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />

                  {showResetForm && (
                    <>
                      <label className="text-[16px] font-bold mt-4 w-[310px] text-left">Reset Code</label>
                      <input
                        className="w-[310px] h-[40px] mt-2 bg-[#292929] text-white px-3"
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="Check server logs for code"
                        required
                      />

                      <label className="text-[16px] font-bold mt-4 w-[310px] text-left">New Password</label>
                      <input
                        className="w-[310px] h-[40px] mt-2 bg-[#292929] text-white px-3"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </>
                  )}

                  {error && (
                    <div className="text-red-500 mt-4 text-center w-[310px]">
                      {error}
                    </div>
                  )}

                  {forgotSuccess && (
                    <div className="text-green-500 mt-4 text-center w-[310px]">
                      {forgotSuccess}
                    </div>
                  )}

                  <button
                    className="bg-[#900C27] text-white w-[310px] h-[40px] mt-4 font-extrabold hover:bg-[#661424] transition-colors disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : (showResetForm ? "Reset Password" : "Request Reset Code")}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setShowResetForm(false);
                      setResetCode("");
                      setNewPassword("");
                      setError("");
                      setForgotSuccess("");
                    }}
                    className="text-gray-400 hover:text-white mt-2 text-sm underline"
                  >
                    Back to Login
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }
  