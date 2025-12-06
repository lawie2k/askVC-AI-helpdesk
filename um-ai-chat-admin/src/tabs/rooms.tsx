import React, { useEffect, useMemo, useState } from "react";
import DataGrid from "../components/DataGrid";
import { roomAPI, buildingAPI, uploadAPI } from "../services/api";
import ConfirmationModal from "../components/ConfirmationModal";

interface RoomForm {
  name: string;
  building_id: string;
  floor: string;
  type: string;
}

export default function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterRoomsById, setFilterRoomsById] = useState("");
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [newRoom, setNewRoom] = useState<RoomForm>({
    name: "",
    building_id: "",
    floor: "",
    type: "Lecture",
  });
  const [editForm, setEditForm] = useState<RoomForm>({
    name: "",
    building_id: "",
    floor: "",
    type: "Lecture",
  });
  const [newRoomImage, setNewRoomImage] = useState<string>("");
  const [editRoomImage, setEditRoomImage] = useState<string>("");
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
    loadRooms();
    loadBuildings();
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (filterRoomsById && String(room.building_id) !== filterRoomsById) return false;
      return true;
    });
  }, [rooms, filterRoomsById]);

  const loadBuildings = async () => {
    try {
      const buildingList = await buildingAPI.getAll();
      setBuildings(buildingList);
    } catch (error) {
      console.error("Error loading buildings:", error);
    }
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      const list = await roomAPI.getAll();
      setRooms(list);
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const roomColumns = [
    { field: "name", headerName: "Room Name", width: 150 },
    { field: "building_name", headerName: "Building", width: 150 },
    { field: "floor", headerName: "Floor", width: 120 },
    { field: "type", headerName: "Type", width: 120 },
    {
      field: "created_at",
      headerName: "Created At",
      width: 170,
      cellRenderer: (params: any) => {
        const value = params.value;
        if (!value) return "";
        try {
          return new Date(value).toLocaleString();
        } catch {
          return String(value);
        }
      },
    },
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
            onClick={() => deleteRoom(params.row.id)}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const hasRequiredValues = (form: RoomForm) =>
    ["name", "building_id", "floor"].every((key) => String(form[key as keyof RoomForm]).trim() !== "");

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
        setEditRoomImage(result.url);
      } else {
        setNewRoomImage(result.url);
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

  const addRoom = async () => {
    if (!hasRequiredValues(newRoom)) {
      alert("Please fill out all required fields.");
      return;
    }
    setConfirmModal({
      isOpen: true,
      type: 'save',
      title: 'Save Room',
      message: `Are you sure you want to save "${newRoom.name}"?`,
      onConfirm: async () => {
        try {
          setLoading(true);
          await roomAPI.create({
            ...newRoom,
            image_url: newRoomImage || null,
          });
          await loadRooms();
          setNewRoom({
            name: "",
            building_id: "",
            floor: "",
            type: "Lecture",
          });
          setNewRoomImage("");
        } catch (error) {
          console.error("Error adding room:", error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const startEdit = (room: any) => {
    setEditingRoom(room);
    setEditForm({
      name: room.name,
      building_id: room.building_id ? String(room.building_id) : "",
      floor: room.floor || "",
      type: room.type || "Lecture",
    });
    setEditRoomImage(room.image_url || "");
  };

  const cancelEdit = () => {
    setEditingRoom(null);
    setEditForm({
      name: "",
      building_id: "",
      floor: "",
      type: "Lecture",
    });
    setEditRoomImage("");
  };

  const saveEdit = async () => {
    if (!editingRoom) return;
    if (!hasRequiredValues(editForm)) {
      alert("Please fill out all required fields.");
      return;
    }
    setConfirmModal({
      isOpen: true,
      type: 'edit',
      title: 'Update Room',
      message: `Are you sure you want to update "${editForm.name}"?`,
      onConfirm: async () => {
        try {
          setLoading(true);
          await roomAPI.update(editingRoom.id, {
            ...editForm,
            image_url: editRoomImage || null,
          });
          await loadRooms();
          cancelEdit();
        } catch (error) {
          console.error("Error updating room:", error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const deleteRoom = async (id: number) => {
    const room = rooms.find(r => r.id === id);
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      title: 'Delete Room',
      message: `Are you sure you want to delete "${room?.name || 'this room'}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setLoading(true);
          await roomAPI.delete(id);
          await loadRooms();
        } catch (error) {
          console.error("Error deleting room:", error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const updateForm = (
    setter: React.Dispatch<React.SetStateAction<RoomForm>>,
    field: keyof RoomForm,
    value: string
  ) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const currentForm = editingRoom ? editForm : newRoom;
  const setCurrentForm = editingRoom ? setEditForm : setNewRoom;

  return (
    <div className="flex flex-col 2xl:items-center bg-[#3C3C3C] mx-4 xl:mx-7 h-[800px] mt-[-50] pt-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
      <div className="flex justify-center text-xl xl:text-2xl 2xl:text-[32px] font-bold w-[180px] xl:w-[220px] 2xl:w-[250px] h-[42px] xl:h-[46px] 2xl:h-[50px] mx-auto">
        <h1 className="truncate">Rooms</h1>
      </div>

      <div className="w-full max-w-[1170px] h-auto mt-6 xl:mx-10 px-4">
        <div className="bg-[#292929] border border-white rounded-2xl p-4 flex flex-col h-[615px]">
          <div className="mb-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col">
                <label className="text-white text-sm mb-1">Room Name</label>
                <input
                  type="text"
                  className="w-[200px] px-3 py-2 text-black rounded capitalize"
                  placeholder="Enter room name"
                  value={currentForm.name}
                  onChange={(e) => updateForm(setCurrentForm, "name", e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-white text-sm mb-1">Building</label>
                <select
                  className="w-[200px] px-3 py-2 text-black rounded"
                  value={currentForm.building_id}
                  onChange={(e) => updateForm(setCurrentForm, "building_id", e.target.value)}
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
                  value={currentForm.floor}
                  onChange={(e) => updateForm(setCurrentForm, "floor", e.target.value)}
                >
                  <option value="">--Select Floor--</option>
                  <option value="1st floor">1st floor</option>
                  <option value="2nd floor">2nd floor</option>
                  <option value="3rd floor">3rd floor</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-white text-sm mb-1">Type</label>
                <select
                  className="w-[200px] px-3 py-2 text-black rounded"
                  value={currentForm.type}
                  onChange={(e) => updateForm(setCurrentForm, "type", e.target.value)}
                >
                  <option value="Lecture">Lecture</option>
                  <option value="ComLab">ComLab</option>
                  <option value="Laboratory">Laboratory</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-white text-sm mb-1">Room Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-[200px] px-3 py-2 text-white text-sm"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await handleImageUpload(file, !!editingRoom);
                    }
                  }}
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <span className="text-xs text-gray-400 mt-1">Uploading...</span>
                )}
                {(editingRoom ? editRoomImage : newRoomImage) && (
                  <div className="mt-2">
                    <img 
                      src={editingRoom ? editRoomImage : newRoomImage} 
                      alt="Room preview" 
                      className="w-[200px] h-[120px] object-cover rounded border border-white"
                    />
                  </div>
                )}
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

          <div className="mb-3">
            <label className="text-white text-sm">Filter by Building</label>
            <select
              className="w-[200px] px-3 py-2 mt-1 text-black rounded"
              value={filterRoomsById}
              onChange={(e) => setFilterRoomsById(e.target.value)}
            >
              <option value="">All Buildings</option>
              {buildings.map((building: any) => (
                <option key={building.id} value={String(building.id)}>
                  {building.name}
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
                data={filteredRooms}
                columns={roomColumns}
                height="390px"
                className="text-white text-[14px] bg-[#292929]"
                showSearch={false}
                pageSize={9}
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
  );
}


