import Sidebar from "./tabs/sidebar"
import { Outlet } from "react-router-dom";

export default function MainDashboard() {
    return (
        <>
            <div className="bg-[#292929] min-h-screen text-white">
                <div className="text-white text-[40px] font-bold px-10 py-5">
                    <h1 className="">ask<span className="text-[#900C27]">VC</span></h1>
                </div>
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1 px-6 py-4">
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    )
}