import haversineDistance from "haversine-distance";

// TODO: add tests

/*
Having distance calculation in its own method will allow easy exchange of business logic used for calculation, 
in the future, it could be from a shipping provider
*/
export class DistanceProvider {
    getDistanceInKm(source: Coordinate, destination: Coordinate) {
        const sourceCoordinate = {lat: source.latitude, lon: source.longitude};
        const destinationCoordinate = {lat: destination.latitude, lon: destination.longitude};
        const distanceInMeters = haversineDistance(sourceCoordinate, destinationCoordinate);
        // TODO convert in safe to way KM from M
        const distance = distanceInMeters / 100;
        return distance;
    }
}

// TODO: extrat to its own file
export interface Coordinate {
    latitude: number,
    longitude: number
}