"use client";

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface ParcelData {
  id: string;
  // Add other properties your parcels might have
}

interface MapComponentProps {
  highlightedParcels: ParcelData[];
  tileJsonUrl: string; // TileJSON URL instead of XYZ template
  center: [number, number];
  zoom: number;
}

const MapComponent: React.FC<MapComponentProps> = ({ highlightedParcels, tileJsonUrl, center = [0, 0], zoom = 10 }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize the map with a minimal style
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {},
        layers: [],
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
      },
      center: center,
      zoom: zoom,
    });

    mapRef.current = map;

    // Fetch the TileJSON definition
    fetch(tileJsonUrl)
      .then((response) => response.json())
      .then((tileJson) => {
        map.on("load", () => {
          // Add the vector source from TileJSON
          map.addSource("cadastre-source", {
            type: "vector",
            tiles: tileJson.tiles,
            minzoom: tileJson.minzoom || 0,
            maxzoom: tileJson.maxzoom || 22,
            attribution: tileJson.attribution,
          });

          // Determine the source layer name from TileJSON or use default
          const sourceLayer = tileJson.vector_layers?.[0]?.id || "parcels";

          // Convert highlighted parcel IDs to a format usable in the filter
          const highlightedParcelIds = highlightedParcels.map((parcel) => parcel.id);

          // Add the base cadastre layer (gray)
          map.addLayer({
            id: "cadastre-parcels",
            type: "fill",
            source: "cadastre-source",
            "source-layer": sourceLayer,
            paint: {
              "fill-color": "#cccccc",
              "fill-opacity": 0.7,
              "fill-outline-color": "#999999",
            },
            filter: ["!", ["in", ["get", "id"], ["literal", highlightedParcelIds]]],
          });

          // Add the highlighted parcels layer (blue)
          map.addLayer({
            id: "highlighted-parcels",
            type: "fill",
            source: "cadastre-source",
            "source-layer": sourceLayer,
            paint: {
              "fill-color": "#0066ff",
              "fill-opacity": 0.7,
              "fill-outline-color": "#0044cc",
            },
            filter: ["in", ["get", "id"], ["literal", highlightedParcelIds]],
          });

          // Add parcel outlines for better visibility
          map.addLayer({
            id: "parcel-outlines",
            type: "line",
            source: "cadastre-source",
            "source-layer": sourceLayer,
            paint: {
              "line-color": "#000000",
              "line-width": 1,
            },
          });
        });
      })
      .catch((error) => {
        console.error("Error loading TileJSON:", error);
      });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [tileJsonUrl, center, zoom]);

  // Update the map when highlighted parcels change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getSource("cadastre-source")) return;

    const highlightedParcelIds = highlightedParcels.map((parcel) => parcel.id);

    // Update the filters for both layers
    // map.setFilter("cadastre-parcels", ["!", ["in", ["get", "id"], ["literal", highlightedParcelIds]]]);
    // map.setFilter("highlighted-parcels", ["in", ["get", "id"], ["literal", highlightedParcelIds]]);
  }, [highlightedParcels]);

  return <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />;
};

export default MapComponent;
