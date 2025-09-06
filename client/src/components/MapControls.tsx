// src/components/MapControls.tsx

import React, { useState, useRef, useEffect } from "react";
import {
  Layers,
  Car,
  Building,
  Bus,
  Bike,
  Navigation,
  Flame,
  Wind,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export const mapStyles = {
  Default: "mapbox://styles/mapbox/dark-v11",
  Satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  Terrain: "mapbox://styles/mapbox/outdoors-v12",
};
export type MapStyle = keyof typeof mapStyles;

interface MapControlsProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
  showTraffic: boolean;
  onTrafficToggle: () => void;
  show3D: boolean;
  on3DToggle: () => void;
  showPublicTransport: boolean;
  onPublicTransportToggle: () => void;
  showBicycling: boolean;
  onBicyclingToggle: () => void;
  showStreetView: boolean;
  onStreetViewToggle: () => void;
  showWildfires: boolean;
  onWildfiresToggle: () => void;
  showAirQuality: boolean;
  onAirQualityToggle: () => void;
  className?: string;
}

// Custom hook to detect clicks outside a component
function useOnClickOutside(
  ref: React.RefObject<HTMLDivElement | null>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export const MapControls: React.FC<MapControlsProps> = ({
  currentStyle,
  onStyleChange,
  showTraffic,
  onTrafficToggle,
  show3D,
  on3DToggle,
  showPublicTransport,
  onPublicTransportToggle,
  showBicycling,
  onBicyclingToggle,
  showStreetView,
  onStreetViewToggle,
  showWildfires,
  onWildfiresToggle,
  showAirQuality,
  onAirQualityToggle,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);

  // Close panel on click outside
  useOnClickOutside(controlRef, () => setIsOpen(false));

  const mapDetails = [
    {
      id: "traffic",
      label: "Traffic",
      icon: Car,
      state: showTraffic,
      action: onTrafficToggle,
    },
    {
      id: "3d",
      label: "3D Buildings",
      icon: Building,
      state: show3D,
      action: on3DToggle,
    },
    {
      id: "public",
      label: "Public Transport",
      icon: Bus,
      state: showPublicTransport,
      action: onPublicTransportToggle,
    },
    {
      id: "bike",
      label: "Bicycling",
      icon: Bike,
      state: showBicycling,
      action: onBicyclingToggle,
    },
    {
      id: "street",
      label: "Street View",
      icon: Navigation,
      state: showStreetView,
      action: onStreetViewToggle,
    },
    {
      id: "wildfire",
      label: "Wildfires",
      icon: Flame,
      state: showWildfires,
      action: onWildfiresToggle,
    },
    {
      id: "air",
      label: "Air Quality",
      icon: Wind,
      state: showAirQuality,
      action: onAirQualityToggle,
    },
  ];

  return (
    <div ref={controlRef} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-zinc-900/80 backdrop-blur-md text-white p-2.5 rounded-lg shadow-lg border border-zinc-700/50 hover:bg-zinc-800 transition-colors"
        aria-label="Toggle map layers"
      >
        <Layers size={20} />
      </button>

      {isOpen && (
        <div className="absolute top-0 right-0 mt-12 w-64 bg-zinc-900/80 backdrop-blur-md rounded-lg shadow-2xl border border-zinc-700/50 text-white animate-in fade-in-0 zoom-in-95">
          <div className="p-3">
            <h4 className="font-semibold text-sm mb-2 text-zinc-300">
              Map Type
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(mapStyles) as MapStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => onStyleChange(style)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    currentStyle === style
                      ? "bg-cyan-500 text-white shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-700/50 p-3">
            <h4 className="font-semibold text-sm mb-2 text-zinc-300">
              Map Details
            </h4>
            {/* --- SCROLLABLE AREA --- */}
            <div className="space-y-1 max-h-[240px] overflow-y-auto pr-1">
              {mapDetails.map((detail) => (
                <label
                  key={detail.id}
                  htmlFor={detail.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <detail.icon size={18} className="text-zinc-400" />
                    <span className="text-sm font-medium">{detail.label}</span>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id={detail.id}
                      className="sr-only peer"
                      checked={detail.state}
                      onChange={detail.action}
                    />
                    <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
