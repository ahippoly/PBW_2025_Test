import MapView from "@/components/MapView";

function MapPage() {
  const MAP_TILLER_TOKEN: string = process.env.NEXT_PUBLIC_MAPTILLER_API_KEY || "your_mapbox_access_token_here";
  return (
    <div>
      <MapView apiKey={MAP_TILLER_TOKEN} />
    </div>
  );
}

export default MapPage;
