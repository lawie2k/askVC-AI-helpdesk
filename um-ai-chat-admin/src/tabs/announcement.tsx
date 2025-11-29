import React, {useEffect, useState} from "react";
import DataGrid from "../components/DataGrid";
import { announcementsAPI } from "../services/api";

export default function Announcement() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    description: ""
  });
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: ""
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const announcements = await announcementsAPI.getAll();
      setAnnouncements(announcements);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const announcementColumns = [
    {field: 'title', headerName: 'Title', width: 200},
    {field: 'description', headerName: 'Description', width: 400},
    {field: 'created_at', headerName: 'Created', width: 150, cellRenderer: (params: any) => {
      const v = params.value;
      if (!v) return '';
      try { return new Date(v).toLocaleDateString(); } catch { return String(v); }
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
            onClick={() => deleteAnnouncement(params.row.id)}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
          >
            Delete
          </button>
        </div>
      )
    },
  ];

  const addAnnouncement = async () => {
    try {
      const hasAllRequired = (values: Record<string, any>, required: string[]) => 
        required.every((k) => String(values[k] ?? '').trim() !== '');
      const required = ['title', 'description'];
      if (!hasAllRequired(newAnnouncement as any, required)) {
        alert('Please fill out all required fields.');
        return;
      }
      setLoading(true);
      await announcementsAPI.create(newAnnouncement);
      await loadAnnouncements();
      setNewAnnouncement({
        title: "",
        description: ""
      });
    } catch (error) {
      console.error('Error adding announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAnnouncement = async (id: number, updatedData: any) => {
    try {
      setLoading(true);
      await announcementsAPI.update(id, updatedData);
      await loadAnnouncements();
    } catch (error) {
      console.error('Error updating announcement:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteAnnouncement = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        setLoading(true);
        await announcementsAPI.delete(id);
        await loadAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const startEdit = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setEditForm({
      title: announcement.title,
      description: announcement.description || ""
    });
  };

  const cancelEdit = () => {
    setEditingAnnouncement(null);
    setEditForm({
      title: "",
      description: ""
    });
  };

  const saveEdit = async () => {
    try {
      const hasAllRequired = (values: Record<string, any>, required: string[]) => 
        required.every((k) => String(values[k] ?? '').trim() !== '');
      const required = ['title', 'description'];
      if (!hasAllRequired(editForm as any, required)) {
        alert('Please fill out all required fields.');
        return;
      }
      setLoading(true);
      await announcementsAPI.update(editingAnnouncement.id, editForm);
      await loadAnnouncements();
      cancelEdit();
    } catch (error) {
      console.error('Error updating announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className=" flex flex-col 2xl:items-center bg-[#3C3C3C] mx-4 xl:mx-7 h-[800px] mt-[-50] pt-10 overflow-y-hidden shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
        <div className="flex justify-center justify-self-center text-xl xl:text-2xl 2xl:text-[32px] font-bold w-[180px] xl:w-[220px] 2xl:w-[250px] h-[42px] xl:h-[46px] 2xl:h-[50px] mx-auto ">
          <h1 className="truncate">Announcement</h1>
        </div>
        <div className="w-full max-w-[1170px] h-auto mt-6 xl:mx-10 px-4">
          <div className="bg-[#292929] border border-white rounded-2xl p-4 flex flex-col h-[615px]">
            <div className="mb-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col">
                  <label className="text-white text-sm mb-1">Title</label>
                  <input 
                    type="text"
                    className="w-[200px] px-3 py-2 text-black rounded"
                    placeholder="Enter title" 
                    value={editingAnnouncement ? editForm.title : newAnnouncement.title}
                    onChange={(e) => editingAnnouncement 
                      ? setEditForm({ ...editForm, title: e.target.value })
                      : setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                    } 
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-white text-sm mb-1">Description</label>
                  <textarea
                    className="w-[400px] h-[40px] px-3 py-2 text-black rounded"
                    placeholder="Enter description"
                    value={editingAnnouncement ? editForm.description : newAnnouncement.description}
                    onChange={(e) => editingAnnouncement 
                      ? setEditForm({ ...editForm, description: e.target.value })
                      : setNewAnnouncement({ ...newAnnouncement, description: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col justify-end">
                  {editingAnnouncement ? (
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
                      onClick={addAnnouncement}
                    >
                      Add Record
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
                  data={announcements}
                  columns={announcementColumns}
                  height="520px"
                  className="text-white text-[14px] bg-[#292929]"
                  showSearch={false}
                  pageSize={14}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

