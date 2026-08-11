import {
  DeleteProjectMutation,
  DeleteProjectMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Display, Body } from "@components/typography/text";
import { View } from "react-native";
import { Button } from "@components/buttons/button";
import { useScreenType } from "@hooks/useScreenType";
import { Popup } from "@components/popup/popup";
import { Header } from "@components/navigation/headers/header";
import { GET_PROJECTS } from "@/app/(app)/project-list/[userId]";

const DELETE_PROJECT = gql`
  mutation DeleteProject($input: DeleteProjectInput!) {
    deleteProject(input: $input)
  }
`;

type DeleteProjectBottomSheetProps = {
  projectId: string;
  show: boolean;
  onDismiss: () => void;
  onProjectDeleted: () => void;
  onDeleteLoading?: (isLoading: boolean) => void;
};

export const DeleteProjectBottomSheet = ({
  projectId,
  show,
  onDismiss,
  onProjectDeleted,
  onDeleteLoading,
}: DeleteProjectBottomSheetProps) => {
  const { isDesktop } = useScreenType();
  const [deleteProject, { loading, error }] = useMutation<
    DeleteProjectMutation,
    DeleteProjectMutationVariables
  >(DELETE_PROJECT);

  const onDeleteProject = async () => {
    if (loading) {
      return;
    }
    onDeleteLoading?.(true);
    const res = await deleteProject({
      variables: { input: { id: projectId } },
      refetchQueries: [GET_PROJECTS],
    });
    onDeleteLoading?.(false);
    if (res.errors) {
      return;
    }

    onProjectDeleted();
  };

  const content = (
    <View
      style={[
        { gap: 24 },
        //space-between + flex only fill the fixed-height desktop popup. On
        //mobile the sheet is dynamically sized, so flex: 1 would stretch this
        //to the full window and space-between would push the buttons far down.
        isDesktop && { justifyContent: "space-between", flex: 1 },
      ]}
    >
      <View style={{ gap: 24 }}>
        <Display size="small" style={{ textAlign: "center" }}>
          Är du säker på att du vill radera projektet?
        </Display>

        {error && <Body color="error">Något gick fel</Body>}
      </View>

      <View style={{ gap: 8, paddingTop: 24 }}>
        <Button
          label="Ja, radera projektet"
          onPress={onDeleteProject}
          loading={loading}
          type="danger"
        />
        <Button
          label="Nej"
          onPress={onDismiss}
          disabled={loading}
          type="outlined"
        />
      </View>
    </View>
  );

  if (isDesktop) {
    return (
      <Popup open={show} onClose={onDismiss}>
        <View
          style={{
            padding: 24,
            justifyContent: "center",
          }}
        >
          <Header
            title="Radera projekt"
            showBackButton={false}
            showDivider
            ctas={[
              {
                icon: "X",
                onPress: onDismiss,
              },
            ]}
          />
          <View style={{ padding: 48 }}>{content}</View>
        </View>
      </Popup>
    );
  }

  return (
    <BottomSheet
      name="Radera projekt"
      title="Radera projekt"
      open={show}
      onDismiss={onDismiss}
    >
      {content}
    </BottomSheet>
  );
};
