import {
  HandleDraftDeleteDraftMutation,
  HandleDraftDeleteDraftMutationVariables,
  HandleDraftQuery,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Body, Display } from "@components/typography/text";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useHandleDraft } from "@hooks/sell-product/use-handle-draft";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { View } from "react-native";

const HANDLE_DRAFT = gql`
  query HandleDraft {
    getDraftedProduct {
      id
    }
  }
`;

const HANDLE_DRAFT_DELETE_DRAFT = gql`
  mutation HandleDraftDeleteDraft($input: RemoveProductInput!) {
    deleteDraft(input: $input)
  }
`;

export const HandleDraftBottomSheet = () => {
  const { visible, setVisible } = useHandleDraft();
  const sheetRef = useRef<BottomSheetModal>(null);

  const { data } = useQuery<HandleDraftQuery>(HANDLE_DRAFT);
  const [deleteDraft, { loading, error }] = useMutation<
    HandleDraftDeleteDraftMutation,
    HandleDraftDeleteDraftMutationVariables
  >(HANDLE_DRAFT_DELETE_DRAFT);

  const onDeleteDraft = () => {
    if (loading || !data?.getDraftedProduct) {
      return;
    }

    deleteDraft({
      variables: {
        input: {
          id: data.getDraftedProduct.id,
        },
      },
      onCompleted: () => {
        setVisible(false);
        router.replace("/");
      },
    });
  };

  const saveDraft = () => {
    //draft is saved automatically, all we need to do is close and navigate
    setVisible(false);
    router.replace("/");
  };

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  return (
    <BottomSheet
      ref={sheetRef}
      name="handle draft"
      title="Hantera utkast"
      onDismiss={() => {
        setVisible(false);
      }}
    >
      <View
        style={{ justifyContent: "space-between", flex: 1, marginBottom: 16 }}
      >
        <View style={{ gap: 24, marginVertical: 24 }}>
          <Display size="small" style={{ textAlign: "center" }}>
            Vill du spara utkastet eller ta bort det?
          </Display>

          {error && <Body color="error">Något gick fel</Body>}
        </View>

        {data?.getDraftedProduct ? (
          <View style={{ gap: 8, paddingTop: 24 }}>
            <Button
              label="Ja, spara utkast"
              onPress={saveDraft}
              disabled={loading}
            />
            <Button
              label="Radera utkast"
              onPress={onDeleteDraft}
              disabled={loading}
              loading={loading}
              type="outlined"
            />
          </View>
        ) : (
          <LoadingSpinner />
        )}
      </View>
    </BottomSheet>
  );
};
