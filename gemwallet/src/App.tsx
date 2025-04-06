import { useState } from 'react'
import { connectGemWallet, fetchNFTInfo, fetchNFTs, mintNewNFT, createOfferNft, buyNFT } from './gemwallet'
import './App.css'


function App() {
  const [count, setCount] = useState(0)
  const [address, setAddress] = useState("")
  const [gpsNft, setGPSNft] = useState("")
  const [surfaceNft, setSurfaceNft] = useState("")
  const [refCatNft, setRefCatNft] = useState("")
  const [priceNft, setPriceNft] = useState("")
  const [nftID, setNftID] = useState("")
  const [nftID2, setNftID2] = useState("")
  const [nftID3, setNftID3] = useState("")


  const handleConnect = async () => {
    const address = await connectGemWallet()
    console.log("Connected address:", address)
    if (!address) {
      alert("GemWallet connection failed");
      return;
    }
    setAddress(address)
    console.log("Connected address:", address)
  }



  const fetchNFT = async (nftID: string) => {
    const result = await fetchNFTInfo(nftID);
    uiConsole(result);
  };

  const fetchNFTsInfo = async () => {

    const result = await fetchNFTs();
    uiConsole(result);
  };

  const mintNFT = async (nftData: any) => {
    const result = await mintNewNFT(nftData);
    uiConsole(result);
  };

  const sellNFT = async () => {
    const result = await createOfferNft(priceNft, nftID2, address);
    uiConsole(result);
  };

  const buyNft = async () => {
    const result = await buyNFT(nftID3, address);
    uiConsole(result);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  return (
    <>
      <div className="flex-container">
      <button onClick={handleConnect} className="card">
        Connecter GemWallet
      </button>
       
        <div>
          <button onClick={fetchNFTsInfo} className="card">
            Fetch all NFTs
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5em", maxWidth: "300px" }}>
        <button onClick={() => fetchNFT(nftID)} className="card" style={{ marginBottom: 0 }}>
          Fetch NFT
        </button>
        <input
          type="text"
          placeholder="Enter NFT ID"
          value={nftID}
          onChange={(e) => setNftID(e.target.value)}
          style={{ padding: "0.5em", width: "100%" }}
        />

        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5em", maxWidth: "300px" }}>
        <button onClick={() => mintNFT({"gpsNft": gpsNft, "surfaceNft": surfaceNft, "refCatNft": refCatNft, "address" : address})} className="card" style={{ marginBottom: 0 }}>
          Mint NFT
        </button>
        <input
          type="text"
          placeholder="Enter gps NFT"
          value={gpsNft}
          onChange={(e) => setGPSNft(e.target.value)}
          style={{ padding: "0.5em", width: "100%" }}
        />
        <input
          type="text"
          placeholder="Enter surface NFT"
          value={surfaceNft}
          onChange={(e) => setSurfaceNft(e.target.value)}
          style={{ padding: "0.5em", width: "100%" }}
        />
        <input
          type="text"
          placeholder="Enter reference cad NFT"
          value={refCatNft}
          onChange={(e) => setRefCatNft(e.target.value)}
          style={{ padding: "0.5em", width: "100%" }}
        />

        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5em", maxWidth: "300px" }}>
        <button onClick={sellNFT} className="card" style={{ marginBottom: 0 }}>
          Sell NFT
        </button>
        <input
          type="text"
          placeholder="Enter NFT id"
          value={nftID2}
          onChange={(e) => setNftID2(e.target.value)}
          style={{ padding: "0.5em", width: "100%" }}
        />
        <input
          type="text"
          placeholder="Enter price NFT"
          value={priceNft}
          onChange={(e) => setPriceNft(e.target.value)}
          style={{ padding: "0.5em", width: "100%" }}
        />

        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5em", maxWidth: "300px" }}>
        <button onClick={buyNft} className="card" style={{ marginBottom: 0 }}>
          Buy NFT
        </button>
        <input
          type="text"
          placeholder="Enter NFT id"
          value={nftID3}
          onChange={(e) => setNftID3(e.target.value)}
          style={{ padding: "0.5em", width: "100%" }}
        />

        </div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
      </div>
    </>
  );

}

export default App;
