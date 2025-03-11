import React, {
  useCallback,
  useRef,
  useMemo,
  useContext,
  useEffect,
  useState,
} from "react";
import { Pressable } from "react-native-gesture-handler";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { LoginModalContext } from "@context/loginModalContext";
import Login from "@components/login/login";
import Password from "@components/login/password";
import ForgotPassword from "@components/login/forgotPassword";
import { gql, useMutation } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isLoggedInVar } from "@/apollo/config";

const LOGIN = gql(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        email
      }
    }
  }
`);

const LoginModalView = () => {
  const [email, setEmail] = useState("");
  const [wrongPassword, setWrongPassword] = useState(false);
  const { visible, setVisible } = useContext(LoginModalContext);
  const [state, setState] = useState<"login" | "password" | "forgotPassword">(
    "login",
  );

  const [login, { loading }] = useMutation(LOGIN);

  const reset = () => {
    setState("login");
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
      },
      onError: (e) => {
        setWrongPassword(true);
      },
    });
  };

  const sheetRef = useRef<BottomSheetModal>(null);

  //variables
  const snapPoints = useMemo(() => ["50%", "90%", "100%"], []);

  const handleClosePress = useCallback(() => {
    reset();
    setVisible(false);
  }, [setVisible]);

  const onSubmitEmail = (email: string) => {
    //TODO: check if email exist

    //if it does, set it
    setState("password");
    setEmail(email);

    //if not, continue to sign up flow
    //TODO: sign up flow
  };

  const onSubmitPassword = (password: string) => {
    onLogin(email, password);
  };

  const onForgotPassword = () => {
    setState("forgotPassword");
  };

  const onRequestPasswordReset = () => {
    //TODO: reset password
    handleClosePress();
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
      snapPoints={snapPoints}
      enableDynamicSizing
      onDismiss={handleClosePress}
      handleIndicatorStyle={{
        display: "none",
      }}
      backdropComponent={({ style }) => (
        <Pressable
          style={[style, { backgroundColor: "#0000004D" }]}
          onPress={() => sheetRef.current.close()}
        />
      )}
    >
      <BottomSheetView style={{ marginHorizontal: 16 }}>
        {state === "login" && (
          <Login
            onLogin={(email) => {
              onSubmitEmail(email);
            }}
          />
        )}
        {state === "password" && (
          <Password
            onBack={() => setState("login")}
            onLogin={(password) => {
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
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default LoginModalView;
