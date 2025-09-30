
import React, {useEffect, useMemo, useState} from "react";
import DataGrid from "../components/DataGrid";
import {officeAPI, buildingAPI} from "../services/api";

export default function offices() {
    const [offices, setOffices] = useState<any[]>([]);
    const [buildings, setBuildings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterOfficesById, setFilterOfficesById] = useState("");
    const [newOffice, setNewOffice] = useState({
        name: "",
        building_id: "",
        floor: ""
    });
    const [editingOffice, setEditingOffice] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        building_id: "",
        floor: ""
    });

    useEffect(() => {
        loadOffices();
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

    const loadOffices = async () => {
        try {
            setLoading(true);
            const offices = await officeAPI.getAll();
            setOffices(offices);
        } catch (error) {
            console.error('Error loading offices:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOffices = useMemo(() => {
        return offices.filter(o => {
            if (filterOfficesById && String(o.building_id) !== filterOfficesById) return false;
            return true;
        });
    }, [offices, filterOfficesById]);

    const officeColumns = [
        {field: 'name', headerName: 'Office Name', width: 200},
        {field: 'building_name', headerName: 'Building', width: 200},
        {field: 'floor', headerName: 'Floor', width: 150},
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
                        onClick={() => deleteOffice(params.row.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                    >
                        Delete
                    </button>
                </div>
            )
        },
    ];

    const addOffice = async () => {
        try {
            const hasAllRequired = (values: Record<string, any>, required: string[]) => required.every((k) => String(values[k] ?? '').trim() !== '');
            const required = ['name', 'building_id', 'floor'];
            if (!hasAllRequired(newOffice as any, required)) {
                alert('Please fill out all required fields.');
                return;
            }
            setLoading(true);
            await officeAPI.create(newOffice);
            await loadOffices();
            setNewOffice({
                name: "",
                building_id: "",
                floor: ""
            });
        } catch (error) {
            console.error('Error adding office:', error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (office: any) => {
        setEditingOffice(office);
        setEditForm({
            name: office.name,
            building_id: office.building_id || '',
            floor: office.floor || ''
        });
    };

    const cancelEdit = () => {
        setEditingOffice(null);
        setEditForm({
            name: "",
            building_id: "",
            floor: ""
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
            await officeAPI.update(editingOffice.id, editForm);
            await loadOffices();
            cancelEdit();
        } catch (error) {
            console.error('Error updating office:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteOffice = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this office?')) {
            try {
                setLoading(true);
                await officeAPI.delete(id);
                await loadOffices();
            } catch (error) {
                console.error('Error deleting office:', error);
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <>
        <div className="bg-[#3C3C3C] w-[1250px] h-[800px] mt-[-50] pt-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
    <div className="flex justify-center justify-self-center text-[32px] font-bold bg-[#900C27] rounded-full w-[250px] h-[50px] ">
      <h1 className="">Offices</h1>
    </div>
      <div className="w-[1170px] h-auto mt-6 mx-10 flex flex-col">
        {/* Form Row - Single form that switches between Add and Edit */}
        <div className="">
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">Office Name</label>
                    <input 
                        type="text"
                        className="w-[200px] px-3 py-2 text-black rounded capitalize"
                        placeholder="Enter office name" 
                        value={editingOffice ? editForm.name : newOffice.name}
                        onChange={(e) => editingOffice 
                            ? setEditForm({ ...editForm, name: e.target.value })
                            : setNewOffice({ ...newOffice, name: e.target.value })
                        } 
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">Building</label>
                    <select 
                        className="w-[200px] px-3 py-2 text-black rounded"
                        value={editingOffice ? editForm.building_id : newOffice.building_id}
                        onChange={(e) => editingOffice 
                            ? setEditForm({ ...editForm, building_id: e.target.value })
                            : setNewOffice({ ...newOffice, building_id: e.target.value })
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
                        value={editingOffice ? editForm.floor : newOffice.floor}
                        onChange={(e) => editingOffice 
                            ? setEditForm({ ...editForm, floor: e.target.value })
                            : setNewOffice({ ...newOffice, floor: e.target.value })
                        }
                    >
                        <option value="">--Select Floor--</option>
                        <option value="1st floor">1st floor</option>
                        <option value="2nd floor">2nd floor</option>
                        <option value="3rd floor">3rd floor</option>
                    </select>
                </div>


                <div className="flex flex-col justify-end">
                    {editingOffice ? (
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
                            onClick={addOffice}
                        >
                            Add Record
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className="mt-3">
            <label className="text-white text-sm block mb-1">Filter by Building</label>
            <div className="flex items-center gap-3">
                <select
                    className="w-[200px] px-3 py-2 text-black rounded"
                    value={filterOfficesById}
                    onChange={(e) => setFilterOfficesById(e.target.value)}
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
                    data={filteredOffices}
                    columns={officeColumns}
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