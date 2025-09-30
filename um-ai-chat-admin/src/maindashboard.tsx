import Sidebar from "./tabs/sidebar"
import {NavLink, Outlet} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import React from "react";

export default function MainDashboard() {
    const [active, setActive] = React.useState<string>("dashboard");
    return (
        <>
            <div className="bg-[#292929] min-h-screen text-white">
                <div className=" flex justify-between  text-[40px] font-bold px-10 py-5">
                    <h1 className="">ask<span className="text-[#900C27]">VC</span></h1>
                    <div className="flex gap-5 items-center">
                        <h2> User</h2>
                        <NavLink
                            to="/Login"
                            className={`text-[28px] font-extrabold w-auto text-left px-3 py-2 rounded-xl ${active === "logout" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                            onClick={() => setActive("logout")}>
                            <FontAwesomeIcon icon={faRightFromBracket} />
                        </NavLink>
                    </div>
                </div>
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    )
}