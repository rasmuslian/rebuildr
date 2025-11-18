import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { TransparentModal } from "@components/transparent-modal.tsx/transparent-modal";
import { Display } from "@components/typography/text";
import { useCreateOrganization } from "@hooks/use-create-organization";
import { useScreenType } from "@hooks/useScreenType";
import { router } from "expo-router";
import { useEffect } from "react";

export default function AddBusiness() {
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
  const { isDesktop } = useScreenType();

  useEffect(() => {
    if (data) {
      if (router.canGoBack()) router.back();
      else router.navigate("/account/settings");
    }
  }, [data]);

  const content = (
    <>
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
    </>
  );

  if (isDesktop) {
    return (
      <TransparentModal>
        <ScreenLayout
          contentHorizontalPadding={0}
          headerComponent={<Header title="Lägg till ett företagskonto" />}
          footerComponent={
            <Button
              label="Spara"
              onPress={create}
              loading={loading}
              disabled={!canCreate}
            />
          }
          style={{ gap: 24 }}
        >
          {content}
        </ScreenLayout>
      </TransparentModal>
    );
  }

  return (
    <ScreenLayout
      headerComponent={<Header title="Lägg till ett företagskonto" />}
      footerComponent={
        <Button
          label="Spara"
          onPress={create}
          loading={loading}
          disabled={!canCreate}
        />
      }
      style={{ gap: 24 }}
    >
      {content}
    </ScreenLayout>
  );
}
