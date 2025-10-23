import { useApolloClient } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Display } from "@components/typography/text";
import { useCreateOrganization } from "@hooks/use-create-organization";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export default function AddBusiness() {
  const [refetchLoading, setRefetchLoading] = useState(false);
  const client = useApolloClient();
  const {
    orgNumber,
    changeOrgNumber,
    name,
    changeName,
    fieldErrors,
    error,
    canCreate,
    create,
    loading,
    data,
  } = useCreateOrganization();

  useEffect(() => {
    if (data) {
      setRefetchLoading(true);
      client
        .refetchQueries({
          updateCache(cache) {
            cache.evict({ fieldName: "organizationAccount" });
          },
        })
        .then(() => {
          setRefetchLoading(false);
          if (router.canGoBack()) router.back();
          else router.navigate("/account/settings");
        });
    }
  }, [data]);

  return (
    <ScreenLayout
      headerComponent={<Header title="Lägg till ett företagskonto" />}
      footerComponent={
        <Button
          label="Spara"
          onPress={create}
          loading={loading || refetchLoading}
          disabled={!canCreate}
        />
      }
      style={{ gap: 24 }}
    >
      <Display size="small">Om ditt företag</Display>
      <Form
        style={{ gap: 24 }}
        fields={[
          {
            heading: "Organisationsnummer",
            description: "Ange ditt företags organisationsnummer (10 siffror).",
            type: "text",
            inputType: "numeric",
            value: orgNumber,
            onChange: changeOrgNumber,
            error:
              !!error ||
              !!fieldErrors?.find(
                (field) => field.name === "organizationNumber",
              ),
          },
          {
            heading: "Företagsnamn",
            description:
              "Ange det företagsnamn du vill visa publikt på din profil.",
            type: "text",
            value: name,
            onChange: changeName,
            helperText:
              "💡 Observera: Vi verifierar inte företagsnamnet, så se till att du skriver in det exakt som du vill att det ska synas för kunder.",
          },
        ]}
      />
    </ScreenLayout>
  );
}
