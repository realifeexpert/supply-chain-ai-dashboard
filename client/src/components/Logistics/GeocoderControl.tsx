import { useControl } from "react-map-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import mapboxgl from "mapbox-gl";
import type { GeocoderOptions } from "@mapbox/mapbox-gl-geocoder";

import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

type GeocoderControlProps = Omit<
  GeocoderOptions,
  "accessToken" | "mapboxgl"
> & {
  mapboxAccessToken: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  onResult?: (e: any) => void;
  onClear?: () => void;
};

export default function GeocoderControl({
  mapboxAccessToken,
  position,
  ...props
}: GeocoderControlProps) {
  useControl<MapboxGeocoder>(
    () => {
      const ctrl = new MapboxGeocoder({
        ...props,
        marker: false,
        accessToken: mapboxAccessToken,
        mapboxgl,
      });

      if (props.onResult) ctrl.on("result", props.onResult);
      if (props.onClear) ctrl.on("clear", props.onClear);

      return ctrl;
    },
    { position },
  );

  return null;
}
