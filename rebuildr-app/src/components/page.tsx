import React, { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { Title } from "./texts/text";

interface PageProps extends PropsWithChildren {
  title?: string;
}

export const Page = ({ title, children }: PageProps) => {
  return (
    <View style={styles.container}>
      {title && (
        <Title style={[styles.title]} size={"large"}>
          {title}
        </Title>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  title: {
    marginTop: 40,
    marginBottom: 60,
  },
});
