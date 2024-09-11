import {
  Client,
  GeocodeResult,
  Language,
} from '@googlemaps/google-maps-services-js';
import { Injectable } from '@nestjs/common';
import { BadUserInputException, InternalServerException } from 'src/exceptions';
import { GetAddressInput } from 'src/resolvers/geocoding.resolver';

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

  async locationToAddress(location: GetAddressInput) {
    let result: GeocodeResult;
    try {
      const r = await this.client.reverseGeocode({
        params: {
          latlng: { lat: location.latitude, lng: location.longitude },
          language: Language.sv,
          key: process.env.GOOGLE_GEOCODING_API_KEY,
        },
      });
      result = r.data.results[0];
    } catch (e) {
      throw InternalServerException();
    }

    if (!result) {
      throw BadUserInputException('Could not find address');
    }
    return { address: result.formatted_address };
  }
}
