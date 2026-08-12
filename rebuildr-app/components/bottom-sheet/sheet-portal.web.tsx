import { PropsWithChildren } from "react";
import { createPortal } from "react-dom";

//Rendered in place, an overlay is trapped inside whatever stacking context its
//ancestors create — page chrome further down the document (a sticky buy bar,
//say) paints on top of it whatever its own z-index. Portaling to document.body
//puts it in the root stacking context, above the page. React context (and with
//it the sheet's provider) is preserved across the portal.
export const SheetPortal = ({ children }: PropsWithChildren) =>
  createPortal(children, document.body);
