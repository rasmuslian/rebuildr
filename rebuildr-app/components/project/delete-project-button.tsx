import { Button, ButtonProps } from "@components/buttons/button";
import { useState } from "react";
import { DeleteProjectBottomSheet } from "./delete-project-bottom-sheet";

type DeleteProjectBottomSheetProps = {
  projectId: string;
  onDismiss?: () => void;
  onProjectDeleted: () => void;
} & ButtonProps;

export const DeleteProjectButton = ({
  projectId,
  onDismiss,
  onProjectDeleted,
  ...buttonProps
}: DeleteProjectBottomSheetProps) => {
  const [show, setShow] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const onExit = () => {
    setShow(false);
    onDismiss?.();
  };

  return (
    <>
      <Button
        label="Radera projekt"
        onPress={() => setShow(true)}
        type="tonal"
        loading={deleteLoading}
        {...buttonProps}
      />
      <DeleteProjectBottomSheet
        projectId={projectId}
        show={show}
        onDismiss={onExit}
        onProjectDeleted={onProjectDeleted}
        onDeleteLoading={(isLoading) => setDeleteLoading(isLoading)}
      />
    </>
  );
};
