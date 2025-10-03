
import React, {useEffect, useState} from "react";
import DataGrid from "../components/DataGrid";
import {logsAPI} from "../services/api";

export default function logs (){
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        loadLogs()
    }, []);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const logs = await logsAPI.getAll();
            setLogs(logs);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const logColumns = [
        {field: 'username', headerName: 'Admin', width: 120},
        {field: 'action', headerName: 'Action', width: 150},
        {field: 'details', headerName: 'Details', width: 300},
        {field: 'created_at', headerName: 'Created At', width: 150},
    ];

    return (
        <>
            <div className=" flex flex-col 2xl:items-center bg-[#3C3C3C] mx-4 xl:mx-7 h-[800px] mt-[-50] pt-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
                <div className="flex justify-center justify-self-center text-xl xl:text-2xl 2xl:text-[32px] font-bold bg-[#900C27] rounded-full w-[180px] xl:w-[220px] 2xl:w-[250px] h-[42px] xl:h-[46px] 2xl:h-[50px] mx-auto ">
                    <h1 className="truncate">Logs</h1>
                </div>
                <div className="w-full max-w-[1170px] h-auto mt-6 xl:mx-10 px-4 flex flex-col">
                    <div className="w-full h-[655px] bg-[#3C3C3C] mt-3 border-white border-2 rounded-lg overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="text-white text-xl">Loading...</div>
                            </div>
                        ) : (
                            <DataGrid 
                                data={logs}
                                columns={logColumns}
                                height="655px"
                                className="text-white text-[14px] bg-[#292929]"
                                showSearch={false}
                                pageSize={14}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}