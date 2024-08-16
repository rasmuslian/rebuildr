import { Client, GeocodeResult } from '@googlemaps/google-maps-services-js';
import { Injectable } from '@nestjs/common';
import { InternalServerException, BadUserInputException } from 'src/exceptions';

@Injectable()
export class GeocodingService {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  async addressToLocation(address: string) {
    let result: GeocodeResult;
    try {
      const r = await this.client.geocode({
        params: { address, key: process.env.GOOGLE_GEOCODING_API_KEY },
      });
      result = r.data.results[0];
    } catch (e) {
      throw InternalServerException();
    }
    if (!result) {
      throw BadUserInputException('Address could not be located');
    }
    const location = result.geometry.location;
    return {
      longitude: location.lng,
      latitude: location.lat,
    };
  }
}
