import { useNavigate } from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {adminAuthAPI} from "./services/api";
import {FormEvent, useState} from "react";

export default function signup() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSignUp= async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try{
            if (!username || username.trim().length === 0) {
                throw new Error("Username is required");
            }
            const response = await adminAuthAPI.register(username, password);
            setSuccess("Admin account created successfully! Redirecting to login...");

            setTimeout(() =>{
                navigate("/login");
            },2000)
        }catch(error: any){
            setError(error.message || "Registration failed");
            console.error("Signup error:", error);
        }finally{
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-[#292929] text-white">
                <header className="px-12 py-3">
                    <h1 className="text-[40px] font-extrabold">
                        askVC <span className="text-[#900C27]">AI</span>
                    </h1>
                </header>
                <main className="flex justify-center items-center py-16">
                    <div className="bg-[#3C3C3C] w-[550px] min-h-[650px]">
                       <div className="items-start">
                           <button onClick={()=>navigate("/login")}>
                           <FontAwesomeIcon
                               icon={faArrowLeft as IconProp}
                               className="text-[24px] text-[#900C27] ml-5 mt-10"
                           />
                       </button>
                       </div>
                        <div className="flex flex-col items-center">
                            <h2 className="text-[40px] font-extrabold mt-10">Register</h2>
                            <form onSubmit={handleSignUp} className="mt-12 w-full flex flex-col items-center">
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
                                {success && (
                                    <div className="text-green-500 mt-4 text-center w-[310px]">
                                        {success}
                                    </div>
                                )}
                                <button 
                                    className="bg-[#900C27] text-white w-[310px] h-[40px] mt-8 font-extrabold hover:bg-[#661424] transition-colors disabled:opacity-50"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Creating Account..." : "Sign up"}
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}