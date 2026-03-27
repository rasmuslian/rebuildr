import { showHamburgerMenuVar } from "@/apollo/config";
import {
  HamburgerMenuQuery,
  HamburgerMenuQueryVariables,
  OrderProductsEnum,
} from "@/gql/graphql";
import { gql, useQuery, useReactiveVar } from "@apollo/client";
import {
  RootCategoriesVertical,
  RootCategoriesVerticalCategory,
} from "@components/categories/root-categories-vertical";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { Headline } from "@components/typography/text";
import { permanentSection } from "@constants/permanent-sections";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useScreenType } from "@hooks/useScreenType";
import { useForegroundPermissions } from "expo-location";
import { Href, Link, router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

const HAMBURGER_MENU = gql`
  query HamburgerMenu($input: CategoriesInput!) {
    categories(input: $input) {
      id
      name
      parentId
      inSelection
      inSeason
      image {
        id
        url
      }
    }
  }
`;

export const HamburgerMenu = () => {
  const showHamburgerMenu = useReactiveVar(showHamburgerMenuVar);
  const pathname = usePathname();
  const [category, setCategory] = useState<
    RootCategoriesVerticalCategory | undefined
  >();
  const { isDesktop } = useScreenType();
  const { filterBuilder } = useFilterProduct();
  const [status] = useForegroundPermissions();

  const { data } = useQuery<HamburgerMenuQuery, HamburgerMenuQueryVariables>(
    HAMBURGER_MENU,
    {
      variables: {
        input: {
          seasonalCategories: true,
        },
      },
    },
  );

  const onClose = () => {
    showHamburgerMenuVar(false);
    setCategory(undefined);
  };

  useEffect(() => {
    if (isDesktop) {
      return;
    }
    return () => {
      showHamburgerMenuVar(false);
    };
  }, [isDesktop, pathname]);

  const seasonalCategories = data?.categories.filter((c) => c.inSeason) ?? [];
  const trendingCategories =
    data?.categories.filter((c) => c.inSelection) ?? [];

  return (
    <SlideInSheet
      open={!!showHamburgerMenu}
      onClose={onClose}
      onBack={category ? () => setCategory(undefined) : undefined}
      title={category ? category.name : "Kategorier"}
      style={{ gap: 24 }}
    >
      {!category && (
        <View style={{ gap: 14 }}>
          <Entry
            title={permanentSection.newArrivals.title}
            link="/search/products/new-arrivals"
            onPress={() =>
              filterBuilder
                .reset()
                .setOrdering(OrderProductsEnum.Latest)
                .apply()
            }
          />
          {status?.granted && (
            <Entry
              title={permanentSection.nearYou.title}
              link="/search/products/near-you"
              onPress={() =>
                filterBuilder
                  .reset()
                  .setOrdering(OrderProductsEnum.Distance)
                  .apply()
              }
            />
          )}
          {seasonalCategories.length > 0 && (
            <Entry
              title={permanentSection.forTheSeason.title}
              link="/search/in-season"
              onPress={() => router.navigate("/search/in-season")}
            />
          )}
          {trendingCategories.length > 0 && (
            <Entry
              title={permanentSection.trendingNow.title}
              link="/search/products/near-you"
              onPress={() =>
                filterBuilder.reset().setCategories(trendingCategories).apply()
              }
            />
          )}
          <Entry title="Företagsförsäljning" link="/hubs" />
        </View>
      )}
      <View style={{ marginTop: isDesktop ? 48 : 24 }}>
        <RootCategoriesVertical onNavigate={isDesktop ? onClose : undefined} />
      </View>
    </SlideInSheet>
  );
};

type EntryProps = {
  title: string;
  link: Href;
  onPress?: () => void;
};

const Entry = ({ title, link, onPress }: EntryProps) => {
  return (
    <View style={{ marginVertical: 6 }}>
      <Pressable onPress={onPress}>
        <Link href={link}>
          <Headline size="small">{title}</Headline>
        </Link>
      </Pressable>
    </View>
  );
};
