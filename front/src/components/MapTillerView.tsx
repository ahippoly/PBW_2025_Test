"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import * as maptilersdk from "@maptiler/sdk";
// We need to import the SDK dynamically to avoid SSR issues

interface MapViewProps {
  apiKey: string;
  center?: [number, number];
  zoom?: number;
  whiteListedParcels?: Parcel[];
  mintableParcel?: Parcel;
  mintedParcels?: Parcel[];
  invalidParcels?: Parcel[];
  buyableParcels?: Parcel[];
  myParcels?: Parcel[];
  onParcelSelect?: (parcelProperties: any) => void;
  testMode?: boolean;
  selectedMapTillerId: string | null;
  onMapTillerIdSelect: (mapTillerId: string | null) => void;
}

const MapTillerView: React.FC<MapViewProps> = ({
  apiKey,
  center = [48.676165558055494, 1.9618325878575087].reverse(),
  zoom = 18,
  whiteListedParcels = [],
  mintableParcel = undefined,
  mintedParcels = [],
  invalidParcels = [],
  buyableParcels = [],
  myParcels = [],
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

  const whiteListedParcelsIds = useMemo(() => whiteListedParcels.map((parcel) => parcel.mapTillerId), [whiteListedParcels]);
  const mintedParcelsIds = useMemo(() => mintedParcels.map((parcel) => parcel.mapTillerId), [mintedParcels]);
  const invalidParcelsIds = useMemo(() => invalidParcels.map((parcel) => parcel.mapTillerId), [invalidParcels]);
  const buyableParcelsIds = useMemo(() => buyableParcels.map((parcel) => parcel.mapTillerId), [buyableParcels]);
  const mintableParcelId = useMemo(() => mintableParcel?.mapTillerId, [mintableParcel]);
  const myParcelsIds = useMemo(() => myParcels.map((parcel) => parcel.mapTillerId), [myParcels]);

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

      // Add standard parcels layer
      mapInstance.addLayer({
        id: "cadastre-parcels-regular",
        type: "fill",
        source: "cadastre",
        "source-layer": "parcelles",
        paint: {
          "fill-color": "#0080aa",
          "fill-opacity": 0.5,
          "fill-outline-color": "#000000",
        },
        filter: testMode ? ["!", ["in", ["get", "id"], ["literal", whiteListedParcelsIds]]] : ["==", "id", ""],
      });

      // Add whitelisted parcels layer
      mapInstance.addLayer({
        id: "cadastre-parcels-whitelisted",
        type: "fill",
        source: "cadastre",
        "source-layer": "parcelles",
        paint: {
          "fill-color": "#00cc44",
          "fill-opacity": 0.6,
          "fill-outline-color": "#006622",
        },
        filter: testMode ? ["in", ["get", "id"], ["literal", whiteListedParcelsIds]] : ["==", "id", ""],
      });

      // Add minted parcels layer
      mapInstance.addLayer({
        id: "cadastre-parcels-minted",
        type: "fill",
        source: "cadastre",
        "source-layer": "parcelles",
        paint: {
          "fill-color": "#90EE90",
          "fill-opacity": 0.6,
          "fill-outline-color": "#001a80",
        },
        filter: ["in", ["get", "id"], ["literal", mintedParcelsIds]],
      });

      // Add mintable parcels layer
      mapInstance.addLayer({
        id: "cadastre-parcels-mintable",
        type: "fill",
        source: "cadastre",
        "source-layer": "parcelles",
        paint: {
          "fill-color": "#808080",
          "fill-opacity": 0.3,
          "fill-outline-color": "#660099",
        },
        filter: ["==", "id", mintableParcelId],
      });

      // Add buyable parcels layer
      mapInstance.addLayer({
        id: "cadastre-parcels-buyable",
        type: "fill",
        source: "cadastre",
        "source-layer": "parcelles",
        paint: {
          "fill-color": "#006400",
          "fill-opacity": 0.6,
          "fill-outline-color": "#006622",
        },
        filter: ["in", ["get", "id"], ["literal", buyableParcelsIds]],
      });

      // Add invalid parcels layer
      mapInstance.addLayer({
        id: "cadastre-parcels-invalid",
        type: "fill",
        source: "cadastre",
        "source-layer": "parcelles",
        paint: {
          "fill-color": "#ff0000",
          "fill-opacity": 0.6,
          "fill-outline-color": "#990000",
        },
        filter: ["in", ["get", "id"], ["literal", invalidParcelsIds]],
      });

      // Add invalid parcels layer
      mapInstance.addLayer({
        id: "cadastre-parcels-my",
        type: "fill",
        source: "cadastre",
        "source-layer": "parcelles",
        paint: {
          "fill-color": "#0000ff",
          "fill-opacity": 0.6,
          "fill-outline-color": "#990000",
        },
        filter: ["in", ["get", "id"], ["literal", myParcelsIds]],
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
          "fill-color": "#ff6600",
          "fill-opacity": 0.7,
          "fill-outline-color": "#000000",
        },
        filter: ["==", "id", ""],
      });

      // Set up event handlers
      setupEventHandlers(mapInstance);
    };

    const setupEventHandlers = (mapInstance: any) => {
      // Handle mouse move over parcels
      mapInstance.on(
        "mousemove",
        [
          "cadastre-parcels-regular",
          "cadastre-parcels-whitelisted",
          "cadastre-parcels-minted",
          "cadastre-parcels-mintable",
          "cadastre-parcels-buyable",
          "cadastre-parcels-invalid",
        ],
        (e: any) => {
          mapInstance.getCanvas().style.cursor = "pointer";

          const features = mapInstance.queryRenderedFeatures(e.point, {
            layers: [
              "cadastre-parcels-regular",
              "cadastre-parcels-whitelisted",
              "cadastre-parcels-minted",
              "cadastre-parcels-mintable",
              "cadastre-parcels-buyable",
              "cadastre-parcels-invalid",
            ],
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
        }
      );

      // Handle mouse leave
      mapInstance.on(
        "mouseleave",
        [
          "cadastre-parcels-regular",
          "cadastre-parcels-whitelisted",
          "cadastre-parcels-minted",
          "cadastre-parcels-mintable",
          "cadastre-parcels-buyable",
          "cadastre-parcels-invalid",
        ],
        () => {
          mapInstance.getCanvas().style.cursor = "";
          if (hoverPopupRef.current) {
            hoverPopupRef.current.style.display = "none";
          }
          setHoveredParcelId(null);
          mapInstance.setFilter("cadastre-parcels-highlighted", ["==", "id", ""]);
        }
      );

      // Handle click events
      mapInstance.on(
        "click",
        [
          "cadastre-parcels-regular",
          "cadastre-parcels-whitelisted",
          "cadastre-parcels-minted",
          "cadastre-parcels-mintable",
          "cadastre-parcels-buyable",
          "cadastre-parcels-invalid",
        ],
        (e: any) => {
          const features = mapInstance.queryRenderedFeatures(e.point, {
            layers: [
              "cadastre-parcels-regular",
              "cadastre-parcels-whitelisted",
              "cadastre-parcels-minted",
              "cadastre-parcels-mintable",
              "cadastre-parcels-buyable",
              "cadastre-parcels-invalid",
            ],
          });

          if (features.length > 0) {
            const feature = features[0];
            const props = feature.properties;

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
        }
      );
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

  // Effect to update the whitelisted parcels when the prop changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // Update the filters for the parcel layers
    map.current.setFilter("cadastre-parcels-regular", testMode ? ["!", ["in", ["get", "id"], ["literal", whiteListedParcelsIds]]] : ["==", "id", ""]);
    map.current.setFilter("cadastre-parcels-whitelisted", ["in", ["get", "id"], ["literal", whiteListedParcelsIds]]);
    map.current.setFilter("cadastre-parcels-minted", ["in", ["get", "id"], ["literal", mintedParcelsIds]]);
    map.current.setFilter("cadastre-parcels-mintable", ["==", "id", mintableParcelId]);
    map.current.setFilter("cadastre-parcels-buyable", ["in", ["get", "id"], ["literal", buyableParcelsIds]]);
    map.current.setFilter("cadastre-parcels-invalid", ["in", ["get", "id"], ["literal", invalidParcelsIds]]);
  }, [whiteListedParcels, mintedParcels, mintableParcel, buyableParcels, invalidParcels]);

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
