import haversineDistance from "haversine-distance";

import { Coordinate } from "./shippingAddress";

// TODO
// Test cases:
// 1. Make sure 0 distance is returned for same coordinate
// 2. Make sure m to km conversion is happening
// 3. Basic happy path for known distance between known coordiante pair

/**
 * Calculates the distance in kilometers between two geographical coordinates using the Haversine formula.
 * @param source - The source coordinate with latitude and longitude.
 * @param destination - The destination coordinate with latitude and longitude.
 * @returns The distance in kilometers between the two coordinates.
 */
/*
 * Having distance calculation in its own method will allow easy exchange of business logic used for calculation,
 * in the future, it could be from a shipping provider
 */
export function getDistanceInKm(source: Coordinate, destination: Coordinate) {
  const sourceCoordinate = { lat: source.latitude, lon: source.longitude };
  const destinationCoordinate = {
    lat: destination.latitude,
    lon: destination.longitude,
  };
  const distanceInMeters = haversineDistance(
    sourceCoordinate,
    destinationCoordinate,
  );

  // Convert meters to kilometers
  return distanceInMeters / 1000;
}
