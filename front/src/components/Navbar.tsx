import Image from "next/image";
import { Logo } from "./Logo";

export default function Navbar() {
  return (
    <nav className="h-16 flex items-center px-4 bg-white shadow-md z-20">
      <Image className="h-full w-auto p-4" src="/Logo_and_text_horizontal_no_bg.svg" alt="logo" width={100} height={100} />
    </nav>
  );
}
