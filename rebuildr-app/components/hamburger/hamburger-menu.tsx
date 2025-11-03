import { showHamburgerMenuVar } from "@/apollo/config";
import { useReactiveVar } from "@apollo/client";
import {
  RootCategoriesVertical,
  RootCategoriesVerticalCategory,
} from "@components/categories/root-categories-vertical";
import { SubCategoriesVertical } from "@components/categories/sub-categories-vertical";
import { Divider } from "@components/dividers/divider";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { Body } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { Href, Link, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export const HamburgerMenu = () => {
  const showHamburgerMenu = useReactiveVar(showHamburgerMenuVar);
  const pathname = usePathname();
  const [category, setCategory] = useState<
    RootCategoriesVerticalCategory | undefined
  >();
  const { isDesktop } = useScreenType();

  const onClose = () => {
    showHamburgerMenuVar(false);
    setCategory(undefined);
  };

  useEffect(
    () => () => {
      showHamburgerMenuVar(false);
    },
    [pathname],
  );

  return (
    <SlideInSheet
      open={!!showHamburgerMenu}
      onClose={onClose}
      onBack={category ? () => setCategory(undefined) : undefined}
      title={category ? category.name : "Kategorier"}
      style={{ gap: 24 }}
    >
      {category ? (
        <SubCategoriesVertical id={category.id} />
      ) : (
        <RootCategoriesVertical
          onExpandCategory={(category) => setCategory(category)}
        />
      )}
      {!category && (
        <View style={{ marginTop: isDesktop ? 48 : 24 }}>
          <Divider />
          <View style={{ gap: 18, marginTop: isDesktop ? 24 : 16 }}>
            {/**TODO: fix links */}
            <Entry title="Populärt på Rebuildr" link="/" />
            <Entry title="Varumärken" link="/" />
            <Entry title="Rädda byggmaterial" link="/" />
            <Entry title="Vad är det värt?" link="/" />
            <Entry title="Sälj som företag" link="/" />
            <Entry title="Vår vision" link="/" />
          </View>
        </View>
      )}
    </SlideInSheet>
  );
};

type EntryProps = {
  title: string;
  link: Href;
};

const Entry = ({ title, link }: EntryProps) => {
  return (
    <View style={{ marginVertical: 10 }}>
      <Link href={link}>
        <Body size="medium">{title}</Body>
      </Link>
    </View>
  );
};
