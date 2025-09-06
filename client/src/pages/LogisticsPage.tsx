import React, { useEffect, useState, useRef, useMemo, memo } from "react";
import { getVehicles } from "@/services/api.ts";
import {
  Truck,
  Battery,
  Thermometer,
  Box,
  Search,
  X,
  GaugeCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vehicle, VehicleStatus } from "@/types";

// Map Imports
import Map, { Marker, Popup, Source, Layer } from "react-map-gl";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl";
import useSupercluster from "use-supercluster";
import GeocoderControl from "@/components/GeocoderControl";
import { MapControls, mapStyles } from "@/components/MapControls";
import type { MapStyle } from "@/components/MapControls";

// CSS Imports
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

// --- Helper Components (UI Enhanced) ---

const VehicleStatusBadge = memo(({ status }: { status: VehicleStatus }) => {
  const statusConfig: Record<
    VehicleStatus,
    { className: string; icon: React.ReactNode }
  > = {
    "On Route": {
      className: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
      icon: (
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse mr-1.5"></div>
      ),
    },
    Idle: {
      className: "bg-zinc-700 text-zinc-300 border border-zinc-600/50",
      icon: <div className="w-2 h-2 rounded-full bg-zinc-400 mr-1.5"></div>,
    },
    "In-Shop": {
      className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      icon: <div className="w-2 h-2 rounded-full bg-amber-400 mr-1.5"></div>,
    },
  };

  return (
    <span
      className={cn(
        "flex items-center px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap",
        statusConfig[status].className
      )}
    >
      {statusConfig[status].icon}
      {status}
    </span>
  );
});

const SkeletonLoader = memo(() => (
  <div className="space-y-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="p-4 rounded-lg bg-zinc-800/50 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-zinc-700 rounded w-1/3"></div>
          <div className="h-5 bg-zinc-700 rounded-full w-1/4"></div>
        </div>
        <div className="h-3 bg-zinc-700 rounded w-1/2 mt-3"></div>
      </div>
    ))}
  </div>
));

const EmptyState = memo(() => (
  <div className="text-center py-16 flex flex-col items-center justify-center h-full">
    <GaugeCircle size={48} className="mx-auto text-zinc-600" />
    <h3 className="mt-4 text-lg font-semibold text-white">No Vehicles Found</h3>
    <p className="mt-1 text-sm text-zinc-400">
      Try adjusting your search or filter criteria.
    </p>
  </div>
));

const DetailCard = memo(
  ({
    icon,
    label,
    value,
    children,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: string | number;
    children?: React.ReactNode;
  }) => (
    <div className="bg-zinc-800/70 p-4 rounded-lg flex items-center gap-4">
      <div className="bg-zinc-900 p-2 rounded-md">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-zinc-400">{label}</p>
        {value && <p className="font-bold text-white text-lg">{value}</p>}
        {children}
      </div>
    </div>
  )
);

