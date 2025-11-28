import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faBriefcase,
    faBuilding, faBuildingColumns, faEnvelope, faFile, faRightFromBracket,
    faScaleBalanced,
    faTableColumns,
    faUsers,
    faUserTie,
    faBullhorn
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import {NavLink} from "react-router-dom";


export default function Sidebar() {
    const [active, setActive] = React.useState<string>("dashboard");

    return (
        <>
            <div
                className='bg-[#3C3C3C] w-56 xl:w-64 2xl:w-[320px] h-[800px] px-4 xl:px-6 2xl:px-8 ml-4 xl:ml-8 2xl:ml-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]'>
              <div className='text-white pt-10'>
                  <NavLink
                      to="/dashboard"
                      className={`flex items-center text-lg xl:text-xl 2xl:text-[28px] font-extrabold w-full xl:w-[230px] 2xl:w-[250px] text-left px-3 py-2 rounded-xl ${active === "dashboard" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                      onClick={() => setActive("dashboard")}>
                      <FontAwesomeIcon icon={faTableColumns} />
                      <span className="ml-2 truncate">Dashboard</span>
                  </NavLink>

              </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Rules"
                        className={`flex items-center text-lg xl:text-xl 2xl:text-[28px] font-extrabold w-full xl:w-[230px] 2xl:w-[250px] text-left px-3 py-2 rounded-xl ${active === "rules" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("rules")}>
                        <FontAwesomeIcon icon={faScaleBalanced} />
                        <span className="ml-2 truncate">Info & Rules</span>
                    </NavLink>

                </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Rooms"
                        className={`flex items-center text-lg xl:text-xl 2xl:text-[28px] font-extrabold w-full xl:w-[230px] 2xl:w-[250px] text-left px-3 py-2 rounded-xl ${active === "rooms" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("rooms")}>
                        <FontAwesomeIcon icon={faBuilding} />
                        <span className="ml-2 truncate">Rooms</span>
                    </NavLink>

                </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Employee"
                        className={`flex items-center text-lg xl:text-xl 2xl:text-[28px] font-extrabold w-full xl:w-[230px] 2xl:w-[250px] text-left px-3 py-2 rounded-xl ${active === "employee" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("employee")}>
                        <FontAwesomeIcon icon={faUserTie} />
                        <span className="ml-2 truncate">Employees</span>
                    </NavLink>

                </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Buildings"
                        className={`flex items-center text-lg xl:text-xl 2xl:text-[28px] font-extrabold w-full xl:w-[230px] 2xl:w-[250px] text-left px-3 py-2 rounded-xl ${active === "buildings" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("buildings")}>
                        <FontAwesomeIcon icon={faBuildingColumns} />
                        <span className="ml-2 truncate">Buildings</span>
                    </NavLink>

                </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Offices"
                        className={`flex items-center text-lg xl:text-xl 2xl:text-[28px] font-extrabold w-full xl:w-[230px] 2xl:w-[250px] text-left px-3 py-2 rounded-xl ${active === "offices" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("offices")}>
                        <FontAwesomeIcon icon={faBriefcase} />
                        <span className="ml-2 truncate">Offices</span>
                    </NavLink>

                </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Departments"
                        className={`flex items-center text-lg xl:text-xl 2xl:text-[28px] font-extrabold w-full xl:w-[230px] 2xl:w-[250px] text-left px-3 py-2 rounded-xl ${active === "departments" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("departments")}>
                        <FontAwesomeIcon icon={faUsers} />
                        <span className="ml-2 truncate">Departments</span>
                    </NavLink>

                </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Reports"
                        className={`flex items-center text-lg xl:text-xl 2xl:text-[28px] font-extrabold w-full xl:w-[230px] 2xl:w-[250px] text-left px-3 py-2 rounded-xl ${active === "reports" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("reports")}>
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span className="ml-2 truncate">Reports</span>
                    </NavLink>

                </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Logs"
                        className={`flex items-center text-lg xl:text-xl 2xl:text-[28px] font-extrabold w-full xl:w-[230px] 2xl:w-[250px] text-left px-3 py-2 rounded-xl ${active === "logs" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("logs")}>
                        <FontAwesomeIcon icon={faFile} />
                        <span className="ml-2 truncate">Logs</span>
                    </NavLink>

                </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Announcement"
                        className={`flex items-center text-lg xl:text-xl 2xl:text-[28px] font-extrabold w-full xl:w-[230px] 2xl:w-[250px] text-left px-3 py-2 rounded-xl ${active === "announcement" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("announcement")}>
                        <FontAwesomeIcon icon={faBullhorn} />
                        <span className="ml-2 truncate">Announcement</span>
                    </NavLink>

                </div>
            </div>
        </>
    )
}