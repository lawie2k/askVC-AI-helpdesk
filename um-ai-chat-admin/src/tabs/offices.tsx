
import React, {useEffect, useState} from "react";
import DataGrid from "../components/DataGrid";
import {officeAPI} from "../services/api";

export default function offices() {
    const [offices, setOffices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newOffice, setNewOffice] = useState({
        name: "",
        location: ""
    });
    const [editingOffice, setEditingOffice] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        location: ""
    });

    useEffect(() => {
        loadOffices()
    }, []);

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

    const officeColumns = [
        {field: 'id', headerName: 'ID', width: 60},
        {field: 'name', headerName: 'Office Name', width: 200},
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
            setLoading(true);
            await officeAPI.create(newOffice);
            await loadOffices();
            setNewOffice({
                name: "",
                location: ""
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
            location: office.location
        });
    };

    const cancelEdit = () => {
        setEditingOffice(null);
        setEditForm({
            name: "",
            location: ""
        });
    };

    const saveEdit = async () => {
        try {
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
      <div className="w-[1170px] h-[800px] mt-6 mx-10 flex flex-col">
        {/* Form Row - Single form that switches between Add and Edit */}
        <div className="">
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">Office Name</label>
                    <input 
                        type="text"
                        className="w-[200px] px-3 py-2 text-black rounded"
                        placeholder="Enter office name" 
                        value={editingOffice ? editForm.name : newOffice.name}
                        onChange={(e) => editingOffice 
                            ? setEditForm({ ...editForm, name: e.target.value })
                            : setNewOffice({ ...newOffice, name: e.target.value })
                        } 
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">Location</label>
                    <input 
                        type="text"
                        className="w-[200px] px-3 py-2 text-black rounded"
                        placeholder="Enter location"
                        value={editingOffice ? editForm.location : newOffice.location}
                        onChange={(e) => editingOffice 
                            ? setEditForm({ ...editForm, location: e.target.value })
                            : setNewOffice({ ...newOffice, location: e.target.value })
                        } 
                    />
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

        <div className="w-full h-[590px] bg-[#3C3C3C] mt-3 border-white border-2 rounded-lg overflow-y-auto">
            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <div className="text-white text-xl">Loading...</div>
                </div>
            ) : (
                <DataGrid 
                    data={offices}
                    columns={officeColumns}
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