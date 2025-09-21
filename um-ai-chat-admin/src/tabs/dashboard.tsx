import React, {useEffect, useState} from "react";
import DataGrid from "../components/DataGrid";
import { roomAPI,officeAPI,logsAPI,reportsAPI } from "../services/api";


export default function dashboard() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [logs, setLogs] = useState([]);
    const [offices, setOffices] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
       loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try{
  setLoading(true);
            const [rooms, logs, offices, reports] = await Promise.all([
                roomAPI.getAll(),
                logsAPI.getAll(),
                officeAPI.getAll(),
                reportsAPI.getAll()
            ]);
            console.log('Dashboard data loaded:', { rooms, logs, offices, reports });
            setRooms(rooms);
            setLogs(logs);
            setOffices(offices);
            setReports(reports);
        }catch(error){
            console.error('Error loading dashboard data:', error);
        }finally{
            setLoading(false);
        }
    };

    const roomColumns = [
        {field: 'id', headerName: 'ID'},
        {field: 'name', headerName: 'Room name'},
        {field: 'location', headerName: 'Location'},
    ];
    const officeColumns = [
        {field: 'id', headerName: 'ID'},
        {field: 'name', headerName: 'Office name'},
        {field: 'location', headerName: 'Location'},
    ];
    const logColumns = [
        {field: 'id', headerName: 'ID'},
        {field: 'admin_id', headerName: 'Admin id'},
        {field: 'action', headerName: 'Action'},
        {field: 'details', headerName: 'Details'},
        {field: 'created_at', headerName: 'Created at'},
    ];
    const reportColumns = [
        {field: 'id', headerName: 'ID'},
        {field: 'admin_id', headerName: 'Admin id'},
        {field: 'title', headerName: 'Title'},
        {field: 'content', headerName: 'content'},
        {field: 'created_at', headerName: 'Created at'},
    ];

  return <>
      <div className="bg-[#3C3C3C] w-[1250px] h-[800px] mt-[-50] pt-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
          <div className="flex justify-center justify-self-center text-[32px] font-bold bg-[#900C27] rounded-full w-[250px] h-[50px] ">
              <h1 className="">Dashboard</h1>
            </div>
          <div className="w-[1170px] h-[660px] mt-6 mx-10 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="w-[580px] h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg pt-4 overflow-y-auto">
    <h2 className="flex justify-center text-white text-xl font-bold mb-3">Rooms</h2>
    {loading ? (
      <div className="w-full flex justify-center items-center">
        <div className="text-white">Loading...</div>
      </div>
    ) : (
      <DataGrid 
        data={rooms} 
        columns={roomColumns}
        height="270px"
        className="text-white text-[14px] bg-[#292929]"
        showSearch={false}
        pageSize={5}
      />
    )}
</div>
              <div className="w-[580px] h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg pt-4 overflow-y-auto ">
                  <h2 className=" flex justify-center text-white text-xl font-bold mb-3">Logs</h2>
                  {loading ? (
                    <div className="flex justify-center items-center">
                      <div className="text-white">Loading...</div>
                    </div>
                  ) : (
                    <DataGrid 
                      data={logs} 
                      columns={logColumns}
                      height="250px"
                      className="text-white text-[14px] bg-[#292929]"
                      showSearch={false}
                      pageSize={5}
                    />
                  )}
              </div>
              <div className="w-[580px] h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg pt-4 overflow-y-auto">
                  <h2 className=" flex justify-center text-white text-xl font-bold mb-3">Offices</h2>
                  {loading ? (
                    <div className="flex justify-center items-center">
                      <div className="text-white">Loading...</div>
                    </div>
                  ) : (
                    <DataGrid 
                      data={offices} 
                      columns={officeColumns}
                      height="250px"
                      className="text-white text-[14px] bg-[#292929]"
                      showSearch={false}
                      pageSize={5}
                    />
                  )}
              </div>
              <div className="w-[580px] h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg pt-4 overflow-y-auto">
                  <h2 className=" flex justify-center text-white text-xl font-bold mb-3">Reports</h2>
                  {loading ? (
                    <div className="flex justify-center items-center">
                      <div className="text-white">Loading...</div>
                    </div>
                  ) : (
                    <DataGrid 
                      data={reports} 
                      columns={reportColumns}
                      height="250px"
                      className="text-white text-[14px] bg-[#292929]"
                      showSearch={false}
                      pageSize={5}
                    />
                  )}
              </div>
          </div>
      </div>
  </>;
}
