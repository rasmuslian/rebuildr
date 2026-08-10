import { PropsWithChildren, ReactElement } from "react";

//native: sheets need no relocation, render where they are
export const SheetPortal = ({ children }: PropsWithChildren) =>
  children as ReactElement;
