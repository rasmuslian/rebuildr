import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Button } from "src/components/button";
import { Input } from "src/components/inputs/input";
import { Body, Headline } from "src/components/texts/text";
import Colors from "src/styles/colors";

const distances = [0, 1, 2, 5, 7, 10, 20, 50];

export const Landing = () => {
  const [searchString, setSearchString] = useState("");
  const [address, setAddress] = useState("");
  const [distance, setDistance] = useState(0);
  const { navigate } = useNavigation();

  const onSearch = () => {
    navigate("Products", {
      distance: distance,
      searchString: searchString,
      address: address,
    });
  };

  return (
    <View style={styles.container}>
      <Headline style={styles.title} color="brand">
        Sveriges marknadsplats för återbrukat byggmaterial
      </Headline>
      <View style={styles.buySellContainer}>
        <View style={styles.buttons}>
          <Pressable style={styles.tabButton}>
            <Body>Köp</Body>
          </Pressable>
          <Pressable
            style={[styles.tabButton, { backgroundColor: Colors.inactiveGray }]}
          >
            <Body>Sälj</Body>
          </Pressable>
        </View>
        <View style={styles.searchContainer}>
          <Input
            label="Vara"
            onChange={setSearchString}
            value={searchString}
            placeholder={"Vad letar du efter?"}
            style={styles.input}
          />
          <Input
            label="Område"
            onChange={setAddress}
            value={address}
            placeholder={"Var letar du?"}
            style={styles.input}
          />
          <View style={styles.input}>
            <Body>Distans</Body>
            <Picker
              selectedValue={distance}
              onValueChange={(v) => {
                setDistance(v);
              }}
            >
              {distances.map((dist, i) => (
                <Picker.Item key={i} label={`+ ${dist} km`} value={dist} />
              ))}
            </Picker>
          </View>
          <Button
            title="Hitta"
            onPress={onSearch}
            titleColor="white"
            backgroundColor={Colors.purple}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.green,
    height: 656,
    alignItems: "center",
  },
  title: {
    marginVertical: 40,
  },
  buySellContainer: {},
  buttons: {
    flexDirection: "row",
    marginLeft: 23,
    gap: 24,
  },
  tabButton: {
    paddingHorizontal: 52,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Colors.brand,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  searchContainer: {
    width: 653,
    // height: 249,
    backgroundColor: Colors.brand,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignContent: "center",
    justifyContent: "space-between",
    borderRadius: 8,
  },
  input: {
    marginBottom: 18,
  },
});
