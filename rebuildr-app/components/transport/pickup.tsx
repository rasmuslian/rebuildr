import {
  PickupQueryQuery,
  PickupQueryQueryVariables,
  ProjectUpdateProductMutationVariables,
  UpdateProjectMutation,
} from "@/gql/graphql";
import { gql, useMutation, useSuspenseQuery } from "@apollo/client";
import { View } from "react-native";
import { EditPickup } from "./edit-pickup";
import { useState } from "react";
import { PreviewPickup } from "./preview-pickup";

const PICKUP_QUERY = gql`
  query PickupQuery($input: GetProductInput!) {
    product(input: $input) {
      id
      address
      location {
        lat
        lng
      }
      approximatePlace {
        lat
        lng
        address
      }
      project {
        id
        title
        address
        location {
          lat
          lng
        }
        approximatePlace {
          lat
          lng
          address
        }
      }
    }
  }
`;

const UPDATE_PICKUP = gql`
  mutation UpdatePickup($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      product {
        id
        address
        location {
          lat
          lng
        }
        approximatePlace {
          lat
          lng
          address
        }
        project {
          id
          title
          address
          location {
            lat
            lng
          }
          approximatePlace {
            lat
            lng
            address
          }
        }
      }
    }
  }
`;

type Props = {
  productId: string;
};

export const Pickup = ({ productId }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const { data } = useSuspenseQuery<
    PickupQueryQuery,
    PickupQueryQueryVariables
  >(PICKUP_QUERY, { variables: { input: { id: productId } } });
  const [updateProduct, { loading: updatingProduct }] = useMutation<
    UpdateProjectMutation,
    ProjectUpdateProductMutationVariables
  >(UPDATE_PICKUP);

  const onEditProduct = (lat: number, lng: number) => {
    if (updatingProduct) {
      return;
    }
    updateProduct({
      variables: {
        input: {
          id: productId,
          location: {
            lat,
            lng,
          },
          pickupEnabled: true,
        },
      },
      onCompleted: () => {
        setIsEditing(false);
      },
    });
  };

  const project = data.product.project;
  const productLocation = data.product.location;
  const address = project?.address ?? data.product.address;

  return (
    <View>
      {(!address || isEditing) && (
        <EditPickup
          address={
            project ? project.address : (data.product.address ?? undefined)
          }
          location={
            project
              ? { ...project.location }
              : productLocation
                ? { ...productLocation }
                : undefined
          }
          onSave={(lat, lng) => {
            onEditProduct(lat, lng);
          }}
          isLoading={updatingProduct}
        />
      )}
      {!!address && !isEditing && (
        <PreviewPickup
          productId={productId}
          onChangeAddress={() => setIsEditing(true)}
        />
      )}
    </View>
  );
};
