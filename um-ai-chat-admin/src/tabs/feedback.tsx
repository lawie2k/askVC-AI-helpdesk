import { useEffect, useState } from "react";
import DataGrid from "../components/DataGrid";
import { feedbackAPI } from "../services/api";

export default function FeedbackTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await feedbackAPI.getAll();
      setItems(data || []);
    } catch (err) {
      console.error("Failed to load feedback:", err);
      alert("Failed to load feedback. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 40 },
    {
      field: "created_at",
      headerName: "Date",
      width: 80,
      cellRenderer: ({ value }: any) => {
        if (!value) return "-";
        try {
          return new Date(value).toLocaleString();
        } catch {
          return String(value);
        }
      },
    },
    { field: "rating", headerName: "Rating", width: 50 },
    { field: "user_email", headerName: "Email (optional)", width: 100 },
    {
      field: "message",
      headerName: "Feedback",
      width: 200,
      cellRenderer: ({ value }: any) => (
        <span className="text-xs whitespace-pre-wrap break-words">{value}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col 2xl:items-center bg-[#3C3C3C] mx-4 xl:mx-7 h-[800px] pt-10 pb-8 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
      <div className="flex justify-center text-xl xl:text-2xl 2xl:text-[32px] font-bold w-[220px] h-[42px] mx-auto">
        <h1 className="truncate">Feedback</h1>
      </div>

      <div className="w-full max-w-[1180px] mt-6 px-4 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-200 text-sm">
            These are feedback messages sent from the mobile app.
          </p>
          <button
            onClick={load}
            className="px-3 py-1 rounded bg-[#900C27] text-white text-sm hover:bg-[#b51632]"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="flex-1 bg-[#292929] border border-white/10 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-[500px] text-white">
              Loading...
            </div>
          ) : (
            <DataGrid
              data={items}
              columns={columns}
              height="620px"
              className="text-white text-[12px] bg-[#292929]"
            />
          )}
        </div>
      </div>
    </div>
  );
}


