"use client";

import React, { useRef, useEffect } from "react";
import maplibregl, { Map, LngLatBoundsLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const CadastreMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const tilesJsonUrl = `https://api.maptiler.com/tiles/fr-cadastre/tiles.json?key=${process.env.NEXT_PUBLIC_MAPTILLER_API_KEY}`; // Replace with your actual URL

    const parisCenter = [2.3522, 48.8566]; // Longitude, Latitude
    const maxBounds: LngLatBoundsLike = [
      [2.2241, 48.8156], // Southwest coordinates
      [2.4699, 48.9022], // Northeast coordinates
    ];

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: tilesJsonUrl,
      center: [2.3522, 48.8566],
      zoom: 13,
      maxBounds: maxBounds,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "100vh" }} />;
};

export default CadastreMap;
