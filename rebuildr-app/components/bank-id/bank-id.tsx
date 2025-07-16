import { gql, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import * as Crypto from "expo-crypto";
import {
  AuthResponseStatusEnum,
  BankIdAuthenticationMutation,
  BankIdAuthenticationMutationVariables,
} from "@/gql/graphql";
import { borderRadius } from "@constants/sizes";
import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Body } from "@components/typography/text";

const BANK_ID_AUTHENTICATION = gql`
  mutation BankIdAuthentication($input: AuthenticateRockerInput!) {
    authenticateRocker(input: $input) {
      status
      qrCode
      autoStartToken
    }
  }
`;

interface Props {
  onAuthenticationSuccess: () => void;
  color: string;
  borderColor: string;
}

export const BankId = ({
  onAuthenticationSuccess,
  color,
  borderColor,
}: Props) => {
  const [qrCode, setQrCode] = useState("");
  const [authenticateRocker, { error }] = useMutation<
    BankIdAuthenticationMutation,
    BankIdAuthenticationMutationVariables
  >(BANK_ID_AUTHENTICATION);

  useEffect(() => {
    const requestId = Crypto.randomUUID();
    const timer = setInterval(() => {
      const done = () => clearInterval(timer);

      authenticateRocker({
        variables: {
          input: {
            requestId,
          },
        },
        onCompleted: (data) => {
          if (
            data.authenticateRocker.status === AuthResponseStatusEnum.Success
          ) {
            onAuthenticationSuccess();
            done();
            return;
          }

          if (
            data.authenticateRocker.status === AuthResponseStatusEnum.Error ||
            !data.authenticateRocker.qrCode
          ) {
            done();
            return;
          }
          setQrCode(data.authenticateRocker.qrCode);
        },
        onError: () => {
          done();
        },
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [authenticateRocker, onAuthenticationSuccess]);

  return (
    <>
      {qrCode ? (
        <View
          style={{
            borderRadius: borderRadius.medium,
            borderColor,
            padding: 16,
            borderWidth: 1,
          }}
        >
          <QRCode color={color} value={qrCode} size={165} />
        </View>
      ) : (
        <LoadingSpinner />
      )}
      {error && <Body color="error">Något gick fel</Body>}
    </>
  );
};
