import { BrickWall } from "lucide-react";

const Header = () => {
  return (
    <header className="h-14 outline-1 px-5 outline-stone-200 flex items-center justify-between">
      <div className="flex items-center  gap-x-2.5">
        <div className="p-2 bg-stone-100 rounded-sm">
          <BrickWall className="text-stone-800" />
        </div>
        <div className="text-sm">
          <p className="font-semibold">Report Builder</p>
          <p className="text-xs">Define your report</p>
        </div>
      </div>
      <div>Selection information</div>
    </header>
  );
};

export default Header;
