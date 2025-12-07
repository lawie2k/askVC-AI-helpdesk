import React, { useEffect, useState } from "react";
import DataGrid from "../components/DataGrid";
import { officersAPI } from "../services/api";
import ConfirmationModal from "../components/ConfirmationModal";

const ORGANIZATIONS = ["CSIT", "CODES","EESA"];

export default function OfficersTab() {
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterOrg, setFilterOrg] = useState<string>("");

  const [editingOfficer, setEditingOfficer] = useState<any>(null);
  const [newOfficer, setNewOfficer] = useState({
    name: "",
    position: "",
    organization: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    position: "",
    organization: "",
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'save' | 'edit';
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'save',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    loadOfficers();
  }, []);

  const loadOfficers = async () => {
    try {
      setLoading(true);
      const data = await officersAPI.getAll();
      setOfficers(data || []);
    } catch (err) {
      console.error("Error loading officers:", err);
      alert("Failed to load officers.");
    } finally {
      setLoading(false);
    }
  };

  const filteredOfficers = officers.filter((o) =>
    filterOrg ? o.organization === filterOrg : true
  );

  const columns = [
    { field: "name", headerName: "Name", width: 150 },
    { field: "position", headerName: "Position", width: 150 },
    { field: "organization", headerName: "Organization", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      cellRenderer: (params: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => startEdit(params.row)}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
          >
            Edit
          </button>
          <button
            onClick={() => deleteOfficer(params.row.id)}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const startEdit = (officer: any) => {
    setEditingOfficer(officer);
    setEditForm({
      name: officer.name || "",
      position: officer.position || "",
      organization: officer.organization || "",
    });
  };

  const cancelEdit = () => {
    setEditingOfficer(null);
    setEditForm({
      name: "",
      position: "",
      organization: "",
    });
  };

  const addOfficer = async () => {
    const values = newOfficer;
    if (
      !values.name.trim() ||
      !values.position.trim() ||
      !values.organization.trim()
    ) {
      alert("Please fill out name, position, and organization.");
      return;
    }
    setConfirmModal({
      isOpen: true,
      type: 'save',
      title: 'Save Officer',
      message: `Are you sure you want to save "${values.name}"?`,
      onConfirm: async () => {
    try {
      setLoading(true);
      await officersAPI.create(values);
      await loadOfficers();
      setNewOfficer({
        name: "",
        position: "",
        organization: "",
      });
    } catch (err) {
      console.error("Error adding officer:", err);
      alert("Failed to add officer.");
    } finally {
      setLoading(false);
    }
      },
    });
  };

  const saveEdit = async () => {
    const values = editForm;
    if (
      !values.name.trim() ||
      !values.position.trim() ||
      !values.organization.trim()
    ) {
      alert("Please fill out name, position, and organization.");
      return;
    }
    setConfirmModal({
      isOpen: true,
      type: 'edit',
      title: 'Update Officer',
      message: `Are you sure you want to update "${values.name}"?`,
      onConfirm: async () => {
    try {
      setLoading(true);
      await officersAPI.update(editingOfficer.id, values);
      await loadOfficers();
      cancelEdit();
    } catch (err) {
      console.error("Error updating officer:", err);
      alert("Failed to update officer.");
    } finally {
      setLoading(false);
    }
      },
    });
  };

  const deleteOfficer = async (id: number) => {
    const officer = officers.find(o => o.id === id);
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      title: 'Delete Officer',
      message: `Are you sure you want to delete "${officer?.name || 'this officer'}"? This action cannot be undone.`,
      onConfirm: async () => {
    try {
      setLoading(true);
      await officersAPI.delete(id);
      await loadOfficers();
    } catch (err) {
      console.error("Error deleting officer:", err);
      alert("Failed to delete officer.");
    } finally {
      setLoading(false);
    }
      },
    });
  };

  return (
    <>
      <div className="flex flex-col 2xl:items-center bg-[#3C3C3C] mx-4 xl:mx-7 h-[800px] mt-[-50] pt-10 overflow-y-hidden shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
        <div className="flex justify-center justify-self-center text-xl xl:text-2xl 2xl:text-[32px] font-bold w-[220px] 2xl:w-[260px] h-[42px] xl:h-[46px] 2xl:h-[50px] mx-auto ">
          <h1 className="truncate">Student Officers</h1>
        </div>
        <div className="w-full max-w-[1170px] h-auto mt-6 xl:mx-10 px-4">
          <div className="bg-[#292929] border border-white rounded-2xl p-4 flex flex-col h-[615px]">
            <div className="mb-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col">
                  <label className="text-white text-sm mb-1">Name</label>
                  <input
                    type="text"
                    className="w-[200px] px-3 py-2 text-black rounded"
                    placeholder="Enter name"
                    value={editingOfficer ? editForm.name : newOfficer.name}
                    onChange={(e) =>
                      editingOfficer
                        ? setEditForm({ ...editForm, name: e.target.value })
                        : setNewOfficer({ ...newOfficer, name: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-white text-sm mb-1">Position</label>
                  <input
                    type="text"
                    className="w-[200px] px-3 py-2 text-black rounded"
                    placeholder="Enter position"
                    value={editingOfficer ? editForm.position : newOfficer.position}
                    onChange={(e) =>
                      editingOfficer
                        ? setEditForm({ ...editForm, position: e.target.value })
                        : setNewOfficer({ ...newOfficer, position: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-white text-sm mb-1">Organization</label>
                  <select
                    className="w-[200px] px-3 py-2 text-black rounded"
                    value={
                      editingOfficer ? editForm.organization : newOfficer.organization
                    }
                    onChange={(e) =>
                      editingOfficer
                        ? setEditForm({ ...editForm, organization: e.target.value })
                        : setNewOfficer({
                            ...newOfficer,
                            organization: e.target.value,
                          })
                    }
                  >
                    <option value="">Select organization</option>
                    {ORGANIZATIONS.map((org) => (
                      <option key={org} value={org}>
                        {org}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  {editingOfficer ? (
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
                      className="w-[160px] h-[40px] bg-green-600 hover:bg-green-700 text-white rounded font-semibold"
                      onClick={addOfficer}
                    >
                      Add Officer
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="text-white text-sm block mb-1">
                Filter by Organization
              </label>
              <select
                className="w-[200px] px-3 py-2 text-black rounded"
                value={filterOrg}
                onChange={(e) => setFilterOrg(e.target.value)}
              >
                <option value="">All</option>
                {ORGANIZATIONS.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 bg-[#3C3C3C] border border-white/10 rounded-xl overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-white text-xl">Loading...</div>
                </div>
              ) : (
                <DataGrid
                  data={filteredOfficers}
                  columns={columns}
                  height="427px"
                  className="text-white text-[14px] bg-[#292929]"
                  showSearch={false}
                  pageSize={10}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.type === 'delete' ? 'Delete' : confirmModal.type === 'edit' ? 'Update' : 'Save'}
      />
    </>
  );
}


