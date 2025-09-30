import React, {useEffect, useState} from "react";
import DataGrid from "../components/DataGrid";
import { roomAPI, officeAPI, logsAPI, rulesAPI } from "../services/api";


export default function Dashboard() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [logs, setLogs] = useState([]);
    const [offices, setOffices] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
       loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try{
            setLoading(true);
            setError(null);
            const [rooms, logs, offices, rules] = await Promise.all([
                roomAPI.getAll(),
                logsAPI.getAll(),
                officeAPI.getAll(),
                rulesAPI.getAll()
            ]);
            console.log('Dashboard data loaded:', { rooms, logs, offices, rules });
            setRooms(rooms);
            setLogs(logs);
            setOffices(offices);
            setRules(rules);
        }catch(error){
            console.error('Error loading dashboard data:', error);
            setError('Failed to load dashboard data. Please check your connection and try again.');
        }finally{
            setLoading(false);
        }
    };

    const roomColumns = [
        { field: 'name', headerName: 'Room Name' },
        { field: 'building_name', headerName: 'Building' },
        { field: 'floor', headerName: 'Floor' },
        { field: 'type', headerName: 'Type' },
        {field: 'status', headerName: 'Status', width: 180, cellRenderer: (params: any) => (
                <div
                    className={
                        `px-3 py-1 w-[90px] text-center rounded font-semibold ` +
                        (params.value === 'Occupied'
                            ? 'bg-red-600 hover:bg-red-700'
                            : params.value === 'Reserved'
                                ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                                : 'bg-green-600 hover:bg-green-700')
                    }
                >
                    {params.value || 'Vacant'}
                </div>
            )},
    ];
    const officeColumns = [
        { field: 'name', headerName: 'Office Name' },
        { field: 'building_name', headerName: 'Building' },
        { field: 'floor', headerName: 'Floor' },
    ];
    const logColumns = [
        {field: 'username', headerName: 'Admin'},
        {field: 'action', headerName: 'Action'},
        {field: 'details', headerName: 'Details'},
        {field: 'created_at', headerName: 'Created at'},
    ];
    const ruleColumns = [
        { field: 'description', headerName: 'Description' },
    ];

  return <>
      <div className="bg-[#3C3C3C] w-[1250px] h-[800px] mt-[-50] pt-10 overflow-hidden  shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
          <div className="flex justify-center justify-self-center text-[32px] font-bold bg-[#900C27] rounded-full w-[250px] h-[50px]">
              <h1 className="">Dashboard</h1>
            </div>
          {error && (
            <div className="w-[1170px] mx-10 mt-4 p-4 bg-red-600 text-white rounded-lg flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={loadDashboardData}
                className="bg-white text-red-600 px-4 py-2 rounded hover:bg-gray-100"
              >
                Retry
              </button>
            </div>
          )}
          <div className="w-[1170px] h-[660px] mt-6 mx-10 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="w-[580px] h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg overflow-y-auto">
    {loading ? (
      <div className="w-full flex justify-center items-center">
        <div className="text-white">Loading...</div>
      </div>
    ) : (
      <DataGrid 
        data={rooms} 
        columns={roomColumns}
        height="325px"
        className="text-white text-[14px] bg-[#292929]"
        showSearch={false}
        pageSize={8}
      />
    )}
</div>
              <div className="w-[580px] h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg overflow-y-auto ">
                  {loading ? (
                    <div className="flex justify-center items-center">
                      <div className="text-white">Loading...</div>
                    </div>
                  ) : (
                    <DataGrid 
                      data={logs} 
                      columns={logColumns}
                      height="325px"
                      className="text-white text-[14px] bg-[#292929]"
                      showSearch={false}
                      pageSize={2}
                    />
                  )}
              </div>
              <div className="w-[580px] h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg overflow-y-auto">

                  {loading ? (
                    <div className="flex justify-center items-center">
                      <div className="text-white">Loading...</div>
                    </div>
                  ) : (
                    <DataGrid 
                      data={offices} 
                      columns={officeColumns}
                      height="325px"
                      className="text-white text-[14px] bg-[#292929]"
                      showSearch={false}
                      pageSize={8}
                    />
                  )}
              </div>
              <div className="w-[580px] h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center">
                      <div className="text-white">Loading...</div>
                    </div>
                  ) : (
                    <DataGrid 
                      data={rules} 
                      columns={ruleColumns}
                      height="325px"
                      className="text-white text-[14px] bg-[#292929]"
                      showSearch={false}
                      pageSize={6}
                    />
                  )}
              </div>
          </div>
      </div>
  </>;
}
