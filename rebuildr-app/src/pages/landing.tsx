import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, textStyles } from "src/components/text";

export const Landing = () => {
  return (
    <View style={styles.container}>
      <Text style={textStyles.title}>Landing</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
});
