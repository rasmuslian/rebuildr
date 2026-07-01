import { OrganizationMembers } from "@components/account/organization-members";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { useRequireAuth } from "@components/require-auth/require-auth";

export default function AccountOrganizationMembers() {
  const { redirect } = useRequireAuth();
  if (redirect) return redirect;

  return (
    <ScreenLayout
      style={{ marginTop: 24 }}
      headerComponent={<Header title="Organisationsmedlemmar" />}
    >
      <OrganizationMembers />
    </ScreenLayout>
  );
}
