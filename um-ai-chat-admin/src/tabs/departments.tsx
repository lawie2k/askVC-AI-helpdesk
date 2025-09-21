

export default function Departments() {
    return (
        <>
         <div className="bg-[#3C3C3C] w-[1250px] h-[800px] mt-[-50] pt-10 shadow-[0px_-1px_29px_4px_rgba(0,_0,_0,_0.8)]">
    <div className="flex justify-center justify-self-center text-[32px] font-bold bg-[#900C27] rounded-full w-[250px] h-[50px] ">
      <h1 className="">Departments</h1>
    </div>
      <div className="w-[1170px] h-[650px]  mt-12 mx-10 flex-col ">
        <input type="text" className="w-[200px] mr-2 px-2 text-black" placeholder="department name" />
        <input type="text" className="w-[200px] mr-2 px-2 text-black" placeholder="short name"/>
        

        <button className="w-[150px] h-[25px] bg-green-600 ml-2">add Record</button>
        <div className="w-full h-[600px] bg-[#3C3C3C] mt-3 border-white border-2 rounded-lg flex justify-center ">
          <div className="w-full h-[100px] bg-[#292929] border-white border-2 mt-4 mx-2">

          </div>

        </div>
      </div>
        
      
   </div>
        </>
    )
}