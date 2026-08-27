import { showHamburgerMenuVar } from "@/apollo/config";
import {
  HamburgerMenuQuery,
  HamburgerMenuQueryVariables,
  InternalAdsMenuContextQuery,
  OrderProductsEnum,
} from "@/gql/graphql";
import { INTERNAL_ADS_MENU_CONTEXT } from "@/queries/internal-ads";
import { gql, useQuery, useReactiveVar } from "@apollo/client";
import {
  RootCategoriesVertical,
  RootCategoriesVerticalCategory,
} from "@components/categories/root-categories-vertical";
import { Divider } from "@components/dividers/divider";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { Headline, Title } from "@components/typography/text";
import { permanentSection } from "@constants/permanent-sections";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useScreenType } from "@hooks/useScreenType";
import { useForegroundPermissions } from "expo-location";
import { Href, Link, router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useUser } from "@hooks/useUser";

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
    rootCategories {
      id
      name
      categoryType
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
  const { isLoggedIn } = useUser();
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
  const { data: internalAdsContextData } =
    useQuery<InternalAdsMenuContextQuery>(INTERNAL_ADS_MENU_CONTEXT, {
      skip: !isLoggedIn,
    });

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
  const giveawayCategory = data?.rootCategories.find(
    (category) => category.categoryType === "GIVEAWAY",
  );
  const entries: EntryProps[] = [
    ...(internalAdsContextData?.internalAdsOrganizationContext
      ? [{ title: "Återbanken", link: "/internal" as Href }]
      : []),
    {
      title: permanentSection.newArrivals.title,
      link: "/search/products/new-arrivals",
      onPress: () =>
        filterBuilder.reset().setOrdering(OrderProductsEnum.Latest).apply(),
    },
    ...(status?.granted
      ? [
          {
            title: permanentSection.nearYou.title,
            link: "/search/products/near-you" as Href,
            onPress: () =>
              filterBuilder
                .reset()
                .setOrdering(OrderProductsEnum.Distance)
                .apply(),
          },
        ]
      : []),
    ...(giveawayCategory
      ? [
          {
            title: giveawayCategory.name,
            link: `/search/products/${giveawayCategory.id}` as Href,
            onPress: () =>
              router.navigate({
                pathname: "/search/products/[categoryId]",
                params: { categoryId: giveawayCategory.id },
              }),
          },
        ]
      : []),
    ...(seasonalCategories.length > 0
      ? [
          {
            title: permanentSection.forTheSeason.title,
            link: "/search/in-season" as Href,
            onPress: () => router.navigate("/search/in-season"),
          },
        ]
      : []),
    ...(trendingCategories.length > 0
      ? [
          {
            title: permanentSection.trendingNow.title,
            link: "/search/products/trending-now" as Href,
            onPress: () =>
              filterBuilder.reset().setCategories(trendingCategories).apply(),
          },
        ]
      : []),
    { title: "Företagsförsäljning", link: "/hubs" },
    { title: "Så funkar det", link: "/article/saa-funkar-det" },
    { title: "Återbyggaren", link: "/aterbyggaren" },
  ];

  return (
    <SlideInSheet
      open={!!showHamburgerMenu}
      onClose={onClose}
      onBack={category ? () => setCategory(undefined) : undefined}
      title={category ? category.name : "Meny"}
      style={{ gap: 24 }}
    >
      {!category && (
        <View>
          {entries.map((entry, index) => (
            <View key={entry.title}>
              <Entry {...entry} />
              {index < entries.length - 1 && <Divider />}
            </View>
          ))}
        </View>
      )}
      <View style={{ marginTop: isDesktop ? 48 : 24, gap: 24 }}>
        <Divider />
        <Title size="medium">Kategorier</Title>
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
    <View style={{ paddingVertical: 10 }}>
      <Pressable onPress={onPress}>
        <Link href={link}>
          <Headline size="small">{title}</Headline>
        </Link>
      </Pressable>
    </View>
  );
};
