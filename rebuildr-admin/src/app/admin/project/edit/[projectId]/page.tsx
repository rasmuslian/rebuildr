import React from "react";
import { notFound } from "next/navigation";
import EditProject from "@/components/project/edit-project";
import { getProject } from "@/queries/project/get-project";

type Props = {
  params: Promise<{ projectId: string }>;
};

const EditProjectPage = async ({ params }: Props) => {
  const { projectId } = await params;
  const project = await getProject({ id: projectId });

  if (!project) notFound();

  return (
    <div className="flex max-w-screen-lg flex-col gap-5">
      <EditProject project={project} />
    </div>
  );
};

export default EditProjectPage;
