import { Client, Language } from '@googlemaps/google-maps-services-js';
import { Injectable } from '@nestjs/common';
import { GetAddressInput } from 'src/resolvers/geocoding.resolver';

@Injectable()
export class GeocodingService {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  async addressToLocation(address: string) {
    try {
      const r = await this.client.geocode({
        params: { address, key: process.env.GOOGLE_GEOCODING_API_KEY },
      });
      const result = r.data.results[0];
      if (!result) {
        throw new Error('Address could not be located');
      }
      const location = result.geometry.location;
      return {
        longitude: location.lng,
        latitude: location.lat,
      };
    } catch (e) {
      console.log('e :>> ', e);
      throw new Error('Error when geocoding address');
    }
  }

  async locationToAddress(location: GetAddressInput) {
    try {
      const r = await this.client.reverseGeocode({
        params: {
          latlng: { lat: location.latitude, lng: location.longitude },
          language: Language.sv,
          key: process.env.GOOGLE_GEOCODING_API_KEY,
        },
      });
      const result = r.data.results[0];
      if (!result) {
        throw new Error('Could not find address');
      }
      return { address: result.formatted_address };
    } catch (e) {
      console.log('e :>> ', e);
      throw new Error('Error when reverse geocoding address');
    }
  }
}
