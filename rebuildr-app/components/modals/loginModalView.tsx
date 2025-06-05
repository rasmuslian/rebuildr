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
import {
  RegisterStatusEnum,
  RegisterUserMutation,
  RegisterUserMutationVariables,
  UserExistsQuery,
  UserExistsQueryVariables,
} from "@/gql/graphql";
import { Details } from "@components/login/details";
import { CreateBusiness } from "@components/login/createBusiness";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { router } from "expo-router";
import { useLogout } from "@hooks/useLogout";
import { useThemeColor } from "@hooks/useThemeColor";

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
    userExists(input: $input) {
      registrationStatus
    }
  }
`;

const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      id
    }
  }
`;

const LoginModalView = () => {
  const colors = useThemeColor();
  const [email, setEmail] = useState("");
  const [wrongPassword, setWrongPassword] = useState(false);
  const { visible, setVisible } = useContext(LoginModalContext);
  const [state, setState] = useState<
    "email" | "password" | "forgotPassword" | "verify" | "details" | "business"
  >("email");

  const [login, { loading }] = useMutation(LOGIN);
  const { logout } = useLogout();
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
        if (
          !data.userExists ||
          data.userExists.registrationStatus === RegisterStatusEnum.Email
        ) {
          registerUser({
            variables: { input: { email } },
            onCompleted: () => {
              setState("verify");
              sheetRef.current?.snapToIndex(fullScreenIndex);
            },
          });
          return;
        }
        setState("password");
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

  const onVerifiedSuccess = (id: string) => {
    setState("details");
  };

  const onCreateBusiness = () => {
    setState("business");
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
      backgroundStyle={{
        backgroundColor: colors.background.neutral,
      }}
      backdropComponent={({ style }) => (
        <Pressable
          style={[style, { backgroundColor: "#0000004D" }]}
          onPress={() => sheetRef.current?.close()}
        />
      )}
    >
      <BottomSheetView>
        <ScreenLayout style={{ marginTop: 0, marginBottom: 0 }}>
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
            <Verify email={email} onSuccess={(id) => onVerifiedSuccess(id)} />
          )}
          {state === "details" && (
            <Details
              onDone={() => {
                setVisible(false);
                router.replace("/");
              }}
              onCreateBusiness={onCreateBusiness}
              onExit={() => {
                setVisible(false);
                logout();
                reloadAppAsync();
                router.replace("/");
              }}
            />
          )}
          {state === "business" && (
            <CreateBusiness
              onDone={() => {
                reloadAppAsync();
                setVisible(false);
              }}
              onExit={() => {
                reloadAppAsync();
                setVisible(false);
              }}
            />
          )}
        </ScreenLayout>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default LoginModalView;
