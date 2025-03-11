import { createContext } from "react";

export const LoginModalContext = createContext({
  visible: false,
  setVisible: (visible: boolean) => {},
});
