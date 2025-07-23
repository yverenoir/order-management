import haversineDistance from "haversine-distance";

import {Coordinate} from "./shippingAddress";

// TODO
// Test cases:
// 1. Make sure 0 distance is returned for same coordinate
// 2. Make sure m to km conversion is happening
// 3. Basic happy path for known distance between known coordiante pair

/*
* Having distance calculation in its own method will allow easy exchange of business logic used for calculation, 
* in the future, it could be from a shipping provider
*/
export function getDistanceInKm(source: Coordinate, destination: Coordinate) {
    const sourceCoordinate = {lat: source.latitude, lon: source.longitude};
    const destinationCoordinate = {lat: destination.latitude, lon: destination.longitude};
    const distanceInMeters = haversineDistance(sourceCoordinate, destinationCoordinate);
    // TODO convert in safe to way KM from M
    const distance = distanceInMeters / 1000;
    console.log('[Distance Provider] getDistanceInKm: ' + distance);
    return distance;
}

