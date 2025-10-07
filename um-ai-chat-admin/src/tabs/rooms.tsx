import React, {useEffect, useMemo, useState} from "react";
import DataGrid from "../components/DataGrid";
import {roomAPI, buildingAPI} from "../services/api";

export default function Rooms() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [buildings, setBuildings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterRoomsByid, setFilterRoomsByid] = useState("");
    const [newRoom, setNewRoom] = useState({
        name: "",
        building_id: "",
        floor: "",
        status: "Vacant",
        type: "Lecture"
    });
    const [editingRoom, setEditingRoom] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        building_id: "",
        floor: "",
        status: "Vacant",
        type: "Lecture"
    });

    const filteredRooms = useMemo(() => {
  return rooms.filter(r =>{
    if(filterRoomsByid && String(r.building_id) !== filterRoomsByid) return false;
    return true;
  });
    }, [rooms, filterRoomsByid]);

    useEffect(() => {
        loadRooms();
        loadBuildings();
    }, []);

    const loadBuildings = async () => {
        try {
            const buildings = await buildingAPI.getAll();
            setBuildings(buildings);
        } catch (error) {
            console.error('Error loading buildings:', error);
        }
    };

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
        {field: 'name', headerName: 'Room Name', width: 200},
        {field: 'building_name', headerName: 'Building', width: 200},
        {field: 'floor', headerName: 'Floor', width: 150},
        {field: 'type', headerName: 'Type', width: 140},
        {field: 'created_at', headerName: 'Created At', width: 200, cellRenderer: (params: any) => {
            const v = params.value;
            if (!v) return '';
            try { return new Date(v).toLocaleString(); } catch { return String(v); }
        }},
        {field: 'status', headerName: 'Status', width: 180, cellRenderer: (params: any) => (
            <button
                className={
                    `px-3 py-1 rounded font-semibold ` +
                    (params.value === 'Occupied'
                        ? 'bg-red-600 hover:bg-red-700'
                        : params.value === 'Reserved'
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                        : 'bg-green-600 hover:bg-green-700')
                }
                onClick={() => toggleStatus(params.row)}
                title="Toggle status"
            >
                {params.value || 'Vacant'}
            </button>
        )},
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
            const hasAllRequired = (values: Record<string, any>, required: string[]) => required.every((k) => String(values[k] ?? '').trim() !== '');
            const required = ['name', 'building_id', 'floor'];
            if (!hasAllRequired(newRoom as any, required)) {
                alert('Please fill out all required fields.');
                return;
            }
            setLoading(true);
            await roomAPI.create(newRoom);
            await loadRooms();
            setNewRoom({
                name: "",
                building_id: "",
                floor: "",
                status: "Vacant",
                type: "Lecture"
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
            building_id: room.building_id || '',
            floor: room.floor || '',
            status: room.status || 'Vacant',
            type: room.type || 'Lecture'
        });
    };

    const cancelEdit = () => {
        setEditingRoom(null);
        setEditForm({
            name: "",
            building_id: "",
            floor: "",
            status: "Vacant",
            type: "Lecture"
        });
    };

    const saveEdit = async () => {
        try {
            const hasAllRequired = (values: Record<string, any>, required: string[]) => required.every((k) => String(values[k] ?? '').trim() !== '');
            const required = ['name', 'building_id', 'floor'];
            if (!hasAllRequired(editForm as any, required)) {
                alert('Please fill out all required fields.');
                return;
            }
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

    const getNextStatus = (current?: string) => {
        if (current === 'Vacant' || !current) return 'Reserved';
        if (current === 'Reserved') return 'Occupied';
        return 'Vacant';
    };

    const toggleStatus = async (room: any) => {
        const next = getNextStatus(room.status);
        try {
            setLoading(true);
            await roomAPI.update(room.id, { name: room.name, building_id: room.building_id, floor: room.floor, status: next });
            await loadRooms();
        } catch (error) {
            console.error('Error toggling status:', error);
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
         <div className=" flex flex-col 2xl:items-center bg-[#3C3C3C] mx-4 xl:mx-7 h-[800px] mt-[-50] pt-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
   <div className="flex justify-center justify-self-center text-xl xl:text-2xl 2xl:text-[32px] font-bold w-[180px] xl:w-[220px] 2xl:w-[250px] h-[42px] xl:h-[46px] 2xl:h-[50px] mx-auto ">
      <h1 className="truncate">Rooms</h1>
    </div>
                <div className="w-full max-w-[1170px] h-auto mt-6 xl:mx-10 px-4 flex flex-col">
                    
                    {/* Form Row - Single form that switches between Add and Edit */}
                    <div className="">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex flex-col">
                                <label className="text-white text-sm mb-1">Room Name</label>
                                <input 
                                    type="text"
                                    className="w-[200px] px-3 py-2 text-black rounded capitalize"
                                    placeholder="Enter room name"
                                    autoCapitalize="sentences"
                                    value={editingRoom ? editForm.name : newRoom.name}
                                    onChange={(e) => editingRoom 
                                        ? setEditForm({ ...editForm, name: e.target.value })
                                        : setNewRoom({ ...newRoom, name: e.target.value })
                                    } 
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-white text-sm mb-1">Building</label>
                                <select 
                                    className="w-[200px] px-3 py-2 text-black rounded"
                                    value={editingRoom ? editForm.building_id : newRoom.building_id}
                                    onChange={(e) => editingRoom 
                                        ? setEditForm({ ...editForm, building_id: e.target.value })
                                        : setNewRoom({ ...newRoom, building_id: e.target.value })
                                    }
                                >
                                    <option value="">--Select Building--</option>
                                    {buildings.map((building) => (
                                        <option key={building.id} value={building.id}>
                                            {building.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-white text-sm mb-1">Floor</label>
                                <select 
                                    className="w-[200px] px-3 py-2 text-black rounded"
                                    value={editingRoom ? editForm.floor : newRoom.floor}
                                    onChange={(e) => editingRoom 
                                        ? setEditForm({ ...editForm, floor: e.target.value })
                                        : setNewRoom({ ...newRoom, floor: e.target.value })
                                    }
                                >
                                    <option value="">--Select Floor--</option>
                                    <option value="1st floor">1st floor</option>
                                    <option value="2nd floor">2nd floor</option>
                                    <option value="3rd floor">3rd floor</option>
                                </select>
                            </div>

                            {/* Room Type */}
                            <div className="flex flex-col">
                                <label className="text-white text-sm mb-1">Type</label>
                                <select
                                    className="w-[200px] px-3 py-2 text-black rounded"
                                    value={editingRoom ? editForm.type : newRoom.type}
                                    onChange={(e) => editingRoom
                                        ? setEditForm({ ...editForm, type: e.target.value })
                                        : setNewRoom({ ...newRoom, type: e.target.value })
                                    }
                                >
                                    <option value="Lecture">Lecture</option>
                                    <option value="ComLab">ComLab</option>
                                </select>
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

                    
                    <div className="flex items-center gap-3 mt-3">
                        <div className="flex flex-col">
                        <label className="text-white text-sm">Filter by Building</label>
                        <select
                            className="w-[200px] px-3 py-2 text-black rounded"
                            value={filterRoomsByid}
                            onChange={(e) => setFilterRoomsByid(e.target.value)}
                        >
                            <option value="">All Buildings</option>
                            {buildings.map((b: any) => (
                                <option key={b.id} value={String(b.id)}>{b.name}</option>
                            ))}
                        </select>
                        </div>
                    </div>

                    <div className="w-full h-[520px] bg-[#3C3C3C] mt-3 border-white border-2 rounded-lg overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="text-white text-xl">Loading...</div>
                            </div>
                        ) : (
                            <DataGrid 
                                data={filteredRooms}
                                columns={roomColumns}
                                height="520px"
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