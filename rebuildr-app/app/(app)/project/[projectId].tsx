import { makeVar } from "@apollo/client";
import { useLocalSearchParams } from "expo-router";
import { useRef } from "react";

import { ProjectDesktop } from "@components/project/project.desktop";
import { ProjectMobile } from "@components/project/project.mobile";
import { Filter, initialFilterProduct } from "@context/filter-product-context";
import {
  FilterProductScopeProvider,
  OwnFilterScope,
} from "@context/filter-product-scope-context";
import { useScreenType } from "@hooks/useScreenType";

export default function ProjectPage() {
  const { isDesktop } = useScreenType();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

  // A filter of its own per project, so opening one always starts on its full
  // ad list and nothing chosen here reaches the app-wide filter. It lives above
  // the desktop/mobile split because the screen type only settles after the
  // first render, which would otherwise build the filter twice.
  const scopeRef = useRef<
    { projectId: string; scope: OwnFilterScope } | undefined
  >(undefined);

  if (scopeRef.current?.projectId !== projectId) {
    scopeRef.current = {
      projectId,
      scope: {
        filterVar: makeVar<Filter>(initialFilterProduct),
        hideDistanceSorting: true,
        facetProjectId: projectId,
      },
    };
  }

  return (
    <FilterProductScopeProvider scope={scopeRef.current.scope}>
      {isDesktop ? <ProjectDesktop /> : <ProjectMobile />}
    </FilterProductScopeProvider>
  );
}
