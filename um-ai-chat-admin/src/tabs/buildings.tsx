import React, {useEffect, useState} from "react";
import DataGrid from "../components/DataGrid";
import {buildingAPI} from "../services/api";

export default function Buildings() {
    const [buildings, setBuildings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newBuilding, setNewBuilding] = useState({
        name: ""
    });
    const [editingBuilding, setEditingBuilding] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        name: ""
    });

    useEffect(() => {
        loadBuildings()
    }, []);

    const loadBuildings = async () => {
        try {
            setLoading(true);
            const buildings = await buildingAPI.getAll();
            setBuildings(buildings);
        } catch (error) {
            console.error('Error loading buildings:', error);
        } finally {
            setLoading(false);
        }
    };

    const buildingColumns = [
        {field: 'name', headerName: 'Building Name', width: 200},
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
                        onClick={() => deleteBuilding(params.row.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                    >
                        Delete
                    </button>
                </div>
            )
        },
    ];

    const addBuilding = async () => {
        try {
            const hasAllRequired = (values: Record<string, any>, required: string[]) => required.every((k) => String(values[k] ?? '').trim() !== '');
            const required = ['name'];
            if (!hasAllRequired(newBuilding as any, required)) {
                alert('Please fill out all required fields.');
                return;
            }
            setLoading(true);
            await buildingAPI.create(newBuilding);
            await loadBuildings();
            setNewBuilding({
                name: ""
            });
        } catch (error) {
            console.error('Error adding building:', error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (building: any) => {
        setEditingBuilding(building);
        setEditForm({
            name: building.name
        });
    };

    const cancelEdit = () => {
        setEditingBuilding(null);
        setEditForm({
            name: ""
        });
    };

    const saveEdit = async () => {
        try {
            const hasAllRequired = (values: Record<string, any>, required: string[]) => required.every((k) => String(values[k] ?? '').trim() !== '');
            const required = ['name'];
            if (!hasAllRequired(editForm as any, required)) {
                alert('Please fill out all required fields.');
                return;
            }
            setLoading(true);
            await buildingAPI.update(editingBuilding.id, editForm);
            await loadBuildings();
            cancelEdit();
        } catch (error) {
            console.error('Error updating building:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteBuilding = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this building?')) {
            try {
                setLoading(true);
                await buildingAPI.delete(id);
                await loadBuildings();
            } catch (error) {
                console.error('Error deleting building:', error);
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <>
        <div className=" flex flex-col 2xl:items-center bg-[#3C3C3C] mx-4 xl:mx-7 h-[800px] mt-[-50] pt-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
   <div className="flex justify-center justify-self-center text-xl xl:text-2xl 2xl:text-[32px] font-bold bg-[#900C27] rounded-full w-[180px] xl:w-[220px] 2xl:w-[250px] h-[42px] xl:h-[46px] 2xl:h-[50px] mx-auto ">
      <h1 className="truncate">Buildings</h1>
    </div>
      <div className="w-full max-w-[1170px] h-auto mt-6 xl:mx-10 px-4 flex flex-col">
        {/* Form Row - Single form that switches between Add and Edit */}
        <div className="">
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">Building Name</label>
                    <input 
                        type="text"
                        className="w-[200px] px-3 py-2 text-black rounded capitalize"
                        placeholder="Enter building name"
                        autoCapitalize="sentences"
                        value={editingBuilding ? editForm.name : newBuilding.name}
                        onChange={(e) => editingBuilding 
                            ? setEditForm({ ...editForm, name: e.target.value })
                            : setNewBuilding({ ...newBuilding, name: e.target.value })
                        } 
                    />
                </div>


                <div className="flex flex-col justify-end">
                    {editingBuilding ? (
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
                            onClick={addBuilding}
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
                    data={buildings}
                    columns={buildingColumns}
                    height="585px"
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
