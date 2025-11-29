import React, { useEffect, useMemo, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { roomAPI, logsAPI, professorAPI, statsAPI } from "../services/api";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);


export default function Dashboard() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [logs, setLogs] = useState([]);
    const [topQuestions, setTopQuestions] = useState<{ question: string; count: number }[]>([]);
    const [professors, setProfessors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
       loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try{
            setLoading(true);
            setError(null);
            
            // Load each data source independently to prevent one failure from breaking others
            const loadRooms = roomAPI.getAll().catch(err => { console.error('Failed to load rooms:', err); return []; });
            const loadLogs = logsAPI.getAll().catch(err => { console.error('Failed to load logs:', err); return []; });
            const loadProfessors = professorAPI.getAll()
                .then(data => {
                    console.log('✅ Professors loaded successfully:', { count: Array.isArray(data) ? data.length : 0, data });
                    return Array.isArray(data) ? data : [];
                })
                .catch(err => { 
                    console.error('❌ Failed to load professors:', err); 
                    setError(`Failed to load professors: ${err?.message || 'Unknown error'}`);
                    return []; 
                });
            const loadTopQuestions = statsAPI.getTopQuestions().catch(err => { 
                console.error('Failed to load top questions:', err); 
                return []; 
            });
            
            const [roomsData, logsData, professorsData, topQuestionsData] = await Promise.all([
                loadRooms,
                loadLogs,
                loadProfessors,
                loadTopQuestions
            ]);
            
            const finalProfessors = Array.isArray(professorsData) ? professorsData : [];
            console.log('📊 Dashboard data loaded:', { 
                roomsCount: Array.isArray(roomsData) ? roomsData.length : 0, 
                logsCount: Array.isArray(logsData) ? logsData.length : 0, 
                professorsCount: finalProfessors.length, 
                topQuestionsCount: Array.isArray(topQuestionsData) ? topQuestionsData.length : 0,
                professorsSample: finalProfessors.slice(0, 3),
                allProfessors: finalProfessors
            });
            
            console.log('🎯 Setting professors state with:', finalProfessors.length, 'professors');
            setRooms(Array.isArray(roomsData) ? roomsData : []);
            setLogs(Array.isArray(logsData) ? logsData : []);
            setProfessors(finalProfessors);
            setTopQuestions(Array.isArray(topQuestionsData) ? topQuestionsData : []);
        }catch(error){
            console.error('Error loading dashboard data:', error);
            setError('Failed to load dashboard data. Please check your connection and try again.');
        }finally{
            setLoading(false);
        }
    };

    const chartTextColor = "#F5F5F5";

    const roomsByType = useMemo(() => {
        const counts: Record<string, number> = {};
        rooms.forEach((room: any) => {
            const key = room?.type?.trim() || "Unspecified";
            counts[key] = (counts[key] || 0) + 1;
        });
        const labels = Object.keys(counts);
        return {
            labels,
            datasets: [
                {
                    label: "Rooms",
                    data: labels.map((label) => counts[label]),
                    backgroundColor: "#60A5FA",
                    borderRadius: 6,
                },
            ],
        };
    }, [rooms]);

    const questionsChartData = useMemo(() => {
        if (!topQuestions || topQuestions.length === 0) {
            return { labels: [], datasets: [] };
        }

        const labels = topQuestions.map((q) => {
            const words = (q.question || "").split(/\s+/).filter(Boolean);
            if (words.length <= 3) return words.join(" ");
            return words.slice(0, 3).join(" ") + " ...";
        });

        return {
            labels,
            datasets: [
                {
                    label: "Questions",
                    data: topQuestions.map((q) => q.count),
                    backgroundColor: "#34D399",
                    borderRadius: 6,
                },
            ],
        };
    }, [topQuestions]);

    const logsByDay = useMemo(() => {
        const counts: Record<string, number> = {};
        logs.forEach((log: any) => {
            const isoDate = log?.created_at ? new Date(log.created_at).toISOString().split("T")[0] : "Unknown";
            counts[isoDate] = (counts[isoDate] || 0) + 1;
        });
        const labels = Object.keys(counts).sort();
        return {
            labels: labels.map((date) => new Date(date).toLocaleDateString()),
            datasets: [
                {
                    label: "Admin actions",
                    data: labels.map((label) => counts[label]),
                    borderColor: "#F472B6",
                    backgroundColor: "rgba(244,114,182,0.25)",
                    tension: 0.35,
                    pointRadius: 4,
                    fill: true,
                },
            ],
        };
    }, [logs]);

    const professorsByProgram = useMemo(() => {
        console.log('Processing professors for chart:', { professors, count: professors?.length });
        
        if (!professors || professors.length === 0) {
            console.log('No professors found, returning empty chart');
            return {
                labels: ["No professors"],
                datasets: [{
                    label: "Professors",
                    data: [0],
                    backgroundColor: ["#6B7280"],
                    borderWidth: 0,
                }],
            };
        }
        
        const counts: Record<string, number> = {};
        professors.forEach((prof: any) => {
            const programValue = prof?.program;
            const key = (programValue && String(programValue).trim()) ? String(programValue).trim() : "Unassigned";
            counts[key] = (counts[key] || 0) + 1;
        });
        const labels = Object.keys(counts);
        const palette = ["#FBBF24", "#A78BFA", "#FB7185", "#4ADE80", "#22D3EE", "#F472B6", "#C084FC"];
        
        const chartData = {
            labels: labels.length > 0 ? labels : ["Unassigned"],
            datasets: [
                {
                    label: "Professors",
                    data: labels.length > 0 ? labels.map((label) => counts[label]) : [professors.length],
                    backgroundColor: labels.length > 0 
                        ? labels.map((_, idx) => palette[idx % palette.length])
                        : ["#6B7280"],
                    borderWidth: 0,
                },
            ],
        };
        
        console.log('Professors by program chart data:', { 
            professorsCount: professors.length, 
            counts, 
            labels,
            chartData
        });
        
        return chartData;
    }, [professors]);

    const baseAxisOptions = {
        ticks: { color: chartTextColor, font: { size: 12 } },
        grid: { color: "rgba(255,255,255,0.12)", drawBorder: false },
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#0F172A",
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            x: baseAxisOptions,
            y: { ...baseAxisOptions, beginAtZero: true, ticks: { ...baseAxisOptions.ticks, precision: 0 } },
        },
    };

    const questionsBarOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#0F172A",
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (ctx: any) => {
                            const fullQuestion = topQuestions[ctx.dataIndex]?.question || "";
                            const count =
                                typeof ctx.parsed === "number"
                                    ? ctx.parsed
                                    : ctx.parsed?.y ?? "";
                            return fullQuestion ? `${fullQuestion} (${count})` : `${count}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    ...baseAxisOptions,
                    ticks: {
                        ...baseAxisOptions.ticks,
                        maxRotation: 0,
                        minRotation: 0,
                    },
                },
                y: {
                    ...baseAxisOptions,
                    beginAtZero: true,
                    ticks: { ...baseAxisOptions.ticks, precision: 0 },
                },
            },
        }),
        [baseAxisOptions, topQuestions]
    );

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: chartTextColor },
            },
            tooltip: {
                backgroundColor: "#0F172A",
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            x: baseAxisOptions,
            y: { ...baseAxisOptions, beginAtZero: true },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: { color: chartTextColor },
            },
        },
        cutout: "55%",
    };

    const renderChartOrEmpty = (hasData: boolean, chart: React.ReactNode) => {
        if (loading) {
            return <div className="flex justify-center items-center h-full text-white">Loading...</div>;
        }
        if (!hasData) {
            return <div className="flex justify-center items-center h-full text-gray-300 text-sm opacity-80">No data available</div>;
        }
        return chart;
    };

  return <>
      <div className=" flex flex-col bg-[#3C3C3C] mx-4 xl:mx-7 h-[800px] mt-[-50] pt-10 overflow-scroll 2xl:items-center  shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
          <div className="flex justify-center justify-self-center text-xl xl:text-2xl 2xl:text-[32px] font-bold w-[180px] xl:w-[220px] 2xl:w-[250px] h-[42px] xl:h-[46px] 2xl:h-[50px] mx-auto">
              <h1 className="truncate">Dashboard</h1>
            </div>
          {error && (
            <div className="w-full max-w-[1170px] xl:mx-10 mt-4 px-4 p-4 bg-red-600 text-white rounded-lg flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={loadDashboardData}
                className="bg-white text-red-600 px-4 py-2 rounded hover:bg-gray-100"
              >
                Retry
              </button>
            </div>
          )}
          <div className="w-full max-w-[1170px] h-[660px] mt-6 xl:mx-10 px-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="w-full h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg p-4">
                  <h2 className="text-white font-semibold text-lg mb-2">Rooms by type</h2>
                  {renderChartOrEmpty(
                      roomsByType.labels.length > 0,
                      <div className="h-[240px]">
                          <Bar data={roomsByType} options={barOptions} />
      </div>
    )}
</div>
              <div className="w-full h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg p-4">
                  <h2 className="text-white font-semibold text-lg mb-2">Admin activity (last 7 days)</h2>
                  {renderChartOrEmpty(
                      logsByDay.labels.length > 0,
                      <div className="h-[240px]">
                          <Line data={logsByDay} options={lineOptions} />
                    </div>
                  )}
              </div>
              <div className="w-full h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg p-4">
                  <h2 className="text-white font-semibold text-lg mb-2">Most asked questions</h2>
                  {renderChartOrEmpty(
                      questionsChartData.labels.length > 0,
                      <div className="h-[240px]">
                          <Bar data={questionsChartData} options={questionsBarOptions} />
                    </div>
                  )}
              </div>
              <div className="w-full h-[330px] bg-[#3C3C3C] border-white border-2 rounded-lg p-4">
                  <h2 className="text-white font-semibold text-lg mb-2">
                      Professors by program ({professors.length} total)
                  </h2>
                  {loading ? (
                      <div className="flex justify-center items-center h-[240px] text-white">Loading...</div>
                  ) : professors.length === 0 ? (
                      <div className="flex justify-center items-center h-[240px] text-gray-300 text-sm opacity-80">
                          No professors data available. Check console for errors.
                      </div>
                  ) : professorsByProgram.labels.length === 0 || (professorsByProgram.labels.length === 1 && professorsByProgram.labels[0] === "No professors") ? (
                      <div className="flex justify-center items-center h-[240px] text-gray-300 text-sm opacity-80">
                          No program data to display
                    </div>
                  ) : (
                      <div className="h-[240px] flex items-center justify-center">
                          <Doughnut data={professorsByProgram} options={doughnutOptions} />
                      </div>
                  )}
              </div>
          </div>
      </div>
  </>;
}
