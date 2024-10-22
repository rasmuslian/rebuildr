import {
  Client,
  GeocodeResult,
  Language,
  PlaceAutocompleteResponseData,
  PlaceAutocompleteType,
  Status,
} from '@googlemaps/google-maps-services-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config';
import { BadUserInputException, InternalServerException } from 'src/exceptions';
import { GetAddressInput } from 'src/resolvers/geocoding.resolver';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GeocodingService {
  private client: Client;
  private sessionToken: string;

  constructor(private configService: ConfigService<EnvironmentVariables>) {
    this.client = new Client({});
    this.sessionToken = uuidv4();
  }

  async placesAutoComplete(s: string) {
    if (!s) {
      return { result: [] };
    }

    let response: PlaceAutocompleteResponseData;
    try {
      const r = await this.client.placeAutocomplete({
        params: {
          input: s,
          key: this.configService.get('GOOGLE_PLACES_AUTOCOMPLETE_API_KEY'),
          language: Language.sv,
          types: PlaceAutocompleteType.geocode,
          components: ['country:se'],
          sessiontoken: this.sessionToken,
        },
      });
      response = r.data;
    } catch (e: any) {
      throw InternalServerException(e);
    }
    if (response.status !== Status.OK) {
      throw InternalServerException(response.error_message);
    }

    return {
      result: response.predictions.map((prediction) => prediction.description),
    };
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
