import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Stop } from "@/lib/route-c-stops";

type Props = {
  lat: number;
  long: number;
  stop: Stop | null;
};

function BusMap({ lat, long, stop }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const busMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const stopMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const token = import.meta.env["VITE_LOVABLE_CONNECTOR_MAPBOX_PUBLIC_TOKEN"] as string | undefined;
    if (!token || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [long, lat],
      zoom: 11,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left",
    );
    mapRef.current = map;

    const busEl = document.createElement("div");
    busEl.style.cssText =
      "width:22px;height:22px;border-radius:50%;background:hsl(152 70% 45%);border:3px solid hsl(220 30% 8%);box-shadow:0 0 0 4px hsl(152 70% 45% / 0.35)";
    busMarkerRef.current = new mapboxgl.Marker({ element: busEl })
      .setLngLat([long, lat])
      .addTo(map);

    return () => {
      busMarkerRef.current?.remove();
      stopMarkerRef.current?.remove();
      map.remove();
      mapRef.current = null;
      busMarkerRef.current = null;
      stopMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live bus position
  useEffect(() => {
    busMarkerRef.current?.setLngLat([long, lat]);
  }, [lat, long]);

  // Selected stop marker + fit view
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (stopMarkerRef.current) {
      stopMarkerRef.current.remove();
      stopMarkerRef.current = null;
    }

    if (stop) {
      const stopEl = document.createElement("div");
      stopEl.style.cssText =
        "width:18px;height:18px;border-radius:4px;background:hsl(45 100% 60%);border:2px solid hsl(220 30% 8%);transform:rotate(45deg)";
      stopMarkerRef.current = new mapboxgl.Marker({ element: stopEl })
        .setLngLat([stop.long, stop.lat])
        .addTo(map);

      const bounds = new mapboxgl.LngLatBounds(
        [long, lat],
        [stop.long, stop.lat],
      );
      map.fitBounds(bounds, { padding: 80, maxZoom: 13, duration: 800 });
    } else {
      map.easeTo({ center: [long, lat], zoom: 12, duration: 600 });
    }
  }, [stop, lat, long]);

  return (
    <div
      ref={containerRef}
      className="h-72 w-full overflow-hidden rounded-2xl border border-border sm:h-96"
      aria-label="Live bus position map"
    />
  );
}

export default BusMap;
