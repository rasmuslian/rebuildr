import { useScreenType } from "@hooks/useScreenType";
import { ProjectDesktop } from "@components/project/project.desktop";
import { ProjectMobile } from "@components/project/project.mobile";

export default function ProjectPage() {
  const { isDesktop } = useScreenType();

  if (isDesktop) {
    return <ProjectDesktop />;
  } else {
    return <ProjectMobile />;
  }
}
