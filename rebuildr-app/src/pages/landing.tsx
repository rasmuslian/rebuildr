import { useQuery, useReactiveVar } from "@apollo/client";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Button } from "src/components/button";
import { Icon } from "src/components/icons/icon";
import { Input } from "src/components/inputs/input";
import { Body, Headline } from "src/components/texts/text";
import { gql } from "src/gql";
import Colors from "src/styles/colors";
import { isLoggedInVar } from "src/apollo/apollo";

const LANDING_QUERY = gql(`
  query LandingQuery {
    rootCategories {
      id
      name
    }
  }
`);

const distances = [3, 5, 10, 30, 50, 100];

export const Landing = () => {
  const [searchString, setSearchString] = useState("");
  const [address, setAddress] = useState("");
  const [distance, setDistance] = useState();

  const { navigate } = useNavigation();
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const { data } = useQuery(LANDING_QUERY);

  const onSearch = () => {
    navigate("Products", {
      distance: distance,
      searchString: searchString,
      address: address,
    });
  };

  const onPressCategory = (categoryId: string) => {
    navigate("Products", {
      categoryId: categoryId,
    });
  };
  const onPressSelectionCategories = () => {
    navigate("Products", {
      selectionCategories: true,
    });
  };
  const onPressSeasonalCategories = () => {
    navigate("Products", {
      seasonalCategories: true,
    });
  };

  return (
    <View>
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
              style={[
                styles.tabButton,
                { backgroundColor: Colors.inactiveGray },
              ]}
              onPress={() =>
                isLoggedIn ? navigate("Sell") : navigate("Login")
              }
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
                <Picker.Item label={"Avstånd från dig"} value={0} />
                {distances.map((dist, i) => (
                  <Picker.Item key={i} label={`< ${dist} km`} value={dist} />
                ))}
                <Picker.Item label={"Obegränsat"} value={0} />
              </Picker>
            </View>
            <Button
              title="Hitta"
              onPress={onSearch}
              titleColor="white"
              backgroundColor="purple"
            />
          </View>
        </View>
      </View>
      {data?.rootCategories && (
        <CategorySlider
          categories={data.rootCategories}
          onSelect={(categoryId) => onPressCategory(categoryId)}
          onSelectSelection={onPressSelectionCategories}
          onSelectSeasonal={onPressSeasonalCategories}
        />
      )}
    </View>
  );
};

interface CategorySliderProps {
  onSelect: (categoryId: string) => void;
  onSelectSelection: () => void;
  onSelectSeasonal: () => void;
  categories: { id: string; name: string }[];
}
const offsetIncrement = 100;

const CategorySlider = ({
  onSelect,
  onSelectSelection,
  onSelectSeasonal,
  categories,
}: CategorySliderProps) => {
  const [sliderOffset, setSliderOffset] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [sliderWindowWidth, setSliderWindowWidth] = useState(0);

  const onRight = () => {
    if (sliderWidth + sliderOffset - sliderWindowWidth <= 0) {
      return;
    }
    setSliderOffset(sliderOffset - offsetIncrement);
  };

  const onLeft = () => {
    if (sliderOffset >= 0) {
      return;
    }
    setSliderOffset(sliderOffset + offsetIncrement);
  };

  return (
    <View style={styles.categoriesSlider}>
      <Pressable onPress={onLeft}>
        <View style={styles.arrow}>
          <Icon iconType="LeftChevron" />
        </View>
      </Pressable>
      <View
        style={styles.sliderContainer}
        onLayout={(v) => setSliderWindowWidth(v.nativeEvent.layout.width)}
      >
        <View
          style={[
            styles.categoriesContainer,
            { transform: `translateX(${sliderOffset}px)` },
          ]}
          onLayout={(v) => setSliderWidth(v.nativeEvent.layout.width)}
        >
          <Pressable onPress={onSelectSelection}>
            <View style={[styles.categoryCard, styles.specialCategoryCard]}>
              <Icon iconType="PointUpIcon" />
              <Body>Utvalda</Body>
            </View>
          </Pressable>
          <Pressable onPress={onSelectSeasonal}>
            <View style={[styles.categoryCard, styles.specialCategoryCard]}>
              <Icon iconType="SeasonIcon" />
              <Body>Säsong</Body>
            </View>
          </Pressable>
          {categories.map((category) => (
            <Pressable onPress={() => onSelect(category.id)} key={category.id}>
              <View style={styles.categoryCard}>
                <Icon iconType="TilesIcon" />
                <Body>{category.name}</Body>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
      <Pressable onPress={onRight}>
        <View style={styles.arrow}>
          <Icon iconType="RightChevron" />
        </View>
      </Pressable>
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
  arrow: {
    justifyContent: "center",
    alignItems: "center",
    width: 37,
    height: 100,
  },
  categoriesSlider: {
    backgroundColor: Colors.brand,
    flexDirection: "row",
    paddingHorizontal: 38,
    justifyContent: "space-between",
    paddingVertical: 22,
  },
  sliderContainer: {
    overflow: "hidden",
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: "row",
    gap: 12,
    position: "absolute",
    transformOrigin: "left",
    alignItems: "center",
    height: "100%",
  },
  categoryCard: {
    padding: 16,
    width: 100,
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    backgroundColor: "transparent",
  },
  specialCategoryCard: {
    borderRadius: 8,
    backgroundColor: "#F5EEFF",
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderStyle: "solid",
  },
});
