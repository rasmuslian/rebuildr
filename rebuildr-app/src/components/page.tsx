import React, { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { textStyles, Text } from "./text";

interface PageProps extends PropsWithChildren {
  title?: string;
}

export const Page = ({ title, children }: PageProps) => {
  return (
    <View style={styles.container}>
      {title && <Text style={[textStyles.title, styles.title]}>{title}</Text>}
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
