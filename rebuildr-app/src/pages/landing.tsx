import { useQuery, useReactiveVar } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, Pressable, ImageBackground, StyleSheet } from "react-native";
import { Button } from "src/components/button";
import { Icon } from "src/components/icons/icon";
import { Input } from "src/components/inputs/input";
import { ButtonText, Headline, InputText } from "src/components/texts/text";
import { gql } from "src/gql";
import Colors from "src/styles/colors";
import { isLoggedInVar } from "src/apollo/apollo";
import { InputAndSelect } from "src/components/inputs/inputAndSelect";
import { useResponsiveStyles } from "src/hooks/useResponsiveStyles";

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
  const [distance, setDistance] = useState<number>();
  const styles = useResponsiveStyles(landingStyle);

  const { navigate } = useNavigation();
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const { data } = useQuery(LANDING_QUERY);

  const onSearch = () => {
    navigate("Products", {
      distance: distance,
      searchString: searchString || undefined,
      address: address || undefined,
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
  const onPressGiveaway = () => {
    navigate("Products", { giveaway: true });
  };

  return (
    <View>
      <ImageBackground
        source={{ uri: "../../assets/images/main-background.png" }}
        style={styles.container}
      >
        <Headline style={styles.title} color="brand">
          Sveriges marknadsplats för återbrukat byggmaterial
        </Headline>
        <View style={styles.buySellContainer}>
          <View style={styles.buttons}>
            <Pressable style={styles.tabButton}>
              <ButtonText type="largeBold">KÖP</ButtonText>
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
              <ButtonText type="large">SÄLJ</ButtonText>
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
            <InputAndSelect
              label="Område"
              onChange={setAddress}
              value={address}
              placeholder={"Var letar du?"}
              style={styles.input}
              options={distances.map((dist, i) => ({
                value: dist,
                label: `< ${dist} km`,
              }))}
              onSelect={(value) => setDistance(value)}
              selectedValue={distance}
              selectPlaceHolder={
                <View style={styles.defaultSelectElement}>
                  <InputText type="default" color="pale">
                    Avstånd från
                  </InputText>
                  <Icon iconType="Pin" />
                </View>
              }
            />
            <Button
              title="HITTA"
              onPress={onSearch}
              titleColor="white"
              backgroundColor="purple"
              shape="rectangle"
              style={styles.searchButton}
            />
          </View>
        </View>
      </ImageBackground>
      {data?.rootCategories && (
        <CategorySlider
          categories={data.rootCategories}
          onSelect={(categoryId) => onPressCategory(categoryId)}
          onSelectSelection={onPressSelectionCategories}
          onSelectSeasonal={onPressSeasonalCategories}
          onSelectGiveaway={onPressGiveaway}
        />
      )}
    </View>
  );
};

interface CategorySliderProps {
  onSelect: (categoryId: string) => void;
  onSelectSelection: () => void;
  onSelectSeasonal: () => void;
  onSelectGiveaway: () => void;
  categories: { id: string; name: string }[];
}
const offsetIncrement = 100;

const CategorySlider = ({
  onSelect,
  onSelectSelection,
  onSelectSeasonal,
  onSelectGiveaway,
  categories,
}: CategorySliderProps) => {
  const [sliderOffset, setSliderOffset] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [sliderWindowWidth, setSliderWindowWidth] = useState(0);
  const styles = useResponsiveStyles(categorySliderStyles);

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
              <Icon iconType="PointUp" />
              <ButtonText type="detail">Utvalda</ButtonText>
            </View>
          </Pressable>
          <Pressable onPress={onSelectSeasonal}>
            <View style={[styles.categoryCard, styles.specialCategoryCard]}>
              <Icon iconType="Season" />
              <ButtonText type="detail">Säsong</ButtonText>
            </View>
          </Pressable>
          <Pressable onPress={onSelectGiveaway}>
            <View style={[styles.categoryCard, styles.specialCategoryCard]}>
              <Icon iconType="Gift" />
              <ButtonText type="detail">Bortskänkes</ButtonText>
            </View>
          </Pressable>
          {categories.map((category) => (
            <Pressable onPress={() => onSelect(category.id)} key={category.id}>
              <View style={styles.categoryCard}>
                <Icon iconType="Tiles" />
                <ButtonText type="detail">{category.name}</ButtonText>
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

const landingStyle = StyleSheet.create({
  container: {
    backgroundColor: Colors.green,
    height: 487,
    alignItems: "center",
    zIndex: 1, //This ensures that components inside this section that is overlapping other sections will be on top of them.
    padding: 10,
  },
  title: {
    marginVertical: 40,
  },
  buySellContainer: {},
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 19,
  },
  tabButton: {
    paddingHorizontal: 52,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.brand,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    height: 38,
    marginBottom: -1,
  },
  searchContainer: {
    width: 653,
    backgroundColor: Colors.brand,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignContent: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    small: {
      width: 453,
    },
  },
  searchButton: {
    alignSelf: "center",
    marginTop: 5,
  },
  input: {
    marginBottom: 18,
  },
  defaultSelectElement: {
    flexDirection: "row",
    gap: 8,
  },
});

const categorySliderStyles = StyleSheet.create({
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
  arrow: {
    justifyContent: "center",
    alignItems: "center",
    width: 37,
    height: 100,
  },
});
