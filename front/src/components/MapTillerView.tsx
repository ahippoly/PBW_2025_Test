"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import * as maptilersdk from "@maptiler/sdk";
// We need to import the SDK dynamically to avoid SSR issues

interface MapViewProps {
  apiKey: string;
  center?: [number, number];
  zoom?: number;
  parcels: Parcel[];
  userAddress?: string;
  onParcelSelect?: (parcelProperties: any) => void;
  testMode?: boolean;
  selectedMapTillerId: string | null;
  onMapTillerIdSelect: (mapTillerId: string | null) => void;
}

const ParcelColorPerType = {
  minted: "#90EE90",
  // mintable: "#808080",
  minted_buyable: "#006400",
  invalid: "#ff0000",
  my: "#1E90FF",
};

const MapTillerView: React.FC<MapViewProps> = ({
  apiKey,
  center = [48.676165558055494, 1.9618325878575087].reverse(),
  zoom = 18,
  parcels = [],
  userAddress,
  onParcelSelect,
  testMode = false,
  selectedMapTillerId,
  onMapTillerIdSelect,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [hoveredParcelId, setHoveredParcelId] = useState<string | null>(null);

  // Refs for popup elements
  const hoverPopupRef = useRef<HTMLDivElement>(null);
  const pinnedPopupRef = useRef<HTMLDivElement>(null);

  // Organize parcels by type for efficient filtering
  const parcelsByType = useMemo(() => {
    const result = {
      minted: [] as string[],
      mintable: [] as string[],
      minted_buyable: [] as string[],
      invalid: [] as string[],
      my: [] as string[],
    };

    parcels.forEach((parcel) => {
      // Add to type-specific array
      if (parcel.type && result[parcel.type as keyof typeof result]) {
        result[parcel.type as keyof typeof result].push(parcel.mapTillerId);
      }

      // Also add to "my" if owned by user
      if (userAddress && parcel.owner?.addressXRPL === userAddress) {
        result.my.push(parcel.mapTillerId);
      }
    });

    return result;
  }, [parcels, userAddress]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!maptilersdk) {
      console.error("MapTiler SDK not loaded");
      return;
    }

    // Initialize the map
    maptilersdk.config.apiKey = apiKey;

    const initializeMap = () => {
      map.current = new maptilersdk.Map({
        container: mapContainer.current!,
        style: maptilersdk.MapStyle.STREETS,
        zoom: zoom,
        center: center as maptilersdk.LngLatLike,
        minZoom: 10,
        maxZoom: 24,
      });

      map.current.on("load", setupMap);
    };

    const setupMap = () => {
      const mapInstance = map.current;

      // Add the cadastre source
      mapInstance.addSource("cadastre", {
        type: "vector",
        url: `https://api.maptiler.com/tiles/fr-cadastre/tiles.json?key=${apiKey}`,
      });

      // Add layers for each parcel type
      Object.entries(ParcelColorPerType).forEach(([type, color]) => {
        mapInstance.addLayer({
          id: `cadastre-parcels-${type}`,
          type: "fill",
          source: "cadastre",
          "source-layer": "parcelles",
          paint: {
            "fill-color": color,
            "fill-opacity": 0.6,
            "fill-outline-color": "#000000",
          },
          filter: ["in", ["get", "id"], ["literal", parcelsByType[type as keyof typeof parcelsByType]]],
        });
      });

      // Add hover effect layer
      mapInstance.addLayer({
        id: "cadastre-parcels-highlighted",
        type: "fill",
        source: "cadastre",
        "source-layer": "parcelles",
        paint: {
          "fill-color": "#aaaaaa",
          "fill-opacity": 0.7,
          "fill-outline-color": "#000000",
        },
        filter: ["==", "id", ""],
      });

      // Add selected state layer
      mapInstance.addLayer({
        id: "cadastre-parcels-selected",
        type: "fill",
        source: "cadastre",
        "source-layer": "parcelles",
        paint: {
          "fill-color": "#ffffff",
          "fill-opacity": 0.8,
          "fill-outline-color": "#000000",
        },
        filter: ["==", "id", ""],
      });

      // Set up event handlers
      setupEventHandlers(mapInstance);
    };

    const setupEventHandlers = (mapInstance: any) => {
      // Handle mouse move over parcels
      const layerIds = Object.keys(ParcelColorPerType).map((type) => `cadastre-parcels-${type}`);

      // Handle mouse move over parcels
      mapInstance.on("mousemove", layerIds, (e: any) => {
        mapInstance.getCanvas().style.cursor = "pointer";

        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: layerIds,
        });

        if (features.length > 0) {
          const feature = features[0];
          const props = feature.properties;

          // Don't apply hover effect if this parcel is already selected
          if (selectedMapTillerId === props.id) {
            return;
          }

          // Update hover state
          if (hoveredParcelId !== props.id) {
            // Remove highlight from previous feature
            if (hoveredParcelId) {
              mapInstance.setFilter("cadastre-parcels-highlighted", ["==", "id", ""]);
            }

            // Add highlight to current feature
            setHoveredParcelId(props.id);
            mapInstance.setFilter("cadastre-parcels-highlighted", ["==", "id", props.id]);

            // Update popup content
            if (hoverPopupRef.current) {
              let popupContent = "";
              for (const key in props) {
                if (Object.prototype.hasOwnProperty.call(props, key)) {
                  popupContent += `<p><strong>${key}:</strong> ${props[key]}</p>`;
                }
              }

              hoverPopupRef.current.innerHTML = popupContent;
              hoverPopupRef.current.style.display = "block";
              hoverPopupRef.current.style.left = e.point.x + 10 + "px";
              hoverPopupRef.current.style.top = e.point.y + 10 + "px";
            }
          }
        }
      });

      // Handle mouse leave
      mapInstance.on("mouseleave", layerIds, () => {
        mapInstance.getCanvas().style.cursor = "";
        if (hoverPopupRef.current) {
          hoverPopupRef.current.style.display = "none";
        }
        setHoveredParcelId(null);
        mapInstance.setFilter("cadastre-parcels-highlighted", ["==", "id", ""]);
      });

      // Handle click events
      mapInstance.on("click", layerIds, (e: any) => {
        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: layerIds,
        });

        if (features.length > 0) {
          const feature = features[0];
          const props = feature.properties;

          console.log("🚀 ~ setupEventHandlers ~ feature:", feature);

          // If clicking the already selected parcel, deselect it
          if (selectedMapTillerId === props.id) {
            onMapTillerIdSelect(null);
            mapInstance.setFilter("cadastre-parcels-selected", ["==", "id", ""]);
            if (pinnedPopupRef.current) {
              pinnedPopupRef.current.style.display = "none";
            }

            // Notify parent component of deselection
            if (onParcelSelect) {
              onParcelSelect(null);
            }
            return;
          }

          // Select the new parcel
          onMapTillerIdSelect(props.id);
          mapInstance.setFilter("cadastre-parcels-selected", ["==", "id", props.id]);

          // Clear hover state
          setHoveredParcelId(null);
          mapInstance.setFilter("cadastre-parcels-highlighted", ["==", "id", ""]);
          if (hoverPopupRef.current) {
            hoverPopupRef.current.style.display = "none";
          }

          // Update and show the pinned popup
          if (pinnedPopupRef.current) {
            let popupContent = '<div class="close-button">×</div>';
            for (const key in props) {
              if (Object.prototype.hasOwnProperty.call(props, key)) {
                popupContent += `<p><strong>${key}:</strong> ${props[key]}</p>`;
              }
            }

            pinnedPopupRef.current.innerHTML = popupContent;
            pinnedPopupRef.current.style.display = "block";
            pinnedPopupRef.current.style.left = e.point.x + 10 + "px";
            pinnedPopupRef.current.style.top = e.point.y + 10 + "px";

            // Reattach close button event
            const closeButton = pinnedPopupRef.current.querySelector(".close-button");
            if (closeButton && closeButton instanceof HTMLElement) {
              closeButton.addEventListener("click", (event: MouseEvent) => {
                event.stopPropagation();
                if (pinnedPopupRef.current) {
                  pinnedPopupRef.current.style.display = "none";
                }
                onMapTillerIdSelect(null);
                mapInstance.setFilter("cadastre-parcels-selected", ["==", "id", ""]);

                // Notify parent component of deselection
                if (onParcelSelect) {
                  onParcelSelect(null);
                }
              });
            }
          }

          // Notify parent component of selection
          if (onParcelSelect) {
            onParcelSelect(props);
          }
        }
      });
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map layers when parcels change
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // Update the filters for all parcel type layers
    Object.keys(ParcelColorPerType).forEach((type) => {
      const layerId = `cadastre-parcels-${type}`;
      map.current.setFilter(layerId, ["in", ["get", "id"], ["literal", parcelsByType[type as keyof typeof parcelsByType]]]);
    });

    // If there's a selected parcel, make sure it stays selected
    if (selectedMapTillerId) {
      map.current.setFilter("cadastre-parcels-selected", ["==", "id", selectedMapTillerId]);
    }
  }, [parcelsByType, selectedMapTillerId]);

  // Update selected parcel highlight when selection changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    if (selectedMapTillerId) {
      map.current.setFilter("cadastre-parcels-selected", ["==", "id", selectedMapTillerId]);
    } else {
      map.current.setFilter("cadastre-parcels-selected", ["==", "id", ""]);
    }
  }, [selectedMapTillerId]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapContainer} style={{ position: "absolute", top: 0, bottom: 0, width: "100%" }} />
      <div
        ref={hoverPopupRef}
        className="map-popup"
        style={{
          background: "white",
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          padding: "10px",
          maxWidth: "300px",
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          pointerEvents: "none",
          position: "absolute",
          zIndex: 9999,
          display: "none",
        }}
      />
      <div
        ref={pinnedPopupRef}
        className="map-popup pinned-popup"
        style={{
          background: "white",
          borderRadius: "4px",
          boxShadow: "0 3px 14px rgba(0, 0, 0, 0.4)",
          padding: "10px",
          maxWidth: "300px",
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          pointerEvents: "auto",
          position: "absolute",
          zIndex: 9999,
          display: "none",
          borderLeft: "4px solid #0080aa",
        }}
      />
    </div>
  );
};

export default MapTillerView;
