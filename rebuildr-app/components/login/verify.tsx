import { isLoggedInVar } from "@/apollo/config";
import {
  ResendVerificationMailMutation,
  ResendVerificationMailMutationVariables,
  VerifyEmailMutation,
  VerifyEmailMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Body, Display, Label, Title } from "@components/typography/text";
import { textStyles } from "@components/typography/typeface";
import { ColorTokens } from "@constants/colors";
import { borderRadius, strokeWidth } from "@constants/sizes";
import { LoginModalContext } from "@context/loginModalContext";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fragment, useContext, useState } from "react";
import { Platform, Pressable, View, StyleSheet } from "react-native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

const VERIFY_EMAIL = gql`
  mutation VerifyEmail($input: VerifyEmailInput!) {
    verifyEmail(input: $input) {
      user {
        id
      }
      accessToken
      refreshToken
    }
  }
`;

const RESEND_VERIFICATION_MAIL = gql`
  mutation ResendVerificationMail($input: RegisterUserInput!) {
    registerUser(input: $input) {
      id
    }
  }
`;

type Props = {
  email: string;
  onSuccess: (id: string) => void;
};

export const Verify = ({ email, onSuccess }: Props) => {
  const [code, setCode] = useState("");
  const colors = useThemeColor();
  const { setVisible } = useContext(LoginModalContext);
  const cellCount = 6;
  const ref = useBlurOnFulfill({ value: code, cellCount });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  });
  const styles = Style(colors);

  const [verifyEmail, { error, reset }] = useMutation<
    VerifyEmailMutation,
    VerifyEmailMutationVariables
  >(VERIFY_EMAIL, {
    variables: { input: { email, verifyEmailToken: code } },
    onCompleted: async (data) => {
      await AsyncStorage.multiSet([
        ["access_token", data.verifyEmail.accessToken],
        ["refresh_token", data.verifyEmail.refreshToken],
      ]);
      isLoggedInVar(true);
      onSuccess(data.verifyEmail.user.id);
    },
  });
  const [resendVerificationEmail] = useMutation<
    ResendVerificationMailMutation,
    ResendVerificationMailMutationVariables
  >(RESEND_VERIFICATION_MAIL);

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 1,
          borderColor: colors.dividers.neutral,
          paddingBottom: 8,
        }}
      >
        <Title size="medium">Skapa ditt nya konto</Title>
        <Pressable onPress={() => setVisible(false)}>
          <Icon icon="X" size={18} />
        </Pressable>
      </View>
      <View
        style={{
          paddingTop: 24,
          paddingBottom: 32,
          gap: 24,
        }}
      >
        <Display size="small">Du ser ut att vara ny här!</Display>
        <Body size="medium">
          Vi har skickat en kod till: <Title size="small">{email}</Title>
        </Body>
        <Body size="medium">
          Kontrollera din inkorg och ange koden här för att fortsätta. Om du
          inte hittar mailet, kolla även din skräppost.
        </Body>

        <View>
          <Label size="medium">Klistra in din kod här:</Label>
          <CodeField
            ref={ref}
            {...props}
            value={code}
            onChangeText={(e) => {
              reset();
              setCode(e);
            }}
            cellCount={cellCount}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete={
              Platform.select({
                android: "sms-otp",
                default: "one-time-code",
              }) as keyof React.ComponentProps<typeof CodeField>["autoComplete"]
            }
            renderCell={({ index, symbol, isFocused }) => (
              <Fragment key={index}>
                <Body
                  style={[
                    styles.cell,
                    isFocused && styles.focusCell,
                    error && styles.errorCell,
                  ]}
                  onLayout={getCellOnLayoutHandler(index)}
                >
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Body>
                {index === 2 && (
                  <View key={`separator-${index}`} style={styles.separator} />
                )}
              </Fragment>
            )}
          />
          <Body size="small" style={{ marginTop: 12 }}>
            Om du inte fått koden inom några minuter,{" "}
            <Pressable
              onPress={() =>
                resendVerificationEmail({ variables: { input: { email } } })
              }
            >
              <Body
                size="small"
                style={{
                  textDecorationLine: "underline",
                  textDecorationColor: colors.text.link,
                }}
              >
                klicka här för att skicka en ny
              </Body>
            </Pressable>
          </Body>
        </View>
        <Button label="Fortsätt" onPress={() => verifyEmail()} />
      </View>
    </View>
  );
};

const Style = (colors: ColorTokens) =>
  StyleSheet.create({
    codeFieldRoot: { marginVertical: 4 },
    cell: {
      borderWidth: strokeWidth.regular,
      borderColor: colors.textField.enabled,
      justifyContent: "center",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: colors.background.neutral,
      borderRadius: borderRadius.small,
      height: 40,
      width: 47,
      ...textStyles.body["medium"],
      color: colors.text.primaryDark,
    },
    focusCell: {
      borderColor: colors.textField.clicked,
    },
    errorCell: {
      borderColor: colors.textField.error,
    },
    separator: {
      height: 1,
      width: 12,
      backgroundColor: colors.dividers.neutral,
      alignSelf: "center",
    },
  });
