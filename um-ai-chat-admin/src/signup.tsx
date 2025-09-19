import { useNavigate } from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {IconProp} from "@fortawesome/fontawesome-svg-core";

export default function signup() {
    const navigate = useNavigate();

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
                            <h2 className="text-[40px] font-extrabold mt-10">Admin Signup</h2>
                            <div className="mt-12 w-full flex flex-col items-center">
                                <label className="text-[20px] font-extrabold w-[310px] text-left">Email</label>
                                <input
                                    className="w-[310px] h-[50px] mt-2 bg-[#292929] text-white px-3"
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                />
                                <label className="text-[20px] font-extrabold mt-8 w-[310px] text-left">Password</label>
                                <input
                                    className="w-[310px] h-[50px] mt-2 bg-[#292929] text-white px-3"
                                    type="password"
                                    autoComplete="current-password"
                                />
                                <button className="bg-[#900C27] text-white w-[310px] h-[40px] mt-8 font-extrabold hover:bg-[#661424] transition-colors"
                                        onClick={() => navigate("/dashboard") }>
                                    Sign up
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}