import { useNavigate } from "react-router-dom";

export default function login() {
    const navigate = useNavigate();

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
            <div className="mt-12 w-full flex flex-col items-center">
              <label className="text-[20px] font-extrabold w-[310px] text-left">Email</label>
              <input
                className="w-[310px] h-[50px] mt-2 bg-[#292929] text-white px-3"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="false"
              />
              <label className="text-[20px] font-extrabold mt-8 w-[310px] text-left">Password</label>
              <input
                className="w-[310px] h-[50px] mt-2 bg-[#292929] text-white px-3"
                type="password"
                autoComplete="current-password"
              />
              <button className="bg-[#900C27] text-white w-[310px] h-[40px] mt-8 font-extrabold hover:bg-[#661424] transition-colors"
              onClick={() => navigate("/dashboard") }>
                Login
              </button>
                <h2 className="mt-24 font-bold">add new <button className="text-[#900C27]"
                    onClick={()=>navigate("/signup")}>Admin</button>
                </h2>
            </div>
          </div>
        </main>
      </div>
    )
  }
  