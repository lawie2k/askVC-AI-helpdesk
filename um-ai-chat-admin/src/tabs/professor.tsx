import { useState, useEffect } from "react";
import DataGrid from "../components/DataGrid";
import { professorAPI, departmentAPI } from "../services/api";

export { default } from "./employee";

  const loadDepartments = async () => {
    try {
      const departments = await departmentAPI.getAll();
      setDepartments(departments);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };
  const professorColumns = [
    {field: 'name', headerName: 'Name', width: 150},
    {field: 'position', headerName: 'Position', width: 150},
    {field: 'email', headerName: 'Email', width: 200},
    {field: 'department', headerName: 'Department', width: 120},
    {field: 'program', headerName: 'Program', width: 160, cellRenderer: ({ value }: any) => (
      <span>{value || '-'}</span>
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
            onClick={() => deleteProfessor(params.row.id)}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
          >
            Delete
          </button>
        </div>
      )
    },
  ];
  const addProfessor = async () => {
    try {
      const hasAllRequired = (values: Record<string, any>, required: string[]) =>
        required.every((k) => String(values[k] ?? '').trim() !== '');
      const required = ['name', 'position', 'email', 'department', 'program'];
      if (!hasAllRequired(newProfessor as any, required)) {
        alert('Please fill out all required fields.');
        return;
      }
      setLoading(true);
      await professorAPI.create(newProfessor);
      await loadProfessors();
      setNewProfessor({
        name: "",
        position: "",
        email: "",
        department: "",
        program: ""
      });
    } catch (error) {
      console.error('Error adding professor:', error);
    } finally {
      setLoading(false);
    }
  };
  const updateProfessor = async (id: number, updatedData: any) => {
    try {
      setLoading(true);
      await professorAPI.update(id, updatedData);
      await loadProfessors();
    } catch (error) {
      console.error('Error updating professor:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteProfessor = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this professor?')) {
      try {
        setLoading(true);
        await professorAPI.delete(id);
        await loadProfessors();
      } catch (error) {
        console.error('Error deleting professor:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const startEdit = (professor: any) => {
    setEditingProfessor(professor);
    setEditForm({
      name: professor.name,
      position: professor.position,
      email: professor.email,
      department: professor.department,
      program: professor.program || ""
    });
  };

  const cancelEdit = () => {
    setEditingProfessor(null);
    setEditForm({
      name: "",
      position: "",
      email: "",
      department: "",
      program: ""
    });
  };

  const saveEdit = async () => {
    try {
      const hasAllRequired = (values: Record<string, any>, required: string[]) =>
        required.every((k) => String(values[k] ?? '').trim() !== '');
      const required = ['name', 'position', 'email', 'department', 'program'];
      if (!hasAllRequired(editForm as any, required)) {
        alert('Please fill out all required fields.');
        return;
      }
      setLoading(true);
      await professorAPI.update(editingProfessor.id, editForm);
      await loadProfessors();
      cancelEdit();
    } catch (error) {
      console.error('Error updating professor:', error);
    } finally {
      setLoading(false);
    }
  };
    return (
        <>
        <div className=" flex flex-col 2xl:items-center bg-[#3C3C3C] mx-4 xl:mx-7 h-[800px] mt-[-50] pt-10 overflow-y-hidden shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
   <div className="flex justify-center justify-self-center text-xl xl:text-2xl 2xl:text-[32px] font-bold w-[180px] xl:w-[220px] 2xl:w-[250px] h-[42px] xl:h-[46px] 2xl:h-[50px] mx-auto ">
      <h1 className="truncate">Professor</h1>
    </div>
      <div className="w-full max-w-[1170px] h-auto mt-6 xl:mx-10 px-4 flex flex-col">

        <div className="">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col">
              <label className="text-white text-sm mb-1">Name</label>
              <input 
                type="text"
                className="w-[200px] px-3 py-2 text-black rounded capitalize"
                placeholder="Enter name" 
                value={editingProfessor ? editForm.name : newProfessor.name}
                onChange={(e) => editingProfessor 
                  ? setEditForm({ ...editForm, name: e.target.value })
                  : setNewProfessor({ ...newProfessor, name: e.target.value })
                } 
              />
            </div>

            <div className="flex flex-col">
              <label className="text-white text-sm mb-1">Position</label>
              <select
                value={editingProfessor ? editForm.position : newProfessor.position}
                onChange={(e) => editingProfessor 
                  ? setEditForm({ ...editForm, position: e.target.value })
                  : setNewProfessor({ ...newProfessor, position: e.target.value })
                }
                className="w-[200px] h-[40px] px-3 py-2 text-black rounded"
              >
                <option value="">-- Choose Position --</option>
                <option value="Instructor I">Instructor I</option>
                <option value="Instructor II">Instructor II</option>
                <option value="Assistant Professor I">Assistant Professor I</option>
                <option value="Assistant Professor II">Assistant Professor II</option>
                <option value="Associate Professor I">Associate Professor I</option>
                <option value="Professor I">Professor I</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-white text-sm mb-1">Email</label>
              <input 
                type="email"
                className="w-[200px] px-3 py-2 text-black rounded"
                placeholder="Enter email"
                value={editingProfessor ? editForm.email : newProfessor.email}
                onChange={(e) => editingProfessor 
                  ? setEditForm({ ...editForm, email: e.target.value })
                  : setNewProfessor({ ...newProfessor, email: e.target.value })
                } 
              />
            </div>

            <div className="flex flex-col">
              <label className="text-white text-sm mb-1">Department</label>
              <select
                value={editingProfessor ? editForm.department : newProfessor.department}
                onChange={(e) => editingProfessor 
                  ? setEditForm({ ...editForm, department: e.target.value })
                  : setNewProfessor({ ...newProfessor, department: e.target.value })
                }
                className="w-[150px] h-[40px] px-3 py-2 text-black rounded"
              >
                <option value="">--Department--</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.short_name}>
                    {dept.short_name}
                  </option>
                ))}
              </select>
            </div>

              <div className="flex flex-col">
                  <label className="text-white text-sm mb-1">Program</label>
                  <select
                    value={editingProfessor ? editForm.program : newProfessor.program}
                    onChange={(e) => editingProfessor
                      ? setEditForm({ ...editForm, program: e.target.value })
                      : setNewProfessor({ ...newProfessor, program: e.target.value })
                    }
                    className="w-[120px] h-[40px] px-3 py-2 text-black rounded"
                  >
                    <option value=""> Program</option>
                    <option value="BSIT">BSIT</option>
                    <option value="BSCS">BSCS</option>
                  </select>
              </div>

            <div className="flex flex-col justify-end">
              {editingProfessor ? (
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
                  className="w-[100px] h-[40px] bg-green-600 hover:bg-green-700 text-white rounded font-semibold"
                  onClick={addProfessor}
                >
                  Add Record
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="w-full h-[590px] bg-[#3C3C3C] mt-3 border-white border-2 rounded-lg overflow-y-auto">
          {loading ?(
            <div className="flex justify-center items-center h-full">
              <div className="text-white text-xl">Loading...</div>
            </div>
          ) : (
            <DataGrid 
              data={professors}
              columns={professorColumns}
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