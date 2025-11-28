import React, { useEffect, useMemo, useState } from "react";
import DataGrid from "../components/DataGrid";
import { roomAPI, buildingAPI } from "../services/api";

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

  const addRoom = async () => {
    if (!hasRequiredValues(newRoom)) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      setLoading(true);
      await roomAPI.create(newRoom);
      await loadRooms();
      setNewRoom({
        name: "",
        building_id: "",
        floor: "",
        type: "Lecture",
      });
    } catch (error) {
      console.error("Error adding room:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (room: any) => {
    setEditingRoom(room);
    setEditForm({
      name: room.name,
      building_id: room.building_id ? String(room.building_id) : "",
      floor: room.floor || "",
      type: room.type || "Lecture",
    });
  };

  const cancelEdit = () => {
    setEditingRoom(null);
    setEditForm({
      name: "",
      building_id: "",
      floor: "",
      type: "Lecture",
    });
  };

  const saveEdit = async () => {
    if (!editingRoom) return;
    if (!hasRequiredValues(editForm)) {
      alert("Please fill out all required fields.");
      return;
    }
    try {
      setLoading(true);
      await roomAPI.update(editingRoom.id, editForm);
      await loadRooms();
      cancelEdit();
    } catch (error) {
      console.error("Error updating room:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      setLoading(true);
      await roomAPI.delete(id);
      await loadRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
    } finally {
      setLoading(false);
    }
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

      <div className="w-full max-w-[1170px] h-auto mt-6 xl:mx-10 px-4 flex flex-col">
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

        <div className="flex items-center gap-3 mt-3">
          <div className="flex flex-col">
            <label className="text-white text-sm">Filter by Building</label>
            <select
              className="w-[200px] px-3 py-2 text-black rounded"
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
  );
}


