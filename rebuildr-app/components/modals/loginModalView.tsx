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
import ForgotPassword from "@components/login/forgotPassword";
import { gql, useMutation } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isLoggedInVar } from "@/apollo/config";
import { trackEvent } from "@/utils/analytics";
import { reloadAppAsync } from "expo";
import { Verify } from "@components/login/verify";
import { VerifyBankId } from "@components/login/verify-bankid";
import {
  RegisterUserMutation,
  RegisterUserMutationVariables,
} from "@/gql/graphql";
import { Details } from "@components/login/details";
import Register from "@components/login/register";
import RegisterBusiness from "@components/login/register-business";
import { router } from "expo-router";
import { useLogout } from "@hooks/useLogout";
import { useScreenType } from "@hooks/useScreenType";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Header } from "@components/navigation/headers/header";
import { Platform, View } from "react-native";
import { GTMTagEnum } from "@constants/google-tag-manager";
import { WelcomeRegistrationModal } from "@components/modals/welcome-registration-modal";
import { useSellProductContext } from "@context/sell-product-context";

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
  const [pendingApproval, setPendingApproval] = useState(false);
  const { visible, setVisible } = useContext(LoginModalContext);
  const [state, setState] = useState<
    | "email"
    | "register"
    | "register-business"
    | "forgotPassword"
    | "verify"
    | "bankid"
    | "details"
  >("email");
  const [showWelcome, setShowWelcome] = useState(false);
  const [isBusinessRegistration, setIsBusinessRegistration] = useState(false);
  const [isBusinessApproved, setIsBusinessApproved] = useState(false);
  const { setVisible: setSellVisible } = useSellProductContext();

  const [login, { loading }] = useMutation(LOGIN);
  const { logout } = useLogout();
  const [resetPassword] = useMutation(RESET_PASSWORD);

  const reset = () => {
    setState("email");
    setEmail("");
    setWrongPassword(false);
    setPendingApproval(false);
    setIsBusinessRegistration(false);
    setIsBusinessApproved(false);
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
        if (Platform.OS === "web") {
          window.location.replace("/");
        } else {
          reloadAppAsync();
        }
      },
      onError: (error) => {
        const isPending = error.graphQLErrors.some(
          (e) => e.extensions?.code === "BUSINESS_PENDING_APPROVAL",
        );
        if (isPending) {
          setPendingApproval(true);
        } else {
          setWrongPassword(true);
        }
      },
    });
  };
  const [registerUser, { loading: registerUserLoading }] = useMutation<
    RegisterUserMutation,
    RegisterUserMutationVariables
  >(REGISTER_USER);

  const fullScreenIndex = 2;
  const sheetRef = useRef<BottomSheetModal>(null);

  const handleClosePress = useCallback(() => {
    switch (state) {
      case "email":
      case "register":
      case "register-business":
      case "forgotPassword":
      case "verify":
        reset();
        setVisible(false);
        break;
      case "bankid":
      case "details":
        if (showWelcome) break;
        setVisible(false);
        logout();
        reloadAppAsync();
        router.replace("/");
        break;
      default:
        reset();
        setVisible(false);
    }
  }, [state, showWelcome, setVisible, logout]);

  const onCreatePersonalAccount = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setState("register");
  };

  const onCreateBusinessAccount = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setIsBusinessRegistration(true);
    setState("register-business");
  };

  const onSubmitRegisterEmail = (submittedEmail: string) => {
    if (registerUserLoading) return;
    setEmail(submittedEmail);
    registerUser({
      variables: { input: { email: submittedEmail } },
      onCompleted: () => {
        trackEvent(GTMTagEnum.SIGN_UP, { method: "email" });
        setState("verify");
        sheetRef.current?.snapToIndex(fullScreenIndex);
      },
    });
  };

  const onSubmitRegisterBusiness = (
    submittedEmail: string,
    orgNumber: string,
  ) => {
    if (registerUserLoading) return;
    setEmail(submittedEmail);
    registerUser({
      variables: {
        input: { email: submittedEmail, organizationNumber: orgNumber },
      },
      onCompleted: () => {
        trackEvent(GTMTagEnum.SIGN_UP, { method: "email" });
        setState("verify");
        sheetRef.current?.snapToIndex(fullScreenIndex);
      },
    });
  };

  const onForgotPassword = (submittedEmail: string) => {
    setEmail(submittedEmail);
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
    setState(isBusinessRegistration ? "bankid" : "details");
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
        onLogin={onLogin}
        onForgotPassword={onForgotPassword}
        onCreatePersonalAccount={onCreatePersonalAccount}
        onCreateBusinessAccount={onCreateBusinessAccount}
        wrongPassword={wrongPassword}
        pendingApproval={pendingApproval}
        loading={loading}
        initialEmail={email}
      />
    ),
    state === "register" && (
      <Register
        key="register"
        onSubmit={onSubmitRegisterEmail}
        initialEmail={email}
        loading={registerUserLoading}
      />
    ),
    state === "register-business" && (
      <RegisterBusiness
        key="register-business"
        onSubmit={onSubmitRegisterBusiness}
        initialEmail={email}
        loading={registerUserLoading}
      />
    ),
    state === "forgotPassword" && (
      <ForgotPassword
        key="forgotPassword"
        onBack={() => setState("email")}
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
    state === "bankid" && (
      <VerifyBankId key="bankid" onSuccess={() => setState("details")} />
    ),
    state === "details" && (
      <Details
        key="details"
        onDone={async (isApproved) => {
          setIsBusinessApproved(isApproved);
          if (isBusinessRegistration && !isApproved) {
            await logout();
          }
          setShowWelcome(true);
        }}
        onExit={() => {
          setVisible(false);
          logout();
          reloadAppAsync();
          router.replace("/");
        }}
      />
    ),
  ];

  const getTitle = () => {
    switch (state) {
      case "email":
        return "Logga in eller skapa konto";
      case "register":
        return "Skapa ett privat konto";
      case "register-business":
        return "Skapa ditt nya företagkonto";
      case "forgotPassword":
        return "Logga in";
      case "verify":
      case "bankid":
      case "details":
        return "Skapa ditt nya konto";
      default:
        return "";
    }
  };
  let onBackFunction = null;
  if (state === "register" || state === "register-business") {
    onBackFunction = () => setState("email");
  }
  if (state === "forgotPassword") {
    onBackFunction = () => setState("email");
  }

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    setVisible(false);
    reset();
    router.replace("/");
  };

  const handleWelcomeCreateListing = () => {
    setShowWelcome(false);
    setVisible(false);
    reset();
    router.replace("/");
    setSellVisible(true);
  };

  const loginModal = isDesktop ? (
    <SlideInSheet
      title={getTitle()}
      open={visible}
      onClose={handleClosePress}
      style={{ flex: 1 }}
    >
      {viewChildren}
    </SlideInSheet>
  ) : (
    <BottomSheet
      name="login"
      scrollable={["verify", "bankid", "details", "business"].includes(state)}
      screenHeight={["verify", "bankid", "details", "business"].includes(state)}
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

  return (
    <>
      {loginModal}
      <WelcomeRegistrationModal
        open={showWelcome}
        onClose={handleWelcomeClose}
        onCreateListing={handleWelcomeCreateListing}
        isBusiness={isBusinessRegistration}
        isApproved={isBusinessApproved}
      />
    </>
  );
};

export default LoginModalView;