// --- MAIN LOGISTICS PAGE COMPONENT ---
const LogisticsPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [popupInfo, setPopupInfo] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "All">(
    "All"
  );
  const [viewState, setViewState] = useState({
    longitude: 73.8567, // Pune
    latitude: 18.5204,
    zoom: 10,
    pitch: 30,
    bearing: 0,
  });

  // State for new MapControls
  const [currentMapStyle, setCurrentMapStyle] = useState<MapStyle>("Default");
  const [showTraffic, setShowTraffic] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [showPublicTransport, setShowPublicTransport] = useState(false);
  const [showBicycling, setShowBicycling] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);
  const [showWildfires, setShowWildfires] = useState(false);
  const [showAirQuality, setShowAirQuality] = useState(false);

  const mapRef = useRef<MapRef>(null);
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

  const fetchVehicles = async () => {
    try {
      const response = await getVehicles();
      setVehicles(response.data);
      if (response.data.length > 0 && !selectedVehicle) {
        const firstVehicle = response.data[0];
        setSelectedVehicle(firstVehicle);
        setViewState((prev) => ({
          ...prev,
          longitude: firstVehicle.longitude,
          latitude: firstVehicle.latitude,
          zoom: 12,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    const interval = setInterval(fetchVehicles, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setPopupInfo(vehicle);
    mapRef.current?.flyTo({
      center: [vehicle.longitude, vehicle.latitude],
      duration: 2000,
      zoom: 14,
      pitch: 45,
    });
  };

  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => statusFilter === "All" || v.status === statusFilter)
      .filter(
        (v) =>
          v.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.driver_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [vehicles, searchTerm, statusFilter]);

  const points = useMemo(
    () =>
      filteredVehicles.map((vehicle) => ({
        type: "Feature",
        properties: { cluster: false, vehicleId: vehicle.id, vehicle },
        geometry: {
          type: "Point",
          coordinates: [vehicle.longitude, vehicle.latitude],
        },
      })),
    [filteredVehicles]
  );

  const bounds = mapRef.current
    ? (mapRef.current.getMap().getBounds().toArray().flat() as [
        number,
        number,
        number,
        number
      ])
    : undefined;

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: viewState.zoom,
    options: { radius: 75, maxZoom: 20 },
  });

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case "On Route":
        return "#22d3ee";
      case "In-Shop":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  // Logic to add/remove 3D buildings layer
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const buildingsLayerId = "3d-buildings";
    if (show3D) {
      if (!map.getLayer(buildingsLayerId)) {
        map.addLayer({
          id: buildingsLayerId,
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "min_height"],
            "fill-extrusion-opacity": 0.6,
          },
        });
      }
    } else {
      if (map.getLayer(buildingsLayerId)) {
        map.removeLayer(buildingsLayerId);
      }
    }
  }, [show3D]);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] gap-4 bg-zinc-950 p-4">
      <div className="flex-1 bg-zinc-900 rounded-xl shadow-lg overflow-hidden relative border border-zinc-800">
        {!MAPBOX_TOKEN ? (
          <div className="h-full flex items-center justify-center text-center text-zinc-500 p-4">
            <p>
              Map cannot be displayed. <br /> Please add your{" "}
              <code className="bg-zinc-800 px-1 rounded-sm">
                VITE_MAPBOX_ACCESS_TOKEN
              </code>{" "}
              to the .env file.
            </p>
          </div>
        ) : (
          <Map
            ref={mapRef}
            {...viewState}
            onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
            style={{ width: "100%", height: "100%" }}
            mapStyle={mapStyles[currentMapStyle]}
            mapboxAccessToken={MAPBOX_TOKEN}
            projection={{ name: "globe" }}
          >
            {/* --- FIXED: Controls are inside <Map> but positioned in a header layout --- */}
            <div className="absolute top-0 left-0 right-0 z-10 p-3 flex items-center justify-between pointer-events-none bg-gradient-to-b from-zinc-950/80 to-transparent">
              {/* Left Side: Geocoder */}
              <div className="pointer-events-auto w-1/3 max-w-sm">
                <GeocoderControl
                  mapboxAccessToken={MAPBOX_TOKEN}
                  position="top-left"
                />
              </div>

              {/* Right Side: Map Controls */}
              <div className="pointer-events-auto flex items-center gap-2">
                <MapControls
                  currentStyle={currentMapStyle}
                  onStyleChange={setCurrentMapStyle}
                  showTraffic={showTraffic}
                  onTrafficToggle={() => setShowTraffic(!showTraffic)}
                  show3D={show3D}
                  on3DToggle={() => setShow3D(!show3D)}
                  showPublicTransport={showPublicTransport}
                  onPublicTransportToggle={() =>
                    setShowPublicTransport(!showPublicTransport)
                  }
                  showBicycling={showBicycling}
                  onBicyclingToggle={() => setShowBicycling(!showBicycling)}
                  showStreetView={showStreetView}
                  onStreetViewToggle={() => setShowStreetView(!showStreetView)}
                  showWildfires={showWildfires}
                  onWildfiresToggle={() => setShowWildfires(!showWildfires)}
                  showAirQuality={showAirQuality}
                  onAirQualityToggle={() => setShowAirQuality(!showAirQuality)}
                  className="relative [&>.absolute]:right-0"
                />
                {/* NavigationControl has been removed from here */}
              </div>
            </div>

            {/* NOTE: All other map layers, markers, popups, etc. remain as they were */}
            {showTraffic && (
              <Source
                id="mapbox-traffic"
                type="vector"
                url="mapbox://mapbox.mapbox-traffic-v1"
              >
                <Layer
                  id="traffic-layer"
                  type="line"
                  source-layer="traffic"
                  paint={{
                    "line-color": [
                      "case",
                      ["==", "congestion", "low"],
                      "#34D399",
                      ["==", "congestion", "moderate"],
                      "#FBBF24",
                      ["==", "congestion", "heavy"],
                      "#F87171",
                      "#DC2626",
                    ],
                    "line-width": 2,
                  }}
                />
              </Source>
            )}

            {clusters.map((cluster) => {
              const [longitude, latitude] = cluster.geometry.coordinates;
              const { cluster: isCluster, point_count: pointCount } =
                cluster.properties;

              if (isCluster) {
                return (
                  <Marker
                    key={`cluster-${cluster.id}`}
                    latitude={latitude}
                    longitude={longitude}
                  >
                    <div
                      className="w-10 h-10 bg-cyan-600 bg-opacity-80 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold cursor-pointer border-2 border-cyan-400/50"
                      onClick={() => {
                        const expansionZoom = Math.min(
                          supercluster.getClusterExpansionZoom(
                            cluster.id as number
                          ),
                          20
                        );
                        mapRef.current?.flyTo({
                          center: [longitude, latitude],
                          zoom: expansionZoom,
                          duration: 800,
                        });
                      }}
                    >
                      {pointCount}
                    </div>
                  </Marker>
                );
              }

              const vehicle = cluster.properties.vehicle as Vehicle;
              const isSelected = selectedVehicle?.id === vehicle.id;
              return (
                <Marker
                  key={`vehicle-${vehicle.id}`}
                  longitude={longitude}
                  latitude={latitude}
                >
                  <div
                    className="cursor-pointer group relative"
                    onClick={() => handleVehicleSelect(vehicle)}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 -m-2 bg-cyan-500/50 rounded-full animate-ping"></div>
                    )}
                    <Truck
                      className={cn(
                        "h-8 w-8 transition-all transform drop-shadow-lg",
                        isSelected
                          ? "scale-[1.35]"
                          : "scale-100 group-hover:scale-125"
                      )}
                      stroke="white"
                      strokeWidth={1}
                      fill={
                        isSelected ? "#22d3ee" : getStatusColor(vehicle.status)
                      }
                    />
                  </div>
                </Marker>
              );
            })}

            {popupInfo && (
              <Popup
                longitude={popupInfo.longitude}
                latitude={popupInfo.latitude}
                onClose={() => setPopupInfo(null)}
                closeOnClick={false}
                anchor="bottom"
                offset={40}
                className="mapbox-popup-dark"
              >
                <div className="bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700">
                  <h4 className="font-bold text-cyan-400">
                    {popupInfo.vehicle_number}
                  </h4>
                  <p className="text-xs text-zinc-300">
                    Driver: {popupInfo.driver_name}
                  </p>
                </div>
              </Popup>
            )}
          </Map>
        )}
      </div>

      {/* --- Sidebar Area (No changes here) --- */}
      <aside className="w-full md:w-[400px] bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 flex flex-col">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white mb-4">Vehicle Fleet</h2>
          <div className="space-y-4">
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search Vehicle No. or Driver"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(["All", "On Route", "Idle", "In-Shop"] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-full",
                      statusFilter === status
                        ? "bg-cyan-500 text-white shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    )}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="p-3">
              <SkeletonLoader />
            </div>
          ) : filteredVehicles.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2 p-3">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => handleVehicleSelect(vehicle)}
                  className={cn(
                    "p-4 rounded-lg cursor-pointer transition-all border-2",
                    selectedVehicle?.id === vehicle.id
                      ? "bg-zinc-800 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                      : "bg-zinc-800/50 border-transparent hover:bg-zinc-800"
                  )}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-white">
                      {vehicle.vehicle_number}
                    </p>
                    <VehicleStatusBadge status={vehicle.status} />
                  </div>
                  <p className="text-sm text-zinc-400">{vehicle.driver_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedVehicle && (
          <div className="p-5 border-t-2 border-zinc-800 bg-zinc-900/50 rounded-b-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-white">Vehicle Details</h3>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-1.5 rounded-full hover:bg-zinc-700"
                aria-label="Close details"
              >
                <X size={18} className="text-zinc-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <DetailCard
                icon={<Truck size={20} className="text-cyan-400" />}
                label="Vehicle / Driver"
                value={selectedVehicle.vehicle_number}
              >
                <p className="text-xs text-zinc-400 -mt-1">
                  {selectedVehicle.driver_name}
                </p>
              </DetailCard>
              <DetailCard
                icon={<Box size={20} className="text-cyan-400" />}
                label="Active Orders"
                value={selectedVehicle.orders_count}
              />
              <DetailCard
                icon={<Thermometer size={20} className="text-cyan-400" />}
                label="Live Temp"
                value={`${selectedVehicle.live_temp}°C`}
              />
              <DetailCard
                icon={<Battery size={20} className="text-cyan-400" />}
                label="Fuel Level"
              >
                <div className="w-full bg-zinc-700 rounded-full h-2.5 mt-1">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full"
                    style={{ width: `${selectedVehicle.fuel_level}%` }}
                  ></div>
                </div>
              </DetailCard>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default LogisticsPage;
