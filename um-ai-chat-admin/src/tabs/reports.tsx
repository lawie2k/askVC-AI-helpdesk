import React, {useEffect, useState} from "react";
import DataGrid from "../components/DataGrid";
import * as XLSX from "xlsx";
import {
  roomAPI,
  buildingAPI,
  departmentAPI,
  officeAPI,
  professorAPI,
  rulesAPI,
  logsAPI,
  campusInfoAPI,
  visionMissionAPI,
  announcementsAPI,
  nonTeachingAPI
} from "../services/api";

export default function Reports() {
    const [dataset, setDataset] = useState<string>("rooms");
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDataset(dataset);
    }, [dataset]);

    const loadDataset = async (kind: string) => {
        try {
            setLoading(true);
            let data: any[] = [];
            if (kind === 'rooms') data = await roomAPI.getAll();
            else if (kind === 'offices') data = await officeAPI.getAll();
            else if (kind === 'buildings') data = await buildingAPI.getAll();
            else if (kind === 'professors') data = await professorAPI.getAll();
            else if (kind === 'nonTeaching') data = await nonTeachingAPI.getAll();
            else if (kind === 'departments') data = await departmentAPI.getAll();
            else if (kind === 'rules') data = await rulesAPI.getAll();
            else if (kind === 'visionMission') data = await visionMissionAPI.getAll();
            else if (kind === 'campusInfo') data = await campusInfoAPI.getAll();
            else if (kind === 'announcements') data = await announcementsAPI.getAll();
            else if (kind === 'logs') data = await logsAPI.getAll();
            setRows(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading dataset:', error);
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = (rows: any[],columns: {field: string, headerName: string}[],fileBase:string) => {
const data=rows.map(r=>{
     const shaped: Record<string, any> = {};
     columns.forEach(c=>{
        shaped[c.headerName] = r[c.field];
     });
     return shaped;
});
const worksheet=XLSX.utils.json_to_sheet(data);
const workbook=XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook,worksheet,"Report");
const timestamp=new Date().toISOString().replace(/[:.]/g,'').slice(0,12);
XLSX.writeFile(workbook,`${fileBase}_${timestamp}.xlsx`);
}
    // (legacy reports CRUD removed)

    const columnsByDataset: Record<string, any[]> = {
        rooms: [
            { field: 'name', headerName: 'Room Name', width: 200 },
            { field: 'building_name', headerName: 'Building', width: 200 },
            { field: 'floor', headerName: 'Floor', width: 120 },
            { field: 'type', headerName: 'Type', width: 140 },
            { field: 'created_at', headerName: 'Created At', width: 180 },
        ],
        offices: [
            { field: 'name', headerName: 'Office Name', width: 220 },
            { field: 'building_name', headerName: 'Building', width: 220 },
            { field: 'floor', headerName: 'Floor', width: 100 },
            { field: 'open_time', headerName: 'Opens', width: 100 },
            { field: 'close_time', headerName: 'Closes', width: 100 },
            { field: 'lunch_start', headerName: 'Lunch Start', width: 110 },
            { field: 'lunch_end', headerName: 'Lunch End', width: 110 },
            { field: 'created_at', headerName: 'Created At', width: 180 },
        ],
        buildings: [
            { field: 'name', headerName: 'Building Name', width: 300 },
            { field: 'created_at', headerName: 'Created At', width: 180 },
        ],
        professors: [
            { field: 'name', headerName: 'Name', width: 200 },
            { field: 'position', headerName: 'Position', width: 160 },
            { field: 'email', headerName: 'Email', width: 200 },
            { field: 'department', headerName: 'Department', width: 140 },
            { field: 'program', headerName: 'Program', width: 140 },
            { field: 'created_at', headerName: 'Created At', width: 160 },
        ],
        nonTeaching: [
            { field: 'name', headerName: 'Name', width: 220 },
            { field: 'role', headerName: 'Role', width: 180 },
            { field: 'created_at', headerName: 'Created At', width: 180 },
        ],
        departments: [
            { field: 'name', headerName: 'Department', width: 260 },
            { field: 'short_name', headerName: 'Short Name', width: 140 },
            { field: 'created_at', headerName: 'Created At', width: 180 },
        ],
        rules: [
            { field: 'description', headerName: 'Description', width: 600 },
            { field: 'created_at', headerName: 'Created At', width: 180 },
        ],
        visionMission: [
            { field: 'description', headerName: 'Vision / Mission', width: 600 },
            { field: 'created_at', headerName: 'Created At', width: 180 },
        ],
        campusInfo: [
            { field: 'description', headerName: 'Campus Info', width: 600 },
            { field: 'created_at', headerName: 'Created At', width: 180 },
        ],
        announcements: [
            { field: 'title', headerName: 'Title', width: 260 },
            { field: 'description', headerName: 'Description', width: 520 },
            { field: 'created_at', headerName: 'Created At', width: 180 },
        ],
        logs: [
            { field: 'action', headerName: 'Action', width: 200 },
            { field: 'details', headerName: 'Details', width: 520 },
            { field: 'created_at', headerName: 'Timestamp', width: 220 },
        ],
    };

    const activeColumns = columnsByDataset[dataset] || [];

  return (
    <>
        <div className=" flex flex-col 2xl:items-center bg-[#3C3C3C] mx-4 xl:mx-7 h-[800px] mt-[-50] pt-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
            <div className="flex justify-center justify-self-center text-xl xl:text-2xl 2xl:text-[32px] font-bold w-[180px] xl:w-[220px] 2xl:w-[250px] h-[42px] xl:h-[46px] 2xl:h-[50px] mx-auto ">
                <h1 className="truncate">Reports</h1>
            </div>
            <div className="w-full max-w-[1170px] h-auto mt-6 xl:mx-10 px-4">
                <div className="bg-[#292929] border border-white rounded-2xl p-4 flex flex-col h-[615px]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-5 items-center ">
                            <label className="text-white">Dataset</label>
                            <select
                                className="px-3 py-2 rounded bg-white text-black border border-gray-500"
                                value={dataset}
                                onChange={(e) => setDataset(e.target.value)}
                            >
                                <option value="rooms">Rooms</option>
                                <option value="offices">Offices</option>
                                <option value="buildings">Buildings</option>
                                <option value="professors">Professors</option>
                                <option value="nonTeaching">Non-Teaching Employees</option>
                                <option value="departments">Departments</option>
                                <option value="rules">Rules</option>
                                <option value="visionMission">Vision & Mission</option>
                                <option value="campusInfo">Campus Info</option>
                                <option value="announcements">Announcements</option>
                                <option value="logs">Logs</option>
                            </select>
                        </div>
                        <button
                            className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => exportToExcel(rows, activeColumns, dataset)}
                        >
                            Export to Excel
                        </button>
                    </div>
                    <div className="flex-1 bg-[#3C3C3C] border border-white/10 rounded-xl overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="text-white text-xl">Loading...</div>
                            </div>
                        ) : (
                            <DataGrid 
                                data={rows}
                                columns={activeColumns}
                                height="520px"
                                className="text-white text-[14px] bg-[#292929]"
                                showSearch={false}
                                pageSize={18}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}
