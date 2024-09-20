import { useLazyQuery, useQuery, useReactiveVar } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { View, Pressable, ImageBackground, FlatList } from "react-native";
import { Button } from "src/components/button";
import { Icon } from "src/components/icons/icon";
import { Input } from "src/components/inputs/input";
import {
  ButtonText,
  Headline,
  InputText,
  Title,
} from "src/components/texts/text";
import { gql } from "src/gql";
import Colors from "src/styles/colors";
import { isLoggedInVar } from "src/apollo/apollo";
import { InputAndSelect } from "src/components/inputs/inputAndSelect";
import { useResponsiveStyles } from "src/hooks/useResponsiveStyles";
import { Page } from "src/components/layout/page";
import { Section } from "src/components/layout/section";
import { OrderProductsEnum } from "src/gql/graphql";
import { PopularCategories } from "src/sections/popularCategories";
import { RelevantProducts } from "src/sections/relevantProducts";
import * as Location from "expo-location";
import { getIconFromCategory } from "src/utils/getIconFromCategory";

const LANDING_QUERY = gql(`
  query LandingQuery($popularCategoriesInput: PopularCategoriesInput, $isLoggedIn: Boolean!) {
    rootCategories {
      id
      name
      icon
    }
    popularCategories(input: $popularCategoriesInput) {
      id
      name
      image {
        id
        presignedGetUrl
      }
    }
    me @include(if: $isLoggedIn) {
      id
      role
    }
  }
`);

const NEARBY_PRODUCTS_QUERY = gql(`
  query NearbyProductsQuery($input: ProductsInput!) {
    products(input: $input) {
      id
      title
      description
      distanceFromPosition
      likedBy {
        id
      }
      user {
        id
        email
      }
      address
      price
      mainImage {
        presignedGetUrl
      }
    } 
  }
  `);

const LOCATION_TO_ADDRESS_QUERY = gql(`
  query LocationToAddress($input: GetAddressInput!) {
    locationToAddress(input: $input) {
      address
    }
  }
  `);

const LOCATION_SEARCH_QUERY = gql(`
    query LocationSearchQuery($input: LocationSearchInput!) {
      locationSearch(input: $input) {
        result
      }
    }
      `);

//0 indicates no distance
const distances = [3, 5, 10, 30, 50, 100, 0];

