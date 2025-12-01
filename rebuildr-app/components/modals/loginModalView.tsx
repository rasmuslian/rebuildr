import React, {
  useCallback,
  useRef,
  useContext,
  useEffect,
  useState,
} from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
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
import { router } from "expo-router";
import { useLogout } from "@hooks/useLogout";
import { useScreenType } from "@hooks/useScreenType";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Header } from "@components/navigation/headers/header";
import { View } from "react-native";

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
  const { isDesktop } = useScreenType();
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

  const fullScreenIndex = 2;
  const sheetRef = useRef<BottomSheetModal>(null);

  const handleClosePress = useCallback(() => {
    switch (state) {
      case "email":
      case "password":
      case "forgotPassword":
      case "verify":
        reset();
        setVisible(false);
        break;
      case "details":
        setVisible(false);
        logout();
        reloadAppAsync();
        router.replace("/");
        break;
      case "business":
        reloadAppAsync();
        setVisible(false);
        break;
      default:
        reset();
        setVisible(false);
    }
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
          data.userExists.registrationStatus === RegisterStatusEnum.Email ||
          data.userExists.registrationStatus === RegisterStatusEnum.Details
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

  const viewChildren = [
    state === "email" && (
      <Email
        key="email"
        onSubmit={(email) => {
          onSubmitEmail(email);
        }}
        initialEmail={email}
      />
    ),
    state === "password" && (
      <Password
        key="password"
        onBack={() => setState("email")}
        onSubmit={(password) => {
          onSubmitPassword(password);
        }}
        onForgotPassword={onForgotPassword}
        wrongPassword={wrongPassword}
      />
    ),
    state === "forgotPassword" && (
      <ForgotPassword
        key="forgotPassword"
        onBack={() => setState("password")}
        onSubmit={onRequestPasswordReset}
        currentEmail={email}
      />
    ),
    state === "verify" && (
      <Verify
        key="verify"
        email={email}
        onSuccess={(id) => onVerifiedSuccess(id)}
      />
    ),
    state === "details" && (
      <Details
        key="details"
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
    ),
    state === "business" && (
      <CreateBusiness
        key="business"
        onDone={() => {
          reloadAppAsync();
          setVisible(false);
        }}
        onExit={() => {
          reloadAppAsync();
          setVisible(false);
        }}
      />
    ),
  ];

  const getTitle = () => {
    switch (state) {
      case "email":
        return "Logga in eller skapa konto";
      case "password":
      case "forgotPassword":
        return "Logga in";
      case "verify":
      case "details":
      case "business":
        return "Skapa ditt nya konto";
      default:
        return "";
    }
  };
  let onBackFunction = null;
  if (state === "password") {
    onBackFunction = () => setState("email");
  }
  if (state === "forgotPassword") {
    onBackFunction = () => setState("password");
  }

  if (isDesktop) {
    return (
      <SlideInSheet
        title={getTitle()}
        open={visible}
        onClose={handleClosePress}
        style={{ flex: 1 }}
      >
        {viewChildren}
      </SlideInSheet>
    );
  }

  return (
    <BottomSheet
      name="login"
      scrollable={["verify", "details", "business"].includes(state)}
      screenHeight={["verify", "details", "business"].includes(state)}
      containerStyle={{ flex: 1 }}
      header={
        <Header
          title={getTitle()}
          showBackButton={!!onBackFunction}
          onBack={onBackFunction ?? undefined}
          ctas={[
            {
              icon: "X",
              onPress: () => {
                handleClosePress();
              },
            },
          ]}
        />
      }
      open={visible}
      onDismiss={handleClosePress}
    >
      <View style={{ marginTop: 24, marginBottom: 12, flex: 1 }}>
        {viewChildren}
      </View>
    </BottomSheet>
  );
};

export default LoginModalView;
