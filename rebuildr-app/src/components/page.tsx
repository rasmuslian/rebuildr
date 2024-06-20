import React, { PropsWithChildren } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Title } from "./texts/text";

interface PageProps extends PropsWithChildren {
  title?: string;
  loading?: boolean;
}

export const Page = ({ title, loading, children }: PageProps) => {
  return (
    <View style={styles.container}>
      {title && (
        <Title style={[styles.title]} size={"large"}>
          {title}
        </Title>
      )}
      {loading ? <ActivityIndicator size="large" /> : children}
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
