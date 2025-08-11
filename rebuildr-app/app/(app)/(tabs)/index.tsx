import { View } from "react-native";
import TopBar from "@components/navigation/top-bar";
import Hero from "@components/hero/hero";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import Footer from "@components/navigation/footer";
import { TrendingNow } from "@components/trending-now/trending-now";
import { Divider } from "@components/dividers/divider";
import { Headline } from "@components/typography/text";

export default function Landing() {
  const Header = () => (
    <View>
      <TopBar />
      <Hero />
    </View>
  );

  return (
    <ScreenLayout
      headerComponent={<Header />}
      headerStyle={{ paddingHorizontal: 0 }}
      footerComponent={<Footer />}
      isStickyFooter={false}
    >
      <View style={{ flexDirection: "column", gap: 16 }}>
        <Headline size="small">Nyinkomna varor nära dig</Headline>
        <Divider />
        <Headline size="small">För säsongen</Headline>
        <Divider />
        <Headline size="small">Du kanske också gillar</Headline>
        <Divider />
        <Headline size="small">Nytt från din senaste söknin</Headline>
        <Divider />

        <TrendingNow />
      </View>
    </ScreenLayout>
  );
}
