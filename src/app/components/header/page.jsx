import Image from "next/image";

export default function Header() {
  return (
    <header className="flex justify-center items-center px-8 py-5 bg-[#0c0c0d] w-full">
      
      <div className="flex items-center gap-0.5">
        
        <div className="relative w-[2000px] h-[100px] flex items-center justify-center">
          <Image
            src="/logowithname.png" 
            alt="Delights Logo"
            width={200}
            height={100}
            className="object-contain"
            priority
          />
        </div>
        
        {/* <span className="text-5xl font-bold tracking-wider text-[#e5b83b] font-sans">
          DELIGHTS
        </span> */}
      </div>

    </header>
  );
}