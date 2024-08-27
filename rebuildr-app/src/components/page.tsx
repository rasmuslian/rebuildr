import React, { PropsWithChildren } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Footer } from "./footer";
import { Headline } from "./texts/text";

interface PageProps extends PropsWithChildren {
  title?: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Page = ({ title, loading, children, style }: PageProps) => {
  return (
    <ScrollView contentContainerStyle={[styles.container, style]}>
      {title && <Headline style={styles.title}>{title}</Headline>}
      {loading ? <ActivityIndicator size="large" /> : children}
      <Footer />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  title: {
    marginBottom: 60,
    alignSelf: "center",
  },
});
