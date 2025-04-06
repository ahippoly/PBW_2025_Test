import Image from "next/image";
import { Logo } from "../Logo";
import GemWalletConnect from "./GemWalletConnect";

export default function Navbar() {
  return (
    <nav className="h-16 flex items-center justify-between px-4 bg-white shadow-md z-20">
      <div className="flex items-center relative">
        <Image className="" src="/Logo_and_text_horizontal_no_bg.svg" alt="logo" width={250} height={100} />
      </div>
      <GemWalletConnect />
    </nav>
  );
}
