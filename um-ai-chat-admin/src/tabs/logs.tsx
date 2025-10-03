
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
            <div className="bg-[#3C3C3C] w-[1250px] h-[800px] mt-[-50] pt-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
                <div className="flex justify-center justify-self-center text-[32px] font-bold bg-[#900C27] rounded-full w-[250px] h-[50px] ">
                    <h1 className="">Logs</h1>
                </div>
                <div className="w-[1170px] h-auto mt-6 mx-10 flex flex-col">
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