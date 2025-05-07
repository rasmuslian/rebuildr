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
import { Divider } from "@components/dividers/divider";
import { Card } from "./card";

const PICKUP_QUERY = gql`
  query PickupQuery($input: GetProductInput!) {
    product(input: $input) {
      id
      address
      pickupEnabled
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
        pickupEnabled
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
  canEdit: boolean;
  onEditing: () => void;
  onEditComplete: () => void;
};

export const Pickup = ({
  productId,
  canEdit,
  onEditing,
  onEditComplete,
}: Props) => {
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
        onEditComplete();
      },
    });
  };

  const onChangeAddress = () => {
    if (canEdit) {
      setIsEditing(true);
      onEditing();
    }
  };

  const onSelectPickup = () => {
    updateProduct({
      variables: {
        input: {
          id: productId,
          pickupEnabled: !data.product.pickupEnabled,
        },
      },
    });
  };

  const project = data.product.project;
  const productLocation = data.product.location;
  const address = project?.address ?? data.product.address;

  return (
    <Card
      title="Avhämtning"
      description="Du bestämmer tid och plats för att köparen ska kunna hämta produkten direkt från dig."
      onPress={onSelectPickup}
      enabled={data.product.pickupEnabled}
    >
      <Divider />

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
            onChangeAddress={() => onChangeAddress()}
            canChangeAddress={canEdit}
          />
        )}
      </View>
    </Card>
  );
};
