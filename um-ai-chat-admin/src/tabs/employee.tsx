import { useState, useEffect } from "react";
import DataGrid from "../components/DataGrid";
import { professorAPI, departmentAPI, nonTeachingAPI } from "../services/api";

const NON_TEACHING_ROLES = ["Cashier", "Librarian", "Librarian Head", "OSA Head"];

export default function Employee() {
  const [professors, setProfessors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [nonTeaching, setNonTeaching] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ntLoading, setNtLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'professors' | 'nonTeaching'>('professors');

  const [newProfessor, setNewProfessor] = useState({
    name: "",
    position: "",
    email: "",
    department: "",
    program: ""
  });
  const [editingProfessor, setEditingProfessor] = useState<any>(null);
  const [editProfessorForm, setEditProfessorForm] = useState({
    name: "",
    position: "",
    email: "",
    department: "",
    program: ""
  });

  const [newStaff, setNewStaff] = useState({
    name: "",
    role: ""
  });
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [editStaffForm, setEditStaffForm] = useState({
    name: "",
    role: ""
  });

  useEffect(() => {
    loadProfessors();
    loadDepartments();
    loadNonTeaching();
  }, []);

  const loadProfessors = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading professors...');
      const response = await professorAPI.getAll();
      console.log('📦 Professors API response:', response);
      const normalized = (response || []).map((p: any) => ({
        ...p,
        program: typeof p.program === 'undefined' || p.program === null ? '' : p.program
      }));
      console.log('✅ Setting professors:', normalized.length, normalized);
      setProfessors(normalized);
    } catch (error) {
      console.error('❌ Error loading professors:', error);
      alert('Failed to load professors. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const departments = await departmentAPI.getAll();
      setDepartments(departments);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadNonTeaching = async () => {
    try {
      setNtLoading(true);
      const staff = await nonTeachingAPI.getAll();
      setNonTeaching(staff || []);
    } catch (error) {
      console.error('Error loading non-teaching staff:', error);
    } finally {
      setNtLoading(false);
    }
  };

  const professorColumns = [
    { field: 'name', headerName: 'Name', width: 70 },
    { field: 'position', headerName: 'Position', width: 70 },
    {
      field: 'email',
      headerName: 'Email',
      width: 100,
      cellRenderer: ({ value }: any) => (
        <span className="break-all text-xs">{value || '-'}</span>
      )
    },
    { field: 'department', headerName: 'Dept.', width: 60 },
    {
      field: 'program',
      headerName: 'Program',
      width: 60,
      cellRenderer: ({ value }: any) => <span>{value || '-'}</span>
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      cellRenderer: (params: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => startEditProfessor(params.row)}
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
    }
  ];

  const staffColumns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'role', headerName: 'Role', width: 160 },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 150,
      cellRenderer: (params: any) => {
        const v = params.value;
        if (!v) return '';
        try { return new Date(v).toLocaleDateString(); } catch { return String(v); }
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      cellRenderer: (params: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => startEditStaff(params.row)}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
          >
            Edit
          </button>
          <button
            onClick={() => deleteStaff(params.row.id)}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const addProfessor = async () => {
    const required = ['name', 'position', 'department', 'program'];
    const hasAll = required.every((k) => String((newProfessor as any)[k] ?? '').trim() !== '');
    if (!hasAll) {
      alert('Please fill out all required fields.');
      return;
    }
    try {
      setLoading(true);
      console.log('➕ Adding professor:', newProfessor);
      const result = await professorAPI.create(newProfessor);
      console.log('✅ Professor added:', result);
      await loadProfessors();
      setNewProfessor({
        name: "",
        position: "",
        email: "",
        department: "",
        program: ""
      });
      alert('Professor added successfully!');
    } catch (error: any) {
      console.error('❌ Error adding professor:', error);
      alert(`Failed to add professor: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const saveProfessorEdit = async () => {
    if (!editingProfessor) return;
    const required = ['name', 'position', 'department', 'program'];
    const hasAll = required.every((k) => String((editProfessorForm as any)[k] ?? '').trim() !== '');
    if (!hasAll) {
      alert('Please fill out all required fields.');
      return;
    }
    try {
      setLoading(true);
      await professorAPI.update(editingProfessor.id, editProfessorForm);
      await loadProfessors();
      cancelProfessorEdit();
    } catch (error) {
      console.error('Error updating professor:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProfessor = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this professor?')) {
      return;
    }
    try {
      setLoading(true);
      await professorAPI.delete(id);
      await loadProfessors();
    } catch (error) {
      console.error('Error deleting professor:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStaff = async () => {
    const required = ['name', 'role'];
    const hasAll = required.every((k) => String((newStaff as any)[k] ?? '').trim() !== '');
    if (!hasAll) {
      alert('Please fill out all required fields.');
      return;
    }
    try {
      setNtLoading(true);
      await nonTeachingAPI.create(newStaff);
      await loadNonTeaching();
      setNewStaff({ name: "", role: "" });
    } catch (error) {
      console.error('Error adding staff:', error);
    } finally {
      setNtLoading(false);
    }
  };

  const saveStaffEdit = async () => {
    if (!editingStaff) return;
    const required = ['name', 'role'];
    const hasAll = required.every((k) => String((editStaffForm as any)[k] ?? '').trim() !== '');
    if (!hasAll) {
      alert('Please fill out all required fields.');
      return;
    }
    try {
      setNtLoading(true);
      await nonTeachingAPI.update(editingStaff.id, editStaffForm);
      await loadNonTeaching();
      cancelStaffEdit();
    } catch (error) {
      console.error('Error updating staff:', error);
    } finally {
      setNtLoading(false);
    }
  };

  const deleteStaff = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }
    try {
      setNtLoading(true);
      await nonTeachingAPI.delete(id);
      await loadNonTeaching();
    } catch (error) {
      console.error('Error deleting staff:', error);
    } finally {
      setNtLoading(false);
    }
  };

  const startEditProfessor = (prof: any) => {
    setEditingProfessor(prof);
    setEditProfessorForm({
      name: prof.name,
      position: prof.position,
      email: prof.email,
      department: prof.department,
      program: prof.program || ""
    });
  };

  const cancelProfessorEdit = () => {
    setEditingProfessor(null);
    setEditProfessorForm({
      name: "",
      position: "",
      email: "",
      department: "",
      program: ""
    });
  };

  const startEditStaff = (staff: any) => {
    setEditingStaff(staff);
    setEditStaffForm({
      name: staff.name,
      role: staff.role
    });
  };

  const cancelStaffEdit = () => {
    setEditingStaff(null);
    setEditStaffForm({
      name: "",
      role: ""
    });
  };

  return (
    <div className="flex flex-col 2xl:items-center bg-[#3C3C3C] mx-4 xl:mx-7 h-[800px]  pt-10 pb-8 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
      <div className="flex justify-center justify-self-center text-xl xl:text-2xl 2xl:text-[32px] font-bold w-[200px] xl:w-[240px] 2xl:w-[260px] h-[42px] xl:h-[46px] 2xl:h-[50px] mx-auto ">
        <h1 className="truncate">Employees</h1>
      </div>

      <div className="w-full max-w-[1180px] mt-6 px-4 space-y-6">
        <div className="flex space-x-4 border-b border-white/10 pb-2">
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'professors' ? 'bg-[#900C27] text-white' : 'bg-transparent text-gray-300 hover:text-white'}`}
            onClick={() => setActiveTab('professors')}
          >
            Professors
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'nonTeaching' ? 'bg-[#900C27] text-white' : 'bg-transparent text-gray-300 hover:text-white'}`}
            onClick={() => setActiveTab('nonTeaching')}
          >
            Non-Teaching Employees
          </button>
        </div>

        {activeTab === 'professors' && (
          <div className="bg-[#292929] border border-white rounded-2xl p-4 flex flex-col h-[615px]">

            <div className="mb-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col">
                  <label className="text-white text-sm mb-1">Name</label>
                  <input
                    type="text"
                    className="w-[200px] px-3 py-2 text-black rounded capitalize"
                    placeholder="Enter name"
                    value={editingProfessor ? editProfessorForm.name : newProfessor.name}
                    onChange={(e) =>
                      editingProfessor
                        ? setEditProfessorForm({ ...editProfessorForm, name: e.target.value })
                        : setNewProfessor({ ...newProfessor, name: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-white text-sm mb-1">Position</label>
                  <select
                    value={editingProfessor ? editProfessorForm.position : newProfessor.position}
                    onChange={(e) =>
                      editingProfessor
                        ? setEditProfessorForm({ ...editProfessorForm, position: e.target.value })
                        : setNewProfessor({ ...newProfessor, position: e.target.value })
                    }
                    className="w-[200px] h-[40px] px-3 py-2 text-black rounded"
                  >
                    <option value="">-- Choose Position --</option>
                    <option value="Professor">Professor</option>
                    <option value="Department Head">Department Head</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-white text-sm mb-1">Email (optional)</label>
                  <input
                    type="email"
                    className="w-[200px] px-3 py-2 text-black rounded"
                    placeholder="Enter email"
                    value={editingProfessor ? editProfessorForm.email : newProfessor.email}
                    onChange={(e) =>
                      editingProfessor
                        ? setEditProfessorForm({ ...editProfessorForm, email: e.target.value })
                        : setNewProfessor({ ...newProfessor, email: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-white text-sm mb-1">Department</label>
                  <select
                    value={editingProfessor ? editProfessorForm.department : newProfessor.department}
                    onChange={(e) =>
                      editingProfessor
                        ? setEditProfessorForm({ ...editProfessorForm, department: e.target.value })
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
                    value={editingProfessor ? editProfessorForm.program : newProfessor.program}
                    onChange={(e) =>
                      editingProfessor
                        ? setEditProfessorForm({ ...editProfessorForm, program: e.target.value })
                        : setNewProfessor({ ...newProfessor, program: e.target.value })
                    }
                    className="w-[120px] h-[40px] px-3 py-2 text-black rounded"
                  >
                    <option value="">Program</option>
                    <option value="BSIT">BSIT</option>
                    <option value="BSCS">BSCS</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  {editingProfessor ? (
                    <div className="flex space-x-2">
                      <button
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
                        onClick={saveProfessorEdit}
                      >
                        Update
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold"
                        onClick={cancelProfessorEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="w-[160px] h-[40px] bg-green-600 hover:bg-green-700 text-white rounded font-semibold"
                      onClick={addProfessor}
                    >
                      Add Professor
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 bg-[#3C3C3C] border border-white/10 rounded-xl overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-white text-xl">Loading...</div>
                </div>
              ) : (
                <DataGrid
                  data={professors}
                  columns={professorColumns}
                  height="520px"
                  className="text-white text-[12px] bg-[#292929]"
                  showSearch={false}
                  pageSize={10}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'nonTeaching' && (
          <div className="bg-[#292929] border border-white rounded-2xl p-4 flex flex-col h-[615px]">

            <div className="mb-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col">
                  <label className="text-white text-sm mb-1">Name</label>
                  <input
                    type="text"
                    className="w-[200px] px-3 py-2 text-black rounded capitalize"
                    placeholder="Enter name"
                    value={editingStaff ? editStaffForm.name : newStaff.name}
                    onChange={(e) =>
                      editingStaff
                        ? setEditStaffForm({ ...editStaffForm, name: e.target.value })
                        : setNewStaff({ ...newStaff, name: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-white text-sm mb-1">Role</label>
                  <select
                    value={editingStaff ? editStaffForm.role : newStaff.role}
                    onChange={(e) =>
                      editingStaff
                        ? setEditStaffForm({ ...editStaffForm, role: e.target.value })
                        : setNewStaff({ ...newStaff, role: e.target.value })
                    }
                    className="w-[200px] h-[40px] px-3 py-2 text-black rounded"
                  >
                    <option value="">Select role</option>
                    {NON_TEACHING_ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  {editingStaff ? (
                    <div className="flex space-x-2">
                      <button
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
                        onClick={saveStaffEdit}
                      >
                        Update
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold"
                        onClick={cancelStaffEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="w-[160px] h-[40px] bg-green-600 hover:bg-green-700 text-white rounded font-semibold"
                      onClick={addStaff}
                    >
                      Add Employee
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 bg-[#3C3C3C] border border-white/10 rounded-xl overflow-y-auto">
              {ntLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-white text-xl">Loading...</div>
                </div>
              ) : (
                <DataGrid
                  data={nonTeaching}
                  columns={staffColumns}
                  height="520px"
                  className="text-white text-[14px] bg-[#292929]"
                  showSearch={false}
                  pageSize={10}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

