import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMutation } from "@apollo/client";
import { gql } from "src/gql";
import { AuthResponseStatusEnum } from "src/gql/graphql";
import * as QRCode from "qrcode";
import { ActivityIndicator, View } from "react-native";
import Colors from "src/styles/colors";
import { Title } from "./texts/text";

const AUTHENTICATE_ROCKER_ACCOUNT = gql(`
    mutation AuthenticateRockerAccount($input: AuthenticateRockerInput!) {
     authenticateRocker(input: $input) {
       status
       qrCode
       autoStartToken
     }
   }  
   `);

interface Props {
  onAuthenticationSuccess: () => void;
}

export const BankId = ({ onAuthenticationSuccess }: Props) => {
  const [qrCodeImg, setQrCodeImg] = useState<string>();

  const [authenticateRockerAccount, { error }] = useMutation(
    AUTHENTICATE_ROCKER_ACCOUNT,
  );

  useEffect(() => {
    const requestId = uuidv4();
    const timer = setInterval(() => {
      const done = () => clearInterval(timer);

      authenticateRockerAccount({
        variables: {
          input: {
            requestId,
          },
        },
        onCompleted: (data) => {
          console.log("data :>> ", data);
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

          QRCode.toDataURL(data.authenticateRocker.qrCode, function (err, url) {
            setQrCodeImg(url);
          });
        },
        onError: () => {
          done();
          return;
        },
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [authenticateRockerAccount, onAuthenticationSuccess]);

  return (
    <View
      style={{ padding: 40, backgroundColor: Colors.white, borderRadius: 20 }}
    >
      {!error ? (
        <Title>Något gick fel</Title>
      ) : (
        <>
          <Title>Scanna QR-koden</Title>
          {qrCodeImg ? (
            <img
              style={{
                display: "block",
                width: "100%",
                maxWidth: "200px",
              }}
              src={qrCodeImg}
              alt=""
            />
          ) : (
            <ActivityIndicator size="large" />
          )}
        </>
      )}
    </View>
  );
};
