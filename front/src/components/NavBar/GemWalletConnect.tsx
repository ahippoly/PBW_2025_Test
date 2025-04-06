import { useWalletStore } from "@/store/WalletStore";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";

function GemWalletConnect() {
  const { address, isConnected, isConnecting, error, connectWallet, disconnectWallet } = useWalletStore();

  useEffect(() => {
    connectWallet();
  }, []);

  const LoggedView = () => {
    // Get first 5 characters of the address for display
    const shortAddress = address ? `${address.substring(0, 5)}...` : "";
    // Generate initials for fallback (first 2 chars)
    const initials = address ? address.substring(0, 2).toUpperCase() : "";

    return (
      <div className="flex items-center gap-2 rounded-full p-1 px-3">
        <Avatar className="h-8 w-8 border-2 border-primary">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">{initials}</AvatarFallback>
        </Avatar>
        <p className="text-sm font-medium">{address}</p>
        <Button variant="outline" onClick={disconnectWallet}>
          Logout
        </Button>
      </div>
    );
  };

  const NotLoggedView = () => {
    return <Button onClick={connectWallet}>Connect</Button>;
  };

  return <div className="ml-auto">{isConnected ? <LoggedView /> : <NotLoggedView />}</div>;
}

export default GemWalletConnect;
