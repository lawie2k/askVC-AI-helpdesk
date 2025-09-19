import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faBriefcase,
    faBuilding, faEnvelope, faFile, faRightFromBracket,
    faScaleBalanced,
    faTableColumns,
    faUsers,
    faUserTie
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import {NavLink} from "react-router-dom";


export default function Sidebar() {
    const [active, setActive] = React.useState<string>("dashboard");

    return (
        <>
            <div
                className='bg-[#3C3C3C] w-[320px] h-[800px] px-8 ml-10 mr-5 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]'>
              <div className='text-white pt-10'>
                  <NavLink
                      to="/dashboard"
                      className={` text-[28px] font-extrabold w-[250px] text-left px-3 py-2 rounded-xl ${active === "dashboard" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                      onClick={() => setActive("dashboard")}>
                      <FontAwesomeIcon icon={faTableColumns} />
                      <span className="ml-2">Dashboard</span>
                  </NavLink>

              </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Rules"
                        className={`text-[28px] font-extrabold w-[250px] text-left px-3 py-2 rounded-xl ${active === "rules" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("rules")}>
                        <FontAwesomeIcon icon={faScaleBalanced} />
                        <span className="ml-2">Rules</span>
                    </NavLink>

                </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Professor"
                        className={`text-[28px] font-extrabold w-[250px] text-left px-3 py-2 rounded-xl ${active === "professor" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("professor")}>
                        <FontAwesomeIcon icon={faUserTie} />
                        <span className="ml-2">Professor</span>
                    </NavLink>

                </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Rooms"
                        className={`text-[28px] font-extrabold w-[250px] text-left px-3 py-2 rounded-xl ${active === "rooms" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("rooms")}>
                        <FontAwesomeIcon icon={faBuilding} />
                        <span className="ml-2">Rooms</span>
                    </NavLink>

                </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Offices"
                        className={`text-[28px] font-extrabold w-[250px] text-left px-3 py-2 rounded-xl ${active === "offices" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("offices")}>
                        <FontAwesomeIcon icon={faBriefcase} />
                        <span className="ml-2">Offices</span>
                    </NavLink>

                </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Departments"
                        className={`text-[28px] font-extrabold w-[250px] text-left px-3 py-2 rounded-xl ${active === "departments" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("departments")}>
                        <FontAwesomeIcon icon={faUsers} />
                        <span className="ml-2">Departments</span>
                    </NavLink>

                </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Reports"
                        className={`text-[28px] font-extrabold w-[250px] text-left px-3 py-2 rounded-xl ${active === "reports" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("reports")}>
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span className="ml-2">Reports</span>
                    </NavLink>

                </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Logs"
                        className={`text-[28px] font-extrabold w-[250px] text-left px-3 py-2 rounded-xl ${active === "logs" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("logs")}>
                        <FontAwesomeIcon icon={faFile} />
                        <span className="ml-2">Logs</span>
                    </NavLink>

                </div>
                <div className="text-white pt-5">
                    <NavLink
                        to="/Login"
                        className={`text-[28px] font-extrabold w-[250px] text-left px-3 py-2 rounded-xl ${active === "logout" ? "bg-[#900C27]" : "hover:bg-[#4a4a4a]"}`}
                        onClick={() => setActive("logout")}>
                        <FontAwesomeIcon icon={faRightFromBracket} />
                        <span className="ml-2">Logout</span>
                    </NavLink>

                </div>
            </div>
        </>
    )
}