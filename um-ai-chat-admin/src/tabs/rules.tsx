import React, {useEffect, useState} from "react";
import DataGrid from "../components/DataGrid";
import { rulesAPI } from "../services/api";

export default function rules () {
  const [rules, setRules] = useState<any[]>([]);
  const [loading,setloading] = useState(false);
  const [newrule,setnewrule] = useState('');
  const [editingRule, setEditingRule] = useState<any>(null);
  const [editDescription, setEditDescription] = useState('');


  useEffect(() => {
    loadRules();
  }, []);
  const loadRules = async () => {
    try {
      setloading(true);
      console.log('Loading rules...');
      const rules = await rulesAPI.getAll();
      console.log('Rules loaded:', rules);
      setRules(rules);
    } catch (error) {
      console.error('Error loading rules:', error);
    } finally {
      setloading(false);
    }
  }
  const ruleColumns = [
    {field: 'description', headerName: 'Description', width: 300},
    {field: 'created_at', headerName: 'Created', width: 50},
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
            onClick={() => deleteRule(params.row.id)}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
          >
            Delete
          </button>
        </div>
      )
    },
  ];
    const addRule = async () => {
      try{
        setloading(true);
        console.log('Adding rule:', newrule);
        const response = await rulesAPI.create({
          description: newrule,
          admin_id: 1 // Default admin ID
        });
        console.log('API response:', response);
        
        // Reload all rules to get the updated list
        await loadRules();
        setnewrule('');
      }catch(error){
        console.error('Error adding rule:', error);
      }finally{
        setloading(false);
      }
    }

    const updateRule = async () => {
      try{
        setloading(true);
        console.log('Updating rule:', editingRule.id, editDescription);
        await rulesAPI.update(editingRule.id, {
          description: editDescription,
          admin_id: 1
        });
        
        // Reload all rules to get the updated list
        await loadRules();
        setEditingRule(null);
        setEditDescription('');
      }catch(error){
        console.error('Error updating rule:', error);
      }finally{
        setloading(false);
      }
    }

    const deleteRule = async (id: number) => {
      if (window.confirm('Are you sure you want to delete this rule?')) {
        try{
          setloading(true);
          console.log('Deleting rule:', id);
          await rulesAPI.delete(id);
          
          // Reload all rules to get the updated list
          await loadRules();
        }catch(error){
          console.error('Error deleting rule:', error);
        }finally{
          setloading(false);
        }
      }
    }

    const startEdit = (rule: any) => {
      setEditingRule(rule);
      setEditDescription(rule.description);
    }

    const cancelEdit = () => {
      setEditingRule(null);
      setEditDescription('');
    }

    return (
   <>
   <div className="bg-[#3C3C3C] w-[1250px] h-[800px] mt-[-50] pt-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
    <div className="flex justify-center justify-self-center text-[32px] font-bold bg-[#900C27] rounded-full w-[250px] h-[50px] ">
      <h1 className="">Rules</h1>
    </div>
      <div className="w-[1170px] h-[650px]  mt-6 mx-10 flex-col">
        <div className="flex space-x-4 mb-3">
          <div className="flex-1">
            <label className="text-white text-sm font-semibold mb-1 block">Add New Rule</label>
            <div className="flex space-x-2">
              <input 
                type="text"
                className="flex-1 px-3 py-2 text-black rounded"
                placeholder="Add new rule description"
                value={newrule}
                onChange={(e) => setnewrule(e.target.value)}
                disabled={!!editingRule}
              />
              <button 
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold"
                onClick={addRule}
                disabled={!!editingRule}
              >
                Add
              </button>
            </div>
          </div>

          {/* Update Rule Section */}
          {editingRule && (
            <div className="flex-1">
              <label className="text-white text-sm font-semibold mb-1 block">Edit Rule</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 text-black rounded"
                  placeholder="Edit rule description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <button
                  onClick={updateRule}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
                >
                  Update
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="w-full h-[590px] bg-[#3C3C3C] mt-3 border-white border-2 rounded-lg flex justify-center overflow-y-auto ">
        {loading ? (
              <div className="flex justify-center items-center">
                <div className="text-white">Loading...</div>
              </div>
            ) : (
              <DataGrid data={rules}
              columns={ruleColumns}
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
