export default function Reports() {
  return (
    <>
      <div className="bg-[#3C3C3C] w-[1100px] h-[800px] p-4">
        {/* Title */}
        <div className="flex justify-center mb-4">
          <h1 className="text-white text-xl">Reports</h1>
        </div>

        {/* Main content box */}
        <div className="w-[1025px] h-[650px] bg-[#2A2A2A] p-4">
          <p className="text-gray-300">
            Here you can view and generate reports.
          </p>
        </div>

        {/* Button */}
        <div className="mt-4">
          <button className="w-[150px] h-[40px] bg-blue-600 hover:bg-blue-700 text-white rounded">
            Reports
          </button>
        </div>
      </div>
    </>
  )
}
