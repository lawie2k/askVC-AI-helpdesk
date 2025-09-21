import React, {useEffect, useState} from "react";
import DataGrid from "../components/DataGrid";
import {roomAPI} from "../services/api";

export default function Rooms() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newRoom, setNewRoom] = useState({
        name: "",
        location: ""
    });
    const [editingRoom, setEditingRoom] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        location: ""
    });

    useEffect(() => {
        loadRooms()
    }, []);

    const loadRooms = async () => {
        try {
            setLoading(true);
            const rooms = await roomAPI.getAll();
            setRooms(rooms);
        } catch (error) {
            console.error('Error loading rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const roomColumns = [
        {field: 'id', headerName: 'ID', width: 60},
        {field: 'name', headerName: 'Room Name', width: 200},
        {field: 'location', headerName: 'Location', width: 200},
        {field: 'admin_id', headerName: 'Admin ID', width: 100},
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            cellRenderer: (params: any) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => startEdit(params.row)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => deleteRoom(params.row.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                    >
                        Delete
                    </button>
                </div>
            )
        },
    ];

    const addRoom = async () => {
        try {
            setLoading(true);
            await roomAPI.create(newRoom);
            await loadRooms();
            setNewRoom({
                name: "",
                location: ""
            });
        } catch (error) {
            console.error('Error adding room:', error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (room: any) => {
        setEditingRoom(room);
        setEditForm({
            name: room.name,
            location: room.location
        });
    };

    const cancelEdit = () => {
        setEditingRoom(null);
        setEditForm({
            name: "",
            location: ""
        });
    };

    const saveEdit = async () => {
        try {
            setLoading(true);
            await roomAPI.update(editingRoom.id, editForm);
            await loadRooms();
            cancelEdit();
        } catch (error) {
            console.error('Error updating room:', error);
        } finally {
            setLoading(false);
        }
    };
    const deleteRoom = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                setLoading(true);
                await roomAPI.delete(id);
                await loadRooms();
            } catch (error) {
                console.error('Error deleting room:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
         <div className="bg-[#3C3C3C] w-[1250px] h-[800px] mt-[-50] pt-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
    <div className="flex justify-center justify-self-center text-[32px] font-bold bg-[#900C27] rounded-full w-[250px] h-[50px] ">
      <h1 className="">Rooms</h1>
    </div>
                <div className="w-[1170px] h-[800px] mt-6 mx-10 flex flex-col">
                    
                    {/* Form Row - Single form that switches between Add and Edit */}
                    <div className="">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex flex-col">
                                <label className="text-white text-sm mb-1">Room Name</label>
                                <input 
                                    type="text"
                                    className="w-[200px] px-3 py-2 text-black rounded"
                                    placeholder="Enter room name" 
                                    value={editingRoom ? editForm.name : newRoom.name}
                                    onChange={(e) => editingRoom 
                                        ? setEditForm({ ...editForm, name: e.target.value })
                                        : setNewRoom({ ...newRoom, name: e.target.value })
                                    } 
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-white text-sm mb-1">Location</label>
                                <input 
                                    type="text"
                                    className="w-[200px] px-3 py-2 text-black rounded"
                                    placeholder="Enter location"
                                    value={editingRoom ? editForm.location : newRoom.location}
                                    onChange={(e) => editingRoom 
                                        ? setEditForm({ ...editForm, location: e.target.value })
                                        : setNewRoom({ ...newRoom, location: e.target.value })
                                    } 
                                />
                            </div>


                            <div className="flex flex-col justify-end">
                                {editingRoom ? (
                                    <div className="flex space-x-2">
                                        <button 
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold" 
                                            onClick={saveEdit}
                                        >
                                            Update
                                        </button>
                                        <button 
                                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold" 
                                            onClick={cancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        className="w-[150px] h-[40px] bg-green-600 hover:bg-green-700 text-white rounded font-semibold" 
                                        onClick={addRoom}
                                    >
                                        Add Record
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-[590px] bg-[#3C3C3C] mt-3 border-white border-2 rounded-lg overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="text-white text-xl">Loading...</div>
                            </div>
                        ) : (
                            <DataGrid 
                                data={rooms}
                                columns={roomColumns}
                                height="585px"
                                className="text-white text-[14px] bg-[#292929]"
                                showSearch={false}
                                pageSize={5} 
                            />
                        )}
                    </div>
                </div>
        
      
   </div>
        </>
    )
}