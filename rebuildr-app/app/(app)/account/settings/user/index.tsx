import { AccountSettingsUserQuery, UserType } from "@/gql/graphql";
import { useQuery } from "@apollo/client";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Display } from "@components/typography/text";
import { View } from "react-native";
import { EmailSetting } from "@components/userSettings/email-setting";
import { AccountSetting } from "@components/userSettings/account-setting";
import { PickupAddressSetting } from "@components/userSettings/pickup-address-setting";
import { OrganizationSetting } from "@components/userSettings/organization-setting";
import { ACCOUNT_SETTINGS_USER } from "@components/userSettings/queries";
import { TransparentModal } from "@components/transparent-modal.tsx/transparent-modal";
import { useScreenType } from "@hooks/useScreenType";

export default function User() {
  const { data } = useQuery<AccountSettingsUserQuery>(ACCOUNT_SETTINGS_USER);
  const { isDesktop } = useScreenType();

  if (!data) {
    if (isDesktop) {
      return (
        <TransparentModal>
          <LoadingSpinner />
        </TransparentModal>
      );
    }
    return <LoadingSpinner />;
  }

  const content = (
    <>
      <Display size="small" style={{ marginBottom: 40 }}>
        Hantera e-post, inlogg och adresser
      </Display>
      <View style={{ gap: 16 }}>
        {data.me.type === UserType.Business && (
          <>
            <OrganizationSetting user={data.me} />
            <Divider />
          </>
        )}
        {data.me.type === UserType.Personal && (
          <>
            <EmailSetting user={data.me} />
            <Divider />
            <AccountSetting user={data.me} />
            <Divider />
          </>
        )}
        <PickupAddressSetting user={data.me} />
        <Divider />
      </View>
    </>
  );

  if (isDesktop) {
    return (
      <TransparentModal>
        <ScreenLayout
          contentHorizontalPadding={0}
          headerComponent={<Header title="Kontaktuppgifter" />}
        >
          {content}
        </ScreenLayout>
      </TransparentModal>
    );
  }

  return (
    <ScreenLayout headerComponent={<Header title="Kontaktuppgifter" />}>
      {content}
    </ScreenLayout>
  );
}
