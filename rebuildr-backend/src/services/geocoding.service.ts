import {
  Client,
  GeocodeComponents,
  GeocodeResult,
  Language,
  PlaceAutocompleteResponseData,
  PlaceAutocompleteType,
  PlaceType2,
  Status,
} from '@googlemaps/google-maps-services-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config';
import { swedishPostCodeRegex } from 'src/constants/regexp';
import { BadUserInputException, InternalServerException } from 'src/exceptions';
import { LocationType } from 'src/resolvers/geocoding.resolver';
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
    } catch {
      throw InternalServerException();
    }
    if (response.status !== Status.OK) {
      throw InternalServerException(response.error_message);
    }

    return {
      result: response.predictions.map((prediction) => prediction.description),
    };
  }

  async postCodeToLocation(postCode: string) {
    const isValid = swedishPostCodeRegex.test(postCode);
    if (!isValid) {
      throw BadUserInputException('Invalid post code');
    }
    const formatPostCode =
      postCode.slice(0, 3) + ' ' + postCode.slice(postCode.length - 2);

    return await this.addressToLocation(undefined, {
      postal_code: formatPostCode,
      country: 'SE',
    });
  }

  async addressToLocation(address?: string, components?: GeocodeComponents) {
    const res = await this.geocode(address, components);
    return res.location;
  }

  /**
   *
   * @param address a string
   * @param components an object containing more information about the address
   * @returns The following object:
   * @property lat - latidute
   * @property lng - longitude
   * @property postalCode - Postal code receieved from the geocoding process
   */
  async geocode(address?: string, components?: GeocodeComponents) {
    let result: GeocodeResult;
    try {
      const r = await this.client.geocode({
        params: {
          address,
          key: process.env.GOOGLE_GEOCODING_API_KEY,
          components: { country: 'SE', ...(components ?? {}) },
        },
      });
      result = r.data.results[0];
    } catch {
      throw InternalServerException();
    }
    if (!result) {
      throw BadUserInputException('Address could not be located');
    }
    const location = result.geometry.location;
    const postalCode = result.address_components.find((ac) =>
      ac.types.some((type) => type === 'postal_code'),
    )?.short_name;

    return {
      location: {
        lat: location.lat,
        lng: location.lng,
      },
      postalCode,
    };
  }

  async locationToAddress(location: LocationType) {
    let result: GeocodeResult;
    try {
      const r = await this.client.reverseGeocode({
        params: {
          latlng: { lat: location.lat, lng: location.lng },
          language: Language.sv,
          key: process.env.GOOGLE_GEOCODING_API_KEY,
        },
      });
      result = r.data.results[0];
    } catch {
      throw InternalServerException();
    }

    if (!result) {
      throw BadUserInputException('Could not find address');
    }

    return {
      address: result.formatted_address,
    };
  }

  async locationToApproximation(location: LocationType) {
    let result: GeocodeResult;
    try {
      const r = await this.client.reverseGeocode({
        params: {
          latlng: { lat: location.lat, lng: location.lng },
          language: Language.sv,
          key: process.env.GOOGLE_GEOCODING_API_KEY,
        },
      });
      result = r.data.results.find((r) =>
        r.types.some(
          (type) =>
            type === PlaceType2.postal_town ||
            type === PlaceType2.administrative_area_level_2 ||
            type === PlaceType2.administrative_area_level_1,
        ),
      );
    } catch {
      throw InternalServerException();
    }

    if (!result) {
      throw BadUserInputException('Could not find address');
    }

    return {
      address: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
    };
  }
}
