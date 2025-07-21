interface Device {
    id: number,
    name: string,
    weightInGram: number,
    price: number,
    currency: string
}

const devices: Device[] = [
    { id: 1, name: 'SCOS Station P1 Pro', weightInGram: 365, currency: "USD", price: 150 },
  ];

export class DeviceService {

    getDeviceById(id: number): Device | null {
        return devices.find(device => device.id == id) ?? null;
    }
}