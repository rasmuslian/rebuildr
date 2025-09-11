import { HandleDraftContext } from "@context/handle-draft-context";
import { useContext } from "react";

export const useHandleDraft = () => {
  return useContext(HandleDraftContext);
};
