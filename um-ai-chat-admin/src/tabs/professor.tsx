export default function professor(){
    return (
        <>
        <div className="bg-[#3C3C3C] w-[1100px] h-[800px] mt-[-50] pt-10">
    <div className="flex justify-center justify-self-center text-[32px] font-bold bg-[#900C27] rounded-full w-[250px] h-[50px] ">
      <h1 className="">Professor</h1>
    </div>
      <div className="w-[1025px] h-[650px]  mt-12 mx-10 flex-col ">
        <input type="text" className="w-[100px] mr-2 text-black" placeholder="name" />
        <input type="text" className="w-[100px] mr-2 text-black" placeholder="position"/>
        <input type="text" className="w-[100px] mr-2 text-black" placeholder="email"/>
        <input type="text" className="w-[100px] mr-2 text-black" placeholder="department"/>

        <button className="w-[150px] h-[25px] bg-green-600 ml-2">add Record</button>
        <div className="w-[1025px] h-[600px] bg-[#3C3C3C] mt-3 border-white border-2 rounded-lg flex justify-center ">
          <div className="w-[1000px] h-[100px] bg-[#292929] border-white border-2 mt-4">

          </div>

        </div>
      </div>
        
      
   </div>
        </>
    )
}