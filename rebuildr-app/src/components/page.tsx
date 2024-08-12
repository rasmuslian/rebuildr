import React, { PropsWithChildren } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { Title } from "./texts/text";

interface PageProps extends PropsWithChildren {
  title?: string;
  loading?: boolean;
}

export const Page = ({ title, loading, children }: PageProps) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {title && (
        <Title style={[styles.title]} size={"large"}>
          {title}
        </Title>
      )}
      {loading ? <ActivityIndicator size="large" /> : children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 50,
  },
  title: {
    marginBottom: 60,
  },
});
