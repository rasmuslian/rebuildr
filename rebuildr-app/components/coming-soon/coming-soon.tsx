import { Body, Display } from "@components/typography/text";
import { ImageBackground } from "expo-image";
import ComingSoonBackground from "@assets/images/coming-soon-background.png";
import { View } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { Button } from "@components/buttons/button";
import { useState } from "react";
import { Logo } from "@components/logo/logo";
import { borderRadius } from "@constants/sizes";
import { Form } from "@components/forms/form";
import { gql, useMutation } from "@apollo/client";
import {
  ComingSoonSignUpMutation,
  ComingSoonSignUpMutationVariables,
} from "@/gql/graphql";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { useScreenType } from "@hooks/useScreenType";

const COMING_SOON_SIGN_UP = gql`
  mutation ComingSoonSignUp($input: SignupNewsLetterInput!) {
    signupNewsLetter(input: $input)
  }
`;

export const ComingSoon = () => {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();

  const [signup, { data, loading, error }] = useMutation<
    ComingSoonSignUpMutation,
    ComingSoonSignUpMutationVariables
  >(COMING_SOON_SIGN_UP);
  return (
    <ImageBackground
      source={ComingSoonBackground}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          gap: isDesktop ? 40 : 24,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.logo.background,
          padding: 32,
          borderRadius: borderRadius.medium,
        }}
      >
        <Logo
          width={isDesktop ? 217 : 166}
          height={isDesktop ? 44 : 34}
          theme="dark"
        />
        {data && (
          <View style={{ gap: 24 }}>
            <Display size="small" style={{ textAlign: "center" }}>
              Tack!
            </Display>
            <Body size="medium" style={{ textAlign: "center", flex: 1 }}>
              Du har nu registrerat dig och kan följa med oss i väntan på att
              Sveriges nya marknadsplats Rebuildr öppnar.
            </Body>
          </View>
        )}
        {!data && (
          <>
            <Body
              size={isDesktop ? "large" : "small"}
              style={{
                textAlign: "center",
                maxWidth: isDesktop ? 536 : 279,
                color: colors.logo.vector,
              }}
            >
              Här öppnar inom kort Sveriges nya marknadsplats för återbruk av
              byggmaterial och verktyg. I väntan på detta kan du anmäla dig till
              vårt nyhetsbrev och följa vårt arbete med RebuildR bakom
              kulisserna.
            </Body>
            {showForm ? (
              loading ? (
                <LoadingSpinner />
              ) : (
                <Form
                  fields={[
                    {
                      type: "text",
                      value: email,
                      onChange: setEmail,
                      placeholder: "Ange din e-post...",
                      onSubmitEditing: () =>
                        signup({ variables: { input: { email } } }),
                      error: error?.message ?? undefined,
                    },
                  ]}
                />
              )
            ) : (
              <Button
                icon="arrowRight"
                iconPosition="left"
                label="Registrera din e-post"
                onPress={() => setShowForm(true)}
              />
            )}
          </>
        )}
      </View>
    </ImageBackground>
  );
};
