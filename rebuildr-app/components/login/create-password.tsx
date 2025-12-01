import { Form } from "@components/forms/form";
import { Body } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { useState } from "react";
import { View } from "react-native";

enum PasswordRequirementEnum {
  ENOUGH_CHARS = "ENOUGH_CHARS",
  UPPER_CASE = "UPPER_CASE",
  LOWER_CASE = "LOWER_CASE",
  NON_LETTER = "NON_LETTER",
  REPEAT = "REPEAT",
}
type PasswordValidationType = {
  [key in PasswordRequirementEnum]: boolean | null;
};
const PasswordReuirementText: { [key in PasswordRequirementEnum]: string } = {
  ENOUGH_CHARS: "Minst 8 tecken",
  UPPER_CASE: "En bokstav i UPPERCASE",
  LOWER_CASE: "En bokstav med liten bokstav",
  NON_LETTER: "Minst en siffra eller ett specialtecken",
  REPEAT: "Inte mer än två upprepande tecken i rad",
};

const initalValidationResult: PasswordValidationType = {
  ENOUGH_CHARS: null,
  UPPER_CASE: null,
  LOWER_CASE: null,
  NON_LETTER: null,
  REPEAT: null,
};

type Props = {
  password: string;
  onChangePassword: (password: string) => void;
  onChangeValidity: (valid: boolean) => void;
  loading?: boolean;
};

export const CreatePassword = ({
  password,
  onChangePassword,
  onChangeValidity,
  loading,
}: Props) => {
  const [pwValidationResult, setPwValidationResult] =
    useState<PasswordValidationType>(initalValidationResult);

  const onChange = (password: string) => {
    if (!password) {
      onChangePassword(password);
      setPwValidationResult(initalValidationResult);
      onChangeValidity(false);
      return;
    }
    const nonLetterRegex = new RegExp(/[!@#$%^&*(),.?":{}|<>\d]/);
    const repeatingRegex = new RegExp(/(.)\1{2,}/);
    const validationResult: PasswordValidationType = {
      ENOUGH_CHARS: password.length >= 8,
      UPPER_CASE: password !== password.toLowerCase(),
      LOWER_CASE: password !== password.toUpperCase(),
      NON_LETTER: nonLetterRegex.test(password),
      REPEAT: !repeatingRegex.test(password),
    };

    const passwordCorrect = Object.values(validationResult).every(
      (res) => !!res,
    );

    onChangeValidity(passwordCorrect);
    setPwValidationResult(validationResult);
    onChangePassword(password);
  };

  return (
    <View>
      <Form
        fields={[
          {
            type: "masked",
            heading: "Välj ett lösenord",
            value: password,
            onChange: (v) => onChange(v),
            disabled: loading,
          },
        ]}
      />
      <Body
        size="small"
        style={{ marginTop: 12, marginBottom: 16 }}
        color="secondary"
      >
        Se till att ditt lösenord innehåller följande:
      </Body>
      <View style={{ gap: 4 }}>
        {Object.keys(PasswordRequirementEnum).map((key, i) => {
          const req: PasswordRequirementEnum = key as PasswordRequirementEnum;

          return (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              key={i}
            >
              {pwValidationResult[req] === null && (
                <>
                  <Icon icon="bullet" size={14} />
                  <Body size="small" color="secondary">
                    {PasswordReuirementText[req]}
                  </Body>
                </>
              )}
              {pwValidationResult[req] === false && (
                <>
                  <Icon icon="X" color="error" size={14} />
                  <Body size="small" color="error">
                    {PasswordReuirementText[req]}
                  </Body>
                </>
              )}
              {pwValidationResult[req] === true && (
                <>
                  <Icon icon="check" color="success" size={14} />
                  <Body size="small" color="success">
                    {PasswordReuirementText[req]}
                  </Body>
                </>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};
