import React, {useEffect, useState} from "react";
import DataGrid from "../components/DataGrid";
import * as XLSX from "xlsx";
import {buildingAPI, departmentAPI, officeAPI, professorAPI, roomAPI, rulesAPI, logsAPI} from "../services/api";

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
            else if (kind === 'departments') data = await departmentAPI.getAll();
            else if (kind === 'rules') data = await rulesAPI.getAll();
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
            { field: 'type', headerName: 'Type', width: 120 },
            { field: 'status', headerName: 'Status', width: 140 },
            { field: 'created_at', headerName: 'Created At', width: 180 },
        ],
        offices: [
            { field: 'name', headerName: 'Office Name', width: 220 },
            { field: 'building_name', headerName: 'Building', width: 220 },
            { field: 'floor', headerName: 'Floor', width: 120 },
            { field: 'created_at', headerName: 'Created At', width: 180 },
        ],
        buildings: [
            { field: 'name', headerName: 'Building Name', width: 300 },
            { field: 'created_at', headerName: 'Created At', width: 180 },
        ],
        professors: [
            { field: 'name', headerName: 'Name', width: 220 },
            { field: 'position', headerName: 'Position', width: 180 },
            { field: 'email', headerName: 'Email', width: 240 },
            { field: 'department', headerName: 'Department', width: 150 },
            { field: 'program', headerName: 'Program', width: 150 },
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
        logs: [
            { field: 'username', headerName: 'Admin', width: 160 },
            { field: 'action', headerName: 'Action', width: 160 },
            { field: 'details', headerName: 'Details', width: 480 },
            { field: 'created_at', headerName: 'Timestamp', width: 200 },
        ],
    };

    const activeColumns = columnsByDataset[dataset] || [];

  return (
    <>
        <div className=" flex flex-col 2xl:items-center bg-[#3C3C3C] mx-4 xl:mx-7 h-[800px] mt-[-50] pt-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
            <div className="flex justify-center justify-self-center text-xl xl:text-2xl 2xl:text-[32px] font-bold w-[180px] xl:w-[220px] 2xl:w-[250px] h-[42px] xl:h-[46px] 2xl:h-[50px] mx-auto ">
                <h1 className="truncate">Reports</h1>
            </div>
            <div className="w-full max-w-[1170px] h-auto mt-6 xl:mx-10 px-4 flex flex-col">
                <div className="flex items-center justify-between">
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
                            <option value="departments">Departments</option>
                            <option value="rules">Rules</option>
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
                <div className="w-full h-[615px] bg-[#3C3C3C] mt-3 border-white border-2 rounded-lg overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="text-white text-xl">Loading...</div>
                        </div>
                    ) : (
                        <DataGrid 
                            data={rows}
                            columns={activeColumns}
                            height="615px"
                            className="text-white text-[14px] bg-[#292929]"
                            showSearch={false}
                            pageSize={11}
                        />
                    )}
                </div>
            </div>
        </div>
    </>
  )
}
