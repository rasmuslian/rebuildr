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
import { useScreenType } from "@hooks/useScreenType";
import { useLocalSearchParams } from "expo-router";

type Props = {
  onBack?: () => void;
  initialSection?: string;
};

export default function User({ onBack, initialSection }: Props) {
  const { data } = useQuery<AccountSettingsUserQuery>(ACCOUNT_SETTINGS_USER);
  const { isDesktop } = useScreenType();
  const { initialSection: initialSectionFromParams } = useLocalSearchParams<{
    initialSection?: string;
  }>();

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenLayout
      contentHorizontalPadding={isDesktop ? 0 : undefined}
      headerComponent={<Header title="Kontaktuppgifter" onBack={onBack} />}
    >
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
            <EmailSetting
              user={data.me}
              initialOpen={
                initialSection === "email" ||
                initialSectionFromParams === "email"
              }
            />
            <Divider />
            <AccountSetting user={data.me} />
            <Divider />
          </>
        )}
        <PickupAddressSetting user={data.me} />
      </View>
    </ScreenLayout>
  );
}
