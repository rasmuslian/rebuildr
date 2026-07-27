import { gql, useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { TextInput } from "@components/forms/textInput";
import { Body, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  PublishSuccessProjectSuggestionQuery,
  PublishSuccessProjectSuggestionQueryVariables,
  PublishSuccessCreateProjectMutation,
  PublishSuccessCreateProjectMutationVariables,
  PublishSuccessLinkProductMutation,
  PublishSuccessLinkProductMutationVariables,
} from "@/gql/graphql";

const PROJECT_SUGGESTION = gql`
  query PublishSuccessProjectSuggestion(
    $productInput: GetProductInput!
    $productsInput: ProductsInput!
  ) {
    product(input: $productInput) {
      id
      address
      location {
        lat
        lng
      }
      project {
        id
      }
    }
    products(input: $productsInput) {
      products {
        id
        address
        project {
          id
        }
      }
    }
  }
`;

const CREATE_PROJECT = gql`
  mutation PublishSuccessCreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      title
    }
  }
`;

const LINK_PRODUCT = gql`
  mutation PublishSuccessLinkProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      product {
        id
        project {
          id
        }
      }
    }
  }
`;

type Props = {
  productId: string;
  sellerId: string;
  onDismiss: () => void;
};

/**
 * Post-publish nudge: when the seller has several published ads on the same
 * address that aren't in a project, offer to collect them into one — buyers
 * then see "Mer från samma projekt" and the seller skips re-entering the
 * address on the next ad. Renders nothing unless the suggestion applies.
 */
export const ProjectSuggestionCard = ({
  productId,
  sellerId,
  onDismiss,
}: Props) => {
  const colors = useThemeColor();
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  //stays busy through the whole create+link flow — the mutation's loading flag
  //only covers createProject and would otherwise drop during linking
  const [submitting, setSubmitting] = useState(false);
  const [createdProject, setCreatedProject] = useState<{
    id: string;
    linkedCount: number;
  } | null>(null);

  const { data } = useQuery<
    PublishSuccessProjectSuggestionQuery,
    PublishSuccessProjectSuggestionQueryVariables
  >(PROJECT_SUGGESTION, {
    variables: {
      productInput: { id: productId },
      productsInput: { sellerId },
    },
    fetchPolicy: "network-only",
  });
  const [createProject] = useMutation<
    PublishSuccessCreateProjectMutation,
    PublishSuccessCreateProjectMutationVariables
  >(CREATE_PROJECT);
  const [linkProduct] = useMutation<
    PublishSuccessLinkProductMutation,
    PublishSuccessLinkProductMutationVariables
  >(LINK_PRODUCT);

  //normalize before comparing — addresses are geocoded strings but defend
  //against case/whitespace drift between entries
  const normalize = (a?: string | null) => a?.trim().toLowerCase() ?? "";
  const product = data?.product;
  const sameAddressProducts =
    product?.address && !product.project
      ? (data?.products.products ?? []).filter(
          (p) =>
            normalize(p.address) === normalize(product.address) && !p.project,
        )
      : [];

  //< 2 because the seller's own published product is in the list; and without
  //coordinates we can't create a project — so don't show a dead button
  if (
    createdProject === null &&
    (sameAddressProducts.length < 2 || !product?.location)
  ) {
    return null;
  }

  const suggestedTitle = product?.address?.split(",")[0] ?? "";

  const onCreate = async () => {
    if (!product?.location || submitting) return;
    const projectTitle = title.trim() || suggestedTitle;
    if (!projectTitle) {
      setErrorMessage("Ge projektet ett namn först.");
      return;
    }
    setErrorMessage(null);
    setSubmitting(true);
    try {
      let projectId: string | undefined;
      try {
        const { data: created } = await createProject({
          variables: {
            input: {
              title: projectTitle,
              location: {
                lat: product.location.lat,
                lng: product.location.lng,
              },
            },
          },
        });
        projectId = created?.createProject.id;
      } catch (e) {
        const message = e instanceof Error ? e.message : "";
        setErrorMessage(
          message.includes("same title")
            ? "Du har redan ett projekt med det namnet — välj ett annat."
            : "Projektet kunde inte skapas just nu. Försök igen.",
        );
        return;
      }
      if (!projectId) {
        setErrorMessage("Projektet kunde inte skapas just nu. Försök igen.");
        return;
      }

      const results = await Promise.allSettled(
        sameAddressProducts.map((p) =>
          linkProduct({ variables: { input: { id: p.id, projectId } } }),
        ),
      );
      const linkedCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;
      setCreatedProject({ id: projectId, linkedCount });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: colors.buttons.tonal.enabled,
        borderRadius: borderRadius.medium,
        padding: 16,
        gap: 12,
        marginTop: 8,
      }}
    >
      {createdProject ? (
        <>
          <Label size="medium">{`✓ Projekt skapat — ${createdProject.linkedCount} annonser kopplade`}</Label>
          <Body size="small" color="secondary">
            Köpare ser nu "Mer från samma projekt" på dina annonser.
          </Body>
          <Button
            label="Visa projektet"
            type="tonal"
            onPress={() => {
              onDismiss();
              router.navigate({
                pathname: "/project/[projectId]",
                params: { projectId: createdProject.id },
              });
            }}
          />
        </>
      ) : (
        <>
          <Label size="medium">{`Du har ${sameAddressProducts.length} annonser på samma adress`}</Label>
          <Body size="small" color="secondary">
            Samla dem i ett projekt — köpare ser då "Mer från samma projekt" och
            du slipper fylla i adressen på nästa annons.
          </Body>
          <TextInput
            value={title}
            placeholder={suggestedTitle || "Projektnamn"}
            onChange={(t) => {
              setTitle(t);
              setErrorMessage(null);
            }}
          />
          {errorMessage && (
            <Body size="small" color="error">
              {errorMessage}
            </Body>
          )}
          <Button
            label={`Skapa projekt & koppla ${sameAddressProducts.length} annonser`}
            loading={submitting}
            onPress={onCreate}
          />
        </>
      )}
    </View>
  );
};