export const Landing = () => {
  const [searchString, setSearchString] = useState("");
  const [address, setAddress] = useState("");
  const [distance, setDistance] = useState<number | undefined>();
  const styles = useResponsiveStyles(landingStyle);

  const { navigate } = useNavigation();
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const { data } = useQuery(LANDING_QUERY, {
    variables: {
      popularCategoriesInput: { limit: 15 },
      isLoggedIn,
    },
  });

  const [fetchNearbyProducts, { data: nearbyProducts }] = useLazyQuery(
    NEARBY_PRODUCTS_QUERY,
  );
  const [getAddress, { error: getAddressError, loading: getAddressLoading }] =
    useLazyQuery(LOCATION_TO_ADDRESS_QUERY);
  const [locationSearch, { data: locationSearchData }] = useLazyQuery(
    LOCATION_SEARCH_QUERY,
  );

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        fetchNearbyProducts({
          variables: { input: { limit: 6, orderBy: OrderProductsEnum.Latest } },
        });
        return;
      }
      const position = await Location.getCurrentPositionAsync();
      fetchNearbyProducts({
        variables: {
          input: {
            limit: 6,
            orderBy: OrderProductsEnum.Distance,
            location: {
              longitude: position.coords.longitude,
              latitude: position.coords.latitude,
            },
          },
        },
      });
    })();
  }, [fetchNearbyProducts]);

  const onGetMyLocation = async () => {
    if (getAddressLoading) {
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission denied");
    }

    const position = await Location.getCurrentPositionAsync();

    getAddress({
      variables: {
        input: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      },
      onCompleted: (data) => {
        setAddress(data.locationToAddress.address);
      },
      onError: () => {
        setAddress(address);
      },
    });
  };

  const onUpdateLocation = (s: string) => {
    setAddress(s);
    locationSearch({ variables: { input: { searchString: s } } });
  };

  const onSearch = () => {
    navigate("Products", {
      distance: !!address ? distance : undefined,
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
    <Page>
      <Section fullWidth>
        <ImageBackground
          source={require("../../assets/images/main-background.png")}
          style={styles.container}
          imageStyle={{ height: "100%", width: "100%" }}
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
                dropdown={
                  <View style={styles.searchSuggestionsDropdownContainer}>
                    <Title
                      type="xs"
                      style={styles.searchSuggestionDopdownTitle}
                    >
                      Populära sökningar
                    </Title>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      {data?.popularCategories.map((category) => (
                        <Pressable
                          key={category.id}
                          onPress={() =>
                            navigate("Products", { categoryId: category.id })
                          }
                        >
                          <View style={styles.searchSuggestionDropdownCategory}>
                            <ButtonText type="detail">
                              {category.name}
                            </ButtonText>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                }
              />
              <InputAndSelect
                label="Område"
                onChange={onUpdateLocation}
                value={address}
                placeholder={"Var letar du?"}
                style={styles.input}
                options={distances.map((dist, i) => ({
                  value: dist,
                  label: dist === 0 ? "Obegränsat" : `< ${dist} km`,
                }))}
                onSelect={(value) => setDistance(value || undefined)}
                selectedValue={distance}
                selectPlaceHolder={
                  <View style={styles.defaultSelectElement}>
                    <InputText type="default" color="pale">
                      Avstånd från
                    </InputText>
                    <Icon icon="Pin" />
                  </View>
                }
                dropdown={
                  locationSearchData?.locationSearch.result.length
                    ? (collapseDropdown) => (
                        <View style={styles.searchSuggestionsDropdownContainer}>
                          {locationSearchData?.locationSearch.result.map(
                            (data, i) => (
                              <Pressable
                                onPress={() => {
                                  collapseDropdown();
                                  setAddress(data);
                                }}
                                key={i}
                              >
                                <InputText>{data}</InputText>
                              </Pressable>
                            ),
                          )}
                        </View>
                      )
                    : undefined
                }
              />
              <View style={styles.searchBottomContainer}>
                <View style={styles.addresToLocationContainer}>
                  <Icon icon="CrossHair" />
                  <Pressable onPress={() => onGetMyLocation()}>
                    <InputText
                      color={
                        getAddressError?.graphQLErrors.every(
                          (e) => e.extensions.code !== "THROTTLE",
                        )
                          ? "error"
                          : "pale"
                      }
                    >
                      Nära dig
                    </InputText>
                  </Pressable>
                </View>
                <Button
                  title="HITTA"
                  onPress={onSearch}
                  titleColor="white"
                  backgroundColor="purple"
                  shape="rectangle"
                  style={styles.searchButton}
                />
                <View style={styles.fillerView} />
              </View>
            </View>
          </View>
        </ImageBackground>
        {data?.rootCategories && (
          <CategorySlider
            elements={[
              <Pressable onPress={onPressSelectionCategories}>
                <View style={[styles.categoryCard, styles.specialCategoryCard]}>
                  <Icon icon="PointUp" />
                  <ButtonText type="detail" style={styles.cardText}>
                    Utvalda
                  </ButtonText>
                </View>
              </Pressable>,
              <Pressable onPress={onPressSeasonalCategories}>
                <View style={[styles.categoryCard, styles.specialCategoryCard]}>
                  <Icon icon="Season" />
                  <ButtonText type="detail" style={styles.cardText}>
                    Säsong
                  </ButtonText>
                </View>
              </Pressable>,
              <Pressable onPress={onPressGiveaway}>
                <View style={[styles.categoryCard, styles.specialCategoryCard]}>
                  <Icon icon="Gift" />
                  <ButtonText type="detail" style={styles.cardText}>
                    Bortskänkes
                  </ButtonText>
                </View>
              </Pressable>,
              ...data.rootCategories.map((category) => (
                <Pressable
                  onPress={() => onPressCategory(category.id)}
                  key={category.id}
                >
                  <View style={styles.categoryCard}>
                    <Icon
                      icon={getIconFromCategory(category.icon)}
                      width={30}
                      height={30}
                    />
                    <ButtonText type="detail" style={styles.cardText}>
                      {category.name}
                    </ButtonText>
                  </View>
                </Pressable>
              )),
            ]}
          />
        )}
      </Section>
      <Section>
        <Headline type="section" style={{ marginBottom: 32 }}>
          Nyinkomna varor nära dig
        </Headline>
        <RelevantProducts products={nearbyProducts?.products ?? []} />
      </Section>
      <Section>
        <Headline type="section" style={{ marginBottom: 32 }}>
          Populärt
        </Headline>
        <PopularCategories categories={data?.popularCategories ?? []} />
      </Section>
    </Page>
  );
};

interface CategorySliderProps {
  elements: ReactNode[];
}

const CategorySlider = ({ elements }: CategorySliderProps) => {
  const [sliderOffset, setSliderOffset] = useState(0);
  const styles = useResponsiveStyles(categorySliderStyles);
  const flatlistRef = useRef<FlatList>();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const conf = useRef({
    itemVisiblePercentThreshold: 100,
  });

  const onRight = () => {
    if (!flatlistRef.current) {
      return;
    }

    const nextIndex = sliderOffset + 1;
    if (nextIndex >= elements.length || !canScrollRight) {
      return;
    }

    flatlistRef.current.scrollToIndex({ index: nextIndex });
    setSliderOffset(nextIndex);
  };

  const onLeft = () => {
    if (!flatlistRef.current) {
      return;
    }

    const nextIndex = sliderOffset - 1;
    if (nextIndex < 0 || !canScrollLeft) {
      return;
    }
    flatlistRef.current.scrollToIndex({ index: nextIndex });
    setSliderOffset(nextIndex);
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      if ((viewableItems[0].index = 0)) {
        setCanScrollLeft(false);
      } else {
        setCanScrollLeft(true);
      }
      if (
        viewableItems[viewableItems.length - 1].index >=
        elements.length - 1
      ) {
        setCanScrollRight(false);
      } else {
        setCanScrollRight(true);
      }
    },
    [elements.length],
  );

  return (
    <View style={styles.categoriesSlider}>
      <Pressable onPress={() => onLeft()}>
        <View style={styles.arrow}>
          <Icon icon="LeftChevron" />
        </View>
      </Pressable>
      <FlatList
        ref={flatlistRef}
        data={elements}
        renderItem={({ item }) => <>{item}</>}
        horizontal
        showsVerticalScrollIndicator={false}
        viewabilityConfig={conf.current}
        onViewableItemsChanged={onViewableItemsChanged}
        ItemSeparatorComponent={() => <View style={styles.separator}></View>}
      />
      <Pressable onPress={() => onRight()}>
        <View style={styles.arrow}>
          <Icon icon="RightChevron" />
        </View>
      </Pressable>
    </View>
  );
};

const landingStyle = {
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
    minWidth: 653,
    backgroundColor: Colors.brand,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignContent: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    small: {
      minWidth: 453,
    },
    mobile: {
      minWidth: 300,
    },
  },
  searchSuggestionsDropdownContainer: {
    backgroundColor: Colors.pale,
    padding: 24,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.4,
    shadowRadius: 60,
  },
  searchSuggestionDopdownTitle: { marginBottom: 20 },
  searchSuggestionDropdownCategory: {
    paddingVertical: 10,
    paddingHorizontal: 17,
    borderWidth: 2,
    borderRadius: 8,
    borderStyle: "solid",
    borderColor: Colors.softGray,
    backgroundColor: Colors.lavender,
  },
  searchBottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addresToLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  fillerView: {
    flex: 1,
    small: {
      display: "none",
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
  categoryCard: {
    paddingVertical: 16,
    width: 100,
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    backgroundColor: "transparent",
  },
  cardText: {
    textAlign: "center",
  },
  specialCategoryCard: {
    borderRadius: 8,
    backgroundColor: Colors.lavender,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderStyle: "solid",
  },
} as const;

const categorySliderStyles = {
  categoriesSlider: {
    backgroundColor: Colors.brand,
    flexDirection: "row",
    paddingVertical: 22,
    small: {
      marginHorizontal: 8,
    },
  },
  arrow: {
    justifyContent: "center",
    alignItems: "center",
    width: 37,
    height: 100,
    small: {
      display: "none",
    },
  },
  separator: {
    marginHorizontal: 8,
  },
} as const;
