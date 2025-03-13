import React, {
  useCallback,
  useRef,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { Pressable } from "react-native-gesture-handler";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { LoginModalContext } from "@context/loginModalContext";
import Email from "@components/login/email";
import Password from "@components/login/password";
import ForgotPassword from "@components/login/forgotPassword";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isLoggedInVar } from "@/apollo/config";
import { reloadAppAsync } from "expo";
import { Verify } from "@components/login/verify";
import { Body } from "@components/typography/text";
import {
  RegisterStatusEnum,
  RegisterUserMutation,
  RegisterUserMutationVariables,
  UserExistsQuery,
  UserExistsQueryVariables,
} from "@/gql/graphql";

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        email
      }
    }
  }
`;

const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      message
    }
  }
`;

const USER_EXISTS = gql`
  query UserExists($input: UserExistsInput!) {
    userExists(input: $input)
  }
`;

export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      id
    }
  }
`;

const LoginModalView = () => {
  const [email, setEmail] = useState("");
  const [wrongPassword, setWrongPassword] = useState(false);
  const { visible, setVisible } = useContext(LoginModalContext);
  const [state, setState] = useState<
    "email" | "password" | "forgotPassword" | "verify" | "details"
  >("email");

  const [login, { loading }] = useMutation(LOGIN);
  const [resetPassword] = useMutation(RESET_PASSWORD);

  const reset = () => {
    setState("email");
    setEmail("");
    setWrongPassword(false);
  };

  const onLogin = async (email: string, password: string) => {
    setWrongPassword(false);
    if (loading) {
      return;
    }
    login({
      variables: {
        input: {
          email,
          password,
        },
      },
      onCompleted: async (data) => {
        await AsyncStorage.multiSet([
          ["access_token", data.login.accessToken],
          ["refresh_token", data.login.refreshToken],
        ]);
        isLoggedInVar(true);
        reset();
        setVisible(false);
        reloadAppAsync();
      },
      onError: () => {
        setWrongPassword(true);
      },
    });
  };
  const [userExists, { loading: userExistsLoading }] = useLazyQuery<
    UserExistsQuery,
    UserExistsQueryVariables
  >(USER_EXISTS, { fetchPolicy: "network-only" });
  const [registerUser, { loading: registerUserLoading }] = useMutation<
    RegisterUserMutation,
    RegisterUserMutationVariables
  >(REGISTER_USER);

  const snapPoints = useMemo(() => ["50%", "100%"], []);
  const fullScreenIndex = 2;
  const sheetRef = useRef<BottomSheetModal>(null);

  const handleClosePress = useCallback(() => {
    reset();
    setVisible(false);
  }, [setVisible]);

  const onSubmitEmail = (email: string) => {
    if (userExistsLoading || registerUserLoading) {
      return;
    }
    setEmail(email);

    userExists({
      variables: { input: { email } },
      onCompleted: (data) => {
        switch (data.userExists) {
          case RegisterStatusEnum.Email:
            registerUser({
              variables: { input: { email } },
              onCompleted: () => {
                setState("verify");
                sheetRef.current?.snapToIndex(fullScreenIndex);
              },
            });
            return;
          case RegisterStatusEnum.Details:
            setState("details");
            sheetRef.current?.snapToIndex(fullScreenIndex);
            return;
          case RegisterStatusEnum.Finished:
            setState("password");
        }
      },
    });
  };

  const onSubmitPassword = (password: string) => {
    onLogin(email, password);
  };

  const onForgotPassword = () => {
    setState("forgotPassword");
  };

  const onRequestPasswordReset = async () => {
    await resetPassword({
      variables: {
        input: {
          email,
        },
      },
    });
    handleClosePress();
  };

  const onVerifiedSuccess = () => {
    setState("details");
  };

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      snapPoints={snapPoints}
      onDismiss={handleClosePress}
      handleIndicatorStyle={{
        display: "none",
      }}
      backdropComponent={({ style }) => (
        <Pressable
          style={[style, { backgroundColor: "#0000004D" }]}
          onPress={() => sheetRef.current?.close()}
        />
      )}
    >
      <BottomSheetView style={{ marginHorizontal: 16 }}>
        {state === "email" && (
          <Email
            onSubmit={(email) => {
              onSubmitEmail(email);
            }}
            initialEmail={email}
          />
        )}
        {state === "password" && (
          <Password
            onBack={() => setState("email")}
            onSubmit={(password) => {
              onSubmitPassword(password);
            }}
            onForgotPassword={onForgotPassword}
            wrongPassword={wrongPassword}
          />
        )}
        {state === "forgotPassword" && (
          <ForgotPassword
            onBack={() => setState("password")}
            onSubmit={onRequestPasswordReset}
            currentEmail={email}
          />
        )}
        {state === "verify" && (
          <Verify email={email} onSuccess={() => onVerifiedSuccess()} />
        )}
        {state === "details" && <Body>Details screen</Body>}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default LoginModalView;
