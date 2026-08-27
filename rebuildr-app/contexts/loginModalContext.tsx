import { createContext } from "react";

export type LoginModalIntent = "private" | "business";

export const LoginModalContext = createContext({
  visible: false,
  // Set when a caller wants the modal opened straight on a registration flow
  // instead of the combined login/choose-account screen.
  intent: undefined as LoginModalIntent | undefined,
  setVisible: (visible: boolean, options?: { intent?: LoginModalIntent }) => {},
});
