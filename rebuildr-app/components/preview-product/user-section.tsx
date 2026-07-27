import { ProductViewFragmentFragment } from "@/gql/graphql";
import { Button } from "@components/buttons/button";
import { UserCard } from "@components/cards/user-card";
import { Headline } from "@components/typography/text";
import { router } from "expo-router";
import { View } from "react-native";

type Props = {
  product: ProductViewFragmentFragment;
};

export const UserSection = ({ product }: Props) => {
  return (
    <View style={{ gap: 24 }}>
      <Headline size="small">Om säljaren</Headline>
      <UserCard
        userType={product.seller.type}
        profilePictureUrl={product.seller.profilePicture?.url}
        username={product.seller.username ?? ""}
        numberOfPublishedProducts={product.seller.numberOfPublishedProducts}
        numberOfSoldProducts={product.seller.numberOfSoldProducts}
        rating={product.seller.rating}
        reviewCount={product.seller.reviewCount}
        memberSinceYear={new Date(product.seller.createdAt).getFullYear()}
      />
      <Button
        label="Visa profil"
        onPress={() => {
          router.navigate({
            pathname: "/(app)/account/profile",
            params: { userId: product.seller.id },
          });
        }}
      />
    </View>
  );
};
