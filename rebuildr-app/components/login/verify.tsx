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
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fragment, useState } from "react";
import { Platform, View, StyleSheet } from "react-native";
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
  const { isDesktop } = useScreenType();
  const cellCount = 6;
  const ref = useBlurOnFulfill({ value: code, cellCount });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  });
  const styles = Style(colors, isDesktop);

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
    <View
      style={{
        gap: 24,
      }}
    >
      <Display size="small">Du ser ut att vara ny här!</Display>
      <Body size="medium">
        Vi har skickat en kod till: <Title size="small">{email}</Title>
      </Body>
      <Body size="medium">
        Kontrollera din inkorg och ange koden här för att fortsätta. Om du inte
        hittar mailet, kolla även din skräppost.
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
          <Body
            size="small"
            style={{
              textDecorationLine: "underline",
              textDecorationColor: colors.text.link,
            }}
            onPress={() =>
              resendVerificationEmail({ variables: { input: { email } } })
            }
          >
            klicka här för att skicka en ny
          </Body>
        </Body>
      </View>
      <Button label="Fortsätt" onPress={() => verifyEmail()} />
    </View>
  );
};

const Style = (colors: ColorTokens, isDesktop: boolean) =>
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
      width: isDesktop ? 57 : 47,
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
