
import React, {useEffect, useState} from "react";
import DataGrid from "../components/DataGrid";
import {departmentAPI} from "../services/api";

export default function Departments() {
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newDepartment, setNewDepartment] = useState({
        name: "",
        short_name: ""
    });
    const [editingDepartment, setEditingDepartment] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        short_name: ""
    });

    useEffect(() => {
        loadDepartments()
    }, []);

    // Simple required-field validator
    const hasAllRequired = (values: Record<string, any>, required: string[]) => {
        return required.every((key) => String(values[key] ?? "").trim() !== "");
    };

    const deptRequired = ["name", "short_name"];
    const isNewValid = hasAllRequired(newDepartment, deptRequired);
    const isEditValid = hasAllRequired(editForm, deptRequired);

    const loadDepartments = async () => {
        try {
            setLoading(true);
            const departments = await departmentAPI.getAll();
            const normalized = departments || [];
            setDepartments(normalized);
        } catch (error) {
            console.error('Error loading departments:', error);
        } finally {
            setLoading(false);
        }
    };

    const departmentColumns = [
        {field: 'name', headerName: 'Department Name', width: 200},
        {field: 'short_name', headerName: 'Short Name', width: 120},

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
                        onClick={() => deleteDepartment(params.row.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                    >
                        Delete
                    </button>
                </div>
            )
        },
    ];

    const addDepartment = async () => {
        try {
            if (!isNewValid) {
                alert('Please fill out all required fields.');
                return;
            }
            setLoading(true);
            await departmentAPI.create(newDepartment);
            await loadDepartments();
            setNewDepartment({
                name: "",
                short_name: ""
            });
        } catch (error) {
            console.error('Error adding department:', error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (department: any) => {
        setEditingDepartment(department);
        setEditForm({
            name: department.name,
            short_name: department.short_name
        });
    };

    const cancelEdit = () => {
        setEditingDepartment(null);
        setEditForm({
            name: "",
            short_name: ""
        });
    };

    const saveEdit = async () => {
        try {
            if (!isEditValid) {
                alert('Please fill out all required fields.');
                return;
            }
            setLoading(true);
            await departmentAPI.update(editingDepartment.id, editForm);
            await loadDepartments();
            cancelEdit();
        } catch (error) {
            console.error('Error updating department:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteDepartment = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                setLoading(true);
                await departmentAPI.delete(id);
                await loadDepartments();
            } catch (error) {
                console.error('Error deleting department:', error);
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <>
         <div className="bg-[#3C3C3C] w-[1250px] h-[800px] mt-[-50] pt-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
    <div className="flex justify-center justify-self-center text-[32px] font-bold bg-[#900C27] rounded-full w-[250px] h-[50px] ">
      <h1 className="">Departments</h1>
    </div>
      <div className="w-[1170px] h-auto mt-6 mx-10 flex flex-col">
        {/* Form Row - Single form that switches between Add and Edit */}
        <div className="">
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">Department Name</label>
                    <input 
                        type="text"
                        className="w-[200px] px-3 py-2 text-black rounded capitalize"
                        placeholder="Enter department name" 
                        value={editingDepartment ? editForm.name : newDepartment.name}
                        onChange={(e) => editingDepartment 
                            ? setEditForm({ ...editForm, name: e.target.value })
                            : setNewDepartment({ ...newDepartment, name: e.target.value })
                        } 
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">Short Name</label>
                    <input 
                        type="text"
                        className="w-[150px] px-3 py-2 text-black rounded capitalize"
                        placeholder="Enter short name"
                        value={editingDepartment ? editForm.short_name : newDepartment.short_name}
                        onChange={(e) => editingDepartment 
                            ? setEditForm({ ...editForm, short_name: e.target.value })
                            : setNewDepartment({ ...newDepartment, short_name: e.target.value })
                        } 
                    />
                </div>

                <div className="flex flex-col justify-end">
                    {editingDepartment ? (
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
                            onClick={addDepartment}
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
                    data={departments}
                    columns={departmentColumns}
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