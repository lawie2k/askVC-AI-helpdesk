import Sidebar from "./tabs/sidebar"
import {NavLink, Outlet, useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useMobileDetection } from "./utils/mobileDetection";
import MobileRestriction from "./components/MobileRestriction";

export default function MainDashboard() {
    const [active, setActive] = React.useState<string>("dashboard");

    const isMobile = useMobileDetection();
    const navigate = useNavigate();

    React.useEffect(() => {

        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/login", { replace: true });
        }
    }, [navigate]);

    function handleLogout() {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUsername");
        localStorage.removeItem("adminUser");
        navigate("/login", { replace: true });
    }


    if (isMobile) {
        return <MobileRestriction />;
    }

    return (
        <>
            <div className="bg-[#292929] min-h-screen text-white">
                <div className=" flex justify-between  text-[40px] font-bold px-10 py-5">
                    <div className="flex w-[850px] 2xl:w-[850px] items-center justify-between">
                        <h1 className="">ask<span className="text-[#900C27]">VC</span></h1>

                    </div>
                    <div className="flex gap-5 items-center">
                        <button
                            className={`text-[28px] font-extrabold w-auto text-left px-3 py-2 rounded-xl hover:bg-[#4a4a4a]`}
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} />
                        </button>
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