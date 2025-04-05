// components/MapView.tsx
"use client";

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapViewProps {
  apiKey: string;
  width?: string;
  height?: string;
}

const MapView: React.FC<MapViewProps> = ({ apiKey, width = "100%", height = "500px" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // Paris coordinates
  const center = { lng: 2.3522, lat: 48.8566 };
  const zoom = 6;

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`,
      center: [center.lng, center.lat],
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add marker for Paris
    new maplibregl.Marker().setLngLat([center.lng, center.lat]).addTo(map.current);

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [apiKey]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: width,
        height: height,
        borderRadius: "8px",
      }}
    />
  );
};

export default MapView;
