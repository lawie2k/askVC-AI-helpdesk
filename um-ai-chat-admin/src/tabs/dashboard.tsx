import type { FC } from "react";

const Dashboard: FC = () => {
  return (
    <div className="min-h-screen bg-[#292929] text-white">
      <header className="px-12 py-3">
        <h1 className="text-[40px] font-extrabold">
          askVC <span className="text-[#900C27]">AI</span>
        </h1>
      </header>
      <main className="p-12">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="mt-4 text-[#cccccc]">Welcome, admin.</p>
      </main>
    </div>
  );
};

export default Dashboard;
