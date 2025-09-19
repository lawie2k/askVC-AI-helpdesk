import React from "react";


export default function dashboard() {
  return <>
      <div className="bg-[#3C3C3C] w-[1250px] h-[800px] mt-[-50] pt-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
          <div className="flex justify-center justify-self-center text-[32px] font-bold bg-[#900C27] rounded-full w-[250px] h-[50px] ">
              <h1 className="">Dashboard</h1>
          </div>
          <div className="w-[1170px] h-[660px] mt-6 mx-10 grid grid-cols-2 gap-2 ">
              <div className="w-[580px] h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg flex justify-center py-2 ">
                  <h2 className="text-white text-xl font-bold">Rooms</h2>
                  <div className="overflow-y-auto"></div>
              </div>
              <div className="w-[580px] h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg flex justify-center py-2 ">
                  <h2 className="text-white text-xl font-bold">Logs</h2>
                  <div className="overflow-y-auto"></div>
              </div>
              <div className="w-[580px] h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg flex justify-center py-2 ">
                  <h2 className="text-white text-xl font-bold">Offices</h2>
                  <div className="overflow-y-auto"></div>
              </div>
              <div className="w-[580px] h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg flex justify-center py-2  ">
                  <h2 className="text-white text-xl font-bold">Reports</h2>
                  <div className="overflow-y-auto"></div>
              </div>
          </div>
      </div>
  </>;
}
