import { OrganizationMembers } from "@components/account/organization-members";
import { InternalPageLayout } from "@components/internal/internal-page-layout";
import { useRequireAuth } from "@components/require-auth/require-auth";

export default function InternalMembersPage() {
  const { redirect } = useRequireAuth();
  if (redirect) return redirect;

  return (
    <InternalPageLayout contentMaxWidth={900}>
      <OrganizationMembers />
    </InternalPageLayout>
  );
}
