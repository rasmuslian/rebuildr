import { View, Text } from "react-native";
import TopBar from "@components/navigation/top-bar";
import Hero from "@components/hero/hero";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import Footer from "@components/navigation/footer";

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
      footerStyle={{ paddingHorizontal: 0, marginBottom: 0 }}
    >
      <View>
        <Text>Start sidan</Text>
      </View>
    </ScreenLayout>
  );
}
