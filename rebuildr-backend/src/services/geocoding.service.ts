import { Client } from '@googlemaps/google-maps-services-js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GeocodingService {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  async addressToLocation(address: string) {
    return this.client
      .geocode({
        params: { address, key: process.env.GOOGLE_GEOCODING_API_KEY },
      })
      .then((r) => {
        const result = r.data.results[0];
        if (!result) {
          throw new Error('Address could not be located');
        }
        const location = result.geometry.location;
        return {
          longitude: location.lng,
          latitude: location.lat,
        };
      })
      .catch((e) => {
        console.log('e :>> ', e);
        throw new Error('Error when geocoding address');
      });
  }
}
