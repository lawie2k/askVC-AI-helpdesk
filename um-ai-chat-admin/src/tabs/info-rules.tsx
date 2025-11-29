import React, {useEffect, useState} from "react";
import { rulesAPI, visionMissionAPI, campusInfoAPI } from "../services/api";

const CATEGORY_SECTIONS = [
  {
    value: 'rules',
    label: 'Campus Rules',
    helper: 'Discipline guidelines, dress code, and policy reminders.',
    api: rulesAPI,
  },
  {
    value: 'vision_mission',
    label: 'UM Vision & Mission',
    helper: 'Official statements that define UM’s direction and goals.',
    api: visionMissionAPI,
  },
  {
    value: 'campus_info',
    label: 'UM Services & Info',
    helper: 'Processes like Form 1, semester schedules, and other FAQs.',
    api: campusInfoAPI,
  },
];

export default function RulesAndInfo () {
  const [entries, setEntries] = useState<Record<string, any[]>>({
    rules: [],
    vision_mission: [],
    campus_info: [],
  });
  const [loading, setLoading] = useState(false);
  const [newEntries, setNewEntries] = useState<Record<string, string>>({
    rules: '',
    vision_mission: '',
    campus_info: '',
  });
  const [editingRule, setEditingRule] = useState<any>(null);
  const [editText, setEditText] = useState('');
  const [activeTab, setActiveTab] = useState<string>(CATEGORY_SECTIONS[0].value);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const responses = await Promise.all(
        CATEGORY_SECTIONS.map(async (section) => {
          const data = await section.api.getAll();
          const normalized = (data || []).map((item: any) => ({
            ...item,
            category: section.value,
          }));
          return { category: section.value, data: normalized };
        })
      );
      const nextEntries: Record<string, any[]> = { rules: [], vision_mission: [], campus_info: [] };
      responses.forEach((item) => {
        nextEntries[item.category] = item.data;
      });
      setEntries(nextEntries);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getApiForCategory = (category: string) => {
    const section = CATEGORY_SECTIONS.find((s) => s.value === category);
    return section?.api || rulesAPI;
  };

  const handleAdd = async (category: string) => {
    const value = (newEntries[category] || '').trim();
    if (value === '') {
      alert('Please enter details before adding.');
      return;
    }

    try {
      setLoading(true);
      const api = getApiForCategory(category);
      await api.create({
        description: value,
        admin_id: 1,
      });
      await loadAll();
      setNewEntries((prev) => ({ ...prev, [category]: '' }));
    } catch (error) {
      console.error('Error adding entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (entry: any) => {
    setEditingRule(entry);
    setEditText(entry.description);
    setNewEntries((prev) => ({ ...prev, [entry.category]: entry.description }));
  };

  const handleUpdate = async () => {
    if (!editingRule) return;
    const value = (editText || '').trim();
    if (value === '') {
      alert('Please enter details before saving.');
      return;
    }

    try {
      setLoading(true);
      const api = getApiForCategory(editingRule.category);
      await api.update(editingRule.id, {
        description: value,
        admin_id: 1,
      });
      await loadAll();
      setEditingRule(null);
      setEditText('');
      setNewEntries((prev) => ({ ...prev, [editingRule.category]: '' }));
    } catch (error) {
      console.error('Error updating entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entry: any) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    try {
      setLoading(true);
      const api = getApiForCategory(entry.category);
      await api.delete(entry.id);
      await loadAll();
      if (editingRule?.id === entry.id) {
        setEditingRule(null);
        setEditText('');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    setEditText('');
    setNewEntries((prev) => ({ ...prev, [activeTab]: '' }));
  };

  return (
    <div className="flex flex-col 2xl:items-center bg-[#3C3C3C] mx-4 xl:mx-7 h-[800px]  pt-10 pb-8 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
      <div className="flex justify-center text-xl xl:text-2xl 2xl:text-[32px] font-bold w-full max-w-[400px] h-[40px] mx-auto">
        <h1 className="truncate">UM Info & Guidelines</h1>
      </div>

      <div className="w-full max-w-[1180px] mt-6 px-4 space-y-6">
        <div className="flex space-x-4 border-b border-white/10 pb-2">
          {CATEGORY_SECTIONS.map((section) => (
            <button
              key={section.value}
              className={`px-4 py-2 rounded-t-lg font-semibold ${
                activeTab === section.value
                  ? 'bg-[#900C27] text-white'
                  : 'bg-transparent text-gray-300 hover:text-white'
              }`}
              onClick={() => setActiveTab(section.value)}
            >
              {section.label}
            </button>
          ))}
        </div>

        {(() => {
          const activeSection = CATEGORY_SECTIONS.find((section) => section.value === activeTab);
          if (!activeSection) return null;
          const sectionEntries = entries[activeTab] || [];
          const isEditingInSection = editingRule?.category === activeTab;

            return (
            <div className="bg-[#292929] border border-white rounded-2xl p-4 flex flex-col h-[615px]">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-white text-xl">Loading...</div>
                  </div>
                ) : (
                  <>
                <div className="mb-3">
                <h2 className="text-white text-lg font-semibold">{activeSection.label}</h2>
                <p className="text-gray-300 text-sm">{activeSection.helper}</p>
                </div>

              <div className="mb-4">
                  <textarea
                    className="w-full h-24 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500"
                  placeholder={editingRule?.category === activeTab ? `Editing entry...` : `Add new ${activeSection.label.toLowerCase()}`}
                  value={editingRule?.category === activeTab ? editText : newEntries[activeTab]}
                    onChange={(e) => {
                      if (editingRule?.category === activeTab) {
                        setEditText(e.target.value);
                      } else {
                        setNewEntries((prev) => ({ ...prev, [activeTab]: e.target.value }));
                      }
                    }}
                  />
                  {editingRule?.category === activeTab ? (
                    <div className="flex gap-2 mt-2">
                      <button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
                        onClick={handleUpdate}
                      >
                        Save Changes
                      </button>
                      <button
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg"
                      onClick={() => handleAdd(activeTab)}
                    >
                      Add to {activeSection.label}
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {sectionEntries.length === 0 && (
                    <p className="text-gray-400 text-sm">No entries yet.</p>
                  )}

                  {sectionEntries.map((entry) => (
                    <div key={entry.id} className="bg-[#3C3C3C] rounded-xl px-3 py-3 text-white">
                      <p className="text-sm leading-relaxed whitespace-pre-line">{entry.description}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-300">
                        <span>
                          Added on{" "}
                          {entry.created_at
                            ? new Date(entry.created_at).toLocaleDateString()
                            : "N/A"}
                        </span>
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-full text-white"
                            onClick={() => handleStartEdit(entry)}
                            disabled={!!editingRule && editingRule.id !== entry.id}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-full text-white"
                            onClick={() => handleDelete(entry)}
                            disabled={!!editingRule}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {isEditingInSection && (
                  <p className="text-yellow-300 text-xs mt-2">
                    Editing entry in this section. Finish or cancel to add new items.
                  </p>
                )}
                  </>
                )}
              </div>
            );
        })()}
      </div>
    </div>
  );
}
