import { View } from "react-native";
import TopBar from "@components/navigation/top-bar";
import Hero from "@components/hero/hero";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import Footer from "@components/navigation/footer";
import { TrendingNow } from "@components/trending-now/trending-now";
import { Divider } from "@components/dividers/divider";
import { Headline } from "@components/typography/text";
import { NewArrivalsNearYou } from "@components/new-arrivals-near-you/new-arrivals-near-you";
import { ForTheSeason } from "@components/for-the-season/for-the-season";
import { SaleBanner } from "@components/sale-banner/sale-banner";

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
      <View>
        <NewArrivalsNearYou />
        <ForTheSeason />
        <SaleBanner />
        <View style={{ flexDirection: "column", gap: 16, paddingVertical: 16 }}>
          <Headline size="small">Du kanske också gillar</Headline>
          <Divider />
          <Headline size="small">Nytt från din senaste söknin</Headline>
          <Divider />
        </View>
        <TrendingNow />
      </View>
    </ScreenLayout>
  );
}
