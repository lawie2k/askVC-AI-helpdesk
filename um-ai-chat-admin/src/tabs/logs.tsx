
export default function logs (){
    return (
        <>
       <div className="bg-[#3C3C3C] w-[1100px] h-[800px] p-4">
        <div className="flex justify-center mb-4">
          <h1 className="text-white text-xl">Logs</h1>
        </div>

        <div className="w-[1025px] h-[650px] bg-[#2A2A2A] p-4">
          <p className="text-gray-300">
            admin Kenneth is logged this week
          </p>
        </div>

        <div className="mt-4">
          <button className="w-[150px] h-[40px] bg-red-600 hover:bg-red-700 text-white rounded">
            Logs
          </button>
        </div>
      </div>
        </>
    )
}