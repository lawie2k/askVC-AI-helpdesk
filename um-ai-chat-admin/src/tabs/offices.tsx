
import React, {useEffect, useMemo, useState} from "react";
import DataGrid from "../components/DataGrid";
import {officeAPI, buildingAPI, uploadAPI} from "../services/api";
import ConfirmationModal from "../components/ConfirmationModal";

export default function offices() {
    const [offices, setOffices] = useState<any[]>([]);
    const [buildings, setBuildings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterOfficesById, setFilterOfficesById] = useState("");
    const [newOffice, setNewOffice] = useState({
        name: "",
        building_id: "",
        floor: "",
        open_time: "",
        close_time: "",
        lunch_start: "",
        lunch_end: ""
    });
    const [editingOffice, setEditingOffice] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        building_id: "",
        floor: "",
        open_time: "",
        close_time: "",
        lunch_start: "",
        lunch_end: ""
    });
    const [newOfficeImage, setNewOfficeImage] = useState<string>("");
    const [editOfficeImage, setEditOfficeImage] = useState<string>("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
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
        const normalized = (offices || []).map((office: any) => ({
            ...office,
            open_time: office.open_time || "",
            close_time: office.close_time || "",
            lunch_start: office.lunch_start || "",
            lunch_end: office.lunch_end || ""
        }));
        setOffices(normalized);
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

    const formatTime12Hour = (time24: string) => {
        if (!time24) return '—';
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const renderTimeCell = (params: any) => (params?.value ? formatTime12Hour(params.value) : '—');

    const officeColumns = [
        {field: 'name', headerName: 'Office Name', width: 100},
        {field: 'building_name', headerName: 'Building', width: 100},
        {field: 'floor', headerName: 'Floor', width: 120},
        {field: 'open_time', headerName: 'Opens', width: 110, cellRenderer: renderTimeCell},
        {field: 'close_time', headerName: 'Closes', width: 110, cellRenderer: renderTimeCell},
        {field: 'lunch_start', headerName: 'Lunch Start', width: 120, cellRenderer: renderTimeCell},
        {field: 'lunch_end', headerName: 'Lunch End', width: 120, cellRenderer: renderTimeCell},
        {field: 'created_at', headerName: 'Created At', width: 180, cellRenderer: (params: any) => {
            const v = params.value;
            if (!v) return '';
            try { return new Date(v).toLocaleString(); } catch { return String(v); }
        }},
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

    const handleImageUpload = async (file: File, isEdit: boolean = false) => {
        try {
            setUploadingImage(true);
            console.log("📤 Starting image upload...", { 
                fileName: file.name, 
                fileSize: file.size, 
                fileType: file.type 
            });
            
            const result = await uploadAPI.uploadImage(file);
            console.log("✅ Upload successful:", result);
            
            if (isEdit) {
                setEditOfficeImage(result.url);
            } else {
                setNewOfficeImage(result.url);
            }
            return result.url;
        } catch (error: any) {
            console.error("❌ Error uploading image:", error);
            const errorMessage = error?.message || "Failed to upload image. Please try again.";
            alert(`Upload failed: ${errorMessage}\n\nCheck console for details.`);
            throw error;
        } finally {
            setUploadingImage(false);
        }
    };

    const addOffice = async () => {
            const hasAllRequired = (values: Record<string, any>, required: string[]) => required.every((k) => String(values[k] ?? '').trim() !== '');
            const required = ['name', 'building_id', 'floor'];
            if (!hasAllRequired(newOffice as any, required)) {
                alert('Please fill out all required fields.');
                return;
            }
        setConfirmModal({
            isOpen: true,
            type: 'save',
            title: 'Save Office',
            message: `Are you sure you want to save "${newOffice.name}"?`,
            onConfirm: async () => {
                try {
            setLoading(true);
            await officeAPI.create({
                ...newOffice,
                image_url: newOfficeImage || null,
            });
            await loadOffices();
            setNewOffice({
                name: "",
                building_id: "",
                floor: "",
                open_time: "",
                close_time: "",
                lunch_start: "",
                lunch_end: ""
            });
            setNewOfficeImage("");
        } catch (error) {
            console.error('Error adding office:', error);
        } finally {
            setLoading(false);
        }
            },
        });
    };

    const startEdit = (office: any) => {
        setEditingOffice(office);
        setEditForm({
            name: office.name,
            building_id: office.building_id || '',
            floor: office.floor || '',
            open_time: office.open_time || '',
            close_time: office.close_time || '',
            lunch_start: office.lunch_start || '',
            lunch_end: office.lunch_end || ''
        });
        setEditOfficeImage(office.image_url || "");
    };

    const cancelEdit = () => {
        setEditingOffice(null);
        setEditForm({
            name: "",
            building_id: "",
            floor: "",
            open_time: "",
            close_time: "",
            lunch_start: "",
            lunch_end: ""
        });
        setEditOfficeImage("");
    };

    const saveEdit = async () => {
            const hasAllRequired = (values: Record<string, any>, required: string[]) => required.every((k) => String(values[k] ?? '').trim() !== '');
            const required = ['name', 'building_id', 'floor'];
            if (!hasAllRequired(editForm as any, required)) {
                alert('Please fill out all required fields.');
                return;
            }
        setConfirmModal({
            isOpen: true,
            type: 'edit',
            title: 'Update Office',
            message: `Are you sure you want to update "${editForm.name}"?`,
            onConfirm: async () => {
                try {
            setLoading(true);
            await officeAPI.update(editingOffice.id, {
                ...editForm,
                image_url: editOfficeImage || null,
            });
            await loadOffices();
            cancelEdit();
        } catch (error) {
            console.error('Error updating office:', error);
        } finally {
            setLoading(false);
        }
            },
        });
    };

    const deleteOffice = async (id: number) => {
        const office = offices.find(o => o.id === id);
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            title: 'Delete Office',
            message: `Are you sure you want to delete "${office?.name || 'this office'}"? This action cannot be undone.`,
            onConfirm: async () => {
            try {
                setLoading(true);
                await officeAPI.delete(id);
                await loadOffices();
            } catch (error) {
                console.error('Error deleting office:', error);
            } finally {
                setLoading(false);
            }
            },
        });
    }

    return (
        <>
        <div className=" flex flex-col 2xl:items-center bg-[#3C3C3C] mx-4 xl:mx-7 h-[800px] mt-[-50] pt-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
   <div className="flex justify-center justify-self-center text-xl xl:text-2xl 2xl:text-[32px] font-bold w-[180px] xl:w-[220px] 2xl:w-[250px] h-[42px] xl:h-[46px] 2xl:h-[50px] mx-auto ">
      <h1 className="truncate">Offices</h1>
    </div>
      <div className="w-full max-w-[1170px] h-auto mt-6 xl:mx-10 px-4">
        <div className="bg-[#292929] border border-white rounded-2xl p-4 flex flex-col h-[615px]">
          {/* Form Row - Single form that switches between Add and Edit */}
          <div className="mb-4">
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

                <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">Opens At</label>
                    <input
                        type="time"
                        className="w-[170px] px-3 py-2 text-black rounded"
                        value={editingOffice ? editForm.open_time : newOffice.open_time}
                        onChange={(e) => editingOffice
                            ? setEditForm({ ...editForm, open_time: e.target.value })
                            : setNewOffice({ ...newOffice, open_time: e.target.value })
                        }
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">Closes At</label>
                    <input
                        type="time"
                        className="w-[170px] px-3 py-2 text-black rounded"
                        value={editingOffice ? editForm.close_time : newOffice.close_time}
                        onChange={(e) => editingOffice
                            ? setEditForm({ ...editForm, close_time: e.target.value })
                            : setNewOffice({ ...newOffice, close_time: e.target.value })
                        }
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">Lunch Start</label>
                    <input
                        type="time"
                        className="w-[170px] px-3 py-2 text-black rounded"
                        value={editingOffice ? editForm.lunch_start : newOffice.lunch_start}
                        onChange={(e) => editingOffice
                            ? setEditForm({ ...editForm, lunch_start: e.target.value })
                            : setNewOffice({ ...newOffice, lunch_start: e.target.value })
                        }
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">Lunch End</label>
                    <input
                        type="time"
                        className="w-[170px] px-3 py-2 text-black rounded"
                        value={editingOffice ? editForm.lunch_end : newOffice.lunch_end}
                        onChange={(e) => editingOffice
                            ? setEditForm({ ...editForm, lunch_end: e.target.value })
                            : setNewOffice({ ...newOffice, lunch_end: e.target.value })
                        }
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">Office Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="w-[200px] px-3 py-2 text-white text-sm"
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                await handleImageUpload(file, !!editingOffice);
                            }
                        }}
                        disabled={uploadingImage}
                    />
                    {uploadingImage && (
                        <span className="text-xs text-gray-400 mt-1">Uploading...</span>
                    )}
                    {(editingOffice ? editOfficeImage : newOfficeImage) && (
                        <div className="mt-2">
                            <img 
                                src={editingOffice ? editOfficeImage : newOfficeImage} 
                                alt="Office preview" 
                                className="w-[200px] h-[120px] object-cover rounded border border-white"
                            />
                        </div>
                    )}
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

          <div className="mb-3">
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

          <div className="flex-1 bg-[#3C3C3C] border border-white/10 rounded-xl overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-white text-xl">Loading...</div>
              </div>
            ) : (
              <DataGrid 
                data={filteredOffices}
                columns={officeColumns}
                height="342px"
                className="text-white text-[14px] bg-[#292929]"
                showSearch={false}
                pageSize={4}
                onRowClick={(row) => {
                  if (row.image_url) {
                    setSelectedImage({ url: row.image_url, name: row.name });
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="bg-[#292929] rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-bold">{selectedImage.name}</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-white hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <img 
              src={selectedImage.url} 
              alt={selectedImage.name}
              className="max-w-full max-h-[70vh] rounded-lg"
            />
          </div>
        </div>
      )}
        <ConfirmationModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            onConfirm={confirmModal.onConfirm}
            title={confirmModal.title}
            message={confirmModal.message}
            type={confirmModal.type}
            confirmText={confirmModal.type === 'delete' ? 'Delete' : confirmModal.type === 'edit' ? 'Update' : 'Save'}
        />
      
   </div>
        </>
    )
}