import { gql, useMutation, useQuery } from "@apollo/client";
import { Display, Body, Label } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { Pressable } from "react-native-gesture-handler";
import { Icon } from "@icons/icon";
import { useThemeColor } from "@hooks/useThemeColor";
import { borderRadius } from "@constants/sizes";
import { Divider } from "@components/dividers/divider";
import { Form } from "@components/forms/form";
import { Button } from "@components/buttons/button";
import FlowerHand from "@assets/images/flower-hand.png";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import {
  CreateReviewCreateReviewMutation,
  CreateReviewCreateReviewMutationVariables,
  CreateReviewQuery,
  CreateReviewQueryVariables,
} from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";

const CREATE_REVIEW = gql`
  query CreateReview($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      buyerId
      product {
        id
        title
        sellerId
        primaryImage {
          id
          url
        }
      }
    }
    me {
      id
    }
  }
`;

const CREATE_REVIEW_CREATE_REVIEW = gql`
  mutation CreateReviewCreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      stars
      review
    }
  }
`;

const starText = [
  {
    text: "Inte alls nöjd",
  },
  {
    text: "Kunde varit bättre",
  },
  {
    text: "Helt okej",
  },
  {
    text: "Bra affär",
  },
  {
    text: "Toppen!",
  },
];

export type ReviewState = "initial" | "submit" | "success";

type Props = {
  purchaseId: string;
  onDismiss: () => void;
  onCreateReviewCompleted: () => void;
  show: boolean;
};

export const CreateReview = ({
  purchaseId,
  onDismiss,
  onCreateReviewCompleted,
  show,
}: Props) => {
  const [stars, setStars] = useState(0);
  const [state, setState] = useState<ReviewState>("initial");
  const [review, setReview] = useState("");

  const colors = useThemeColor();
  const { isDesktop } = useScreenType();

  const { data } = useQuery<CreateReviewQuery, CreateReviewQueryVariables>(
    CREATE_REVIEW,
    {
      variables: { input: { id: purchaseId } },
    },
  );

  const [createReview, { loading: createReviewLoading }] = useMutation<
    CreateReviewCreateReviewMutation,
    CreateReviewCreateReviewMutationVariables
  >(CREATE_REVIEW_CREATE_REVIEW);

  const onSubmitReview = () => {
    createReview({
      variables: { input: { purchaseId, review, stars } },
      onCompleted: () => {
        onCreateReviewCompleted();
        setState("success");
      },
    });
  };

  const onStarPress = (starIndex: number) => {
    setState("submit");
    setStars(starIndex + 1);
  };

  const renderStarPart = () => {
    return (
      <>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Image
            source={{ uri: data?.purchase.product.primaryImage?.url }}
            style={{
              width: 64,
              height: 64,
              borderRadius: borderRadius.small,
            }}
          />
        </View>
        <Display size="small" style={{ textAlign: "center" }}>
          Hur gick {buyerIsMe ? "köpet" : "försäljningen"}?
        </Display>
        <View>
          <Body size="medium" style={{ textAlign: "center" }}>
            Hur nöjd är du med {buyerIsMe ? "köpet" : "försäljningen"} av:
          </Body>
          <Body
            size="medium"
            style={{ textAlign: "center", fontFamily: "Poppins-SemiBold" }}
          >
            {data?.purchase.product.title}
            <Body size="medium" style={{ textAlign: "center" }}>
              ?
            </Body>
          </Body>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: 24,
          }}
        >
          {[...Array(5)].map((_, i) => (
            <Pressable key={i} onPress={() => onStarPress(i)}>
              <Icon
                icon="star"
                customColor={
                  i + 1 <= stars ? colors.text.link : colors.textField.disabled
                }
              />
            </Pressable>
          ))}
        </View>
        <Label
          size="large"
          style={{
            textAlign: "center",
            marginBottom: state === "submit" ? 0 : 24,
          }}
        >
          {stars ? starText[stars - 1].text : "Tryck på stjärnorna"}
        </Label>
      </>
    );
  };

  const renderSubmitPart = () => {
    return (
      <>
        <Divider />
        <View>
          <Form
            style={{ gap: 24 }}
            fields={[
              {
                type: "text",
                value: review,
                onChangeText: (t) => setReview(t.slice(0, 5000)),
                heading: "Berätta gärna mer, det hjälper andra",
                description: `Berätta gärna hur ${buyerIsMe ? "köpet" : "försäljningen"} gick. Fanns det något du själv hade velat veta innan du ${buyerIsMe ? "handlade" : "sålde"}?`,
                multiline: true,
                placeholder: buyerIsMe
                  ? "Exempelvis: Stämde annonsen? Fick du snabb kontakt? Var något otydligt?"
                  : "Exempelvis: Höll köparen tiderna? Var kommunikationen tydlig? Uppstod något oväntat?",
                style: { minHeight: 172 },
              },
            ]}
          />
          <Body size="small" color="secondary" style={{ marginTop: 12 }}>
            {review.length} av 5000 tecken
          </Body>
        </View>
        <Button
          label="Skicka omdöme"
          onPress={() => onSubmitReview()}
          loading={createReviewLoading}
          style={{ marginTop: 32 }}
        />
      </>
    );
  };

  const renderSuccessPart = () => {
    return (
      <>
        <View style={{ alignItems: "center", marginBottom: 26, marginTop: 24 }}>
          <Image source={FlowerHand.uri} style={{ width: 141, height: 141 }} />
        </View>
        <Display size="small" style={{ textAlign: "center" }}>
          Tack för att du delade med dig
        </Display>
        <Body size="medium" style={{ textAlign: "center", flex: 1 }}>
          Det hjälper andra att känna sig tryggare när de handlar och gör
          Rebuildr lite bättre för alla.
        </Body>
        <Button label="Stäng" onPress={() => onDismiss()} />
      </>
    );
  };

  const buyerIsMe = data?.purchase.buyerId === data?.me.id;

  const content = (
    <View
      style={[
        { paddingBottom: 12, gap: 24 },
        //space-between + flex only fill the fixed-height desktop sheet. On
        //mobile the sheet is dynamically sized, so flex: 1 would stretch this
        //to the full window and space-between would push the buttons far down.
        isDesktop && { justifyContent: "space-between", flex: 1 },
      ]}
    >
      {!data ? (
        <LoadingSpinner />
      ) : (
        <>
          {state === "success" && renderSuccessPart()}
          {state !== "success" && renderStarPart()}
          {state === "submit" && renderSubmitPart()}
        </>
      )}
    </View>
  );

  if (isDesktop) {
    return (
      <SlideInSheet open={show} onClose={onDismiss} title="Lämna omdöme">
        {content}
      </SlideInSheet>
    );
  }

  return (
    <BottomSheet
      name="Create Review"
      title="Lämna omdöme"
      open={show}
      screenHeight={state !== "initial"}
      onDismiss={onDismiss}
      scrollable={state !== "initial"}
    >
      {content}
    </BottomSheet>
  );
};
