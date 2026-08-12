import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Header } from "@components/navigation/headers/header";
import { Popup } from "@components/popup/popup";
import { Body, Display, Headline } from "@components/typography/text";
import { conditions } from "@constants/conditions";
import { useScreenType } from "@hooks/useScreenType";
import { View } from "react-native";

type Props = {
  show: boolean;
  onDismiss: () => void;
};

export const ExplainConditionsBottomSheet = ({ show, onDismiss }: Props) => {
  const { isDesktop } = useScreenType();

  const content = (
    <View
      style={[
        { marginBottom: 16 },
        //space-between + flex only fill the fixed-height desktop popup. On
        //mobile the sheet is dynamically sized, so flex: 1 would stretch this
        //to the full window and space-between would push the buttons far down.
        isDesktop && {
          justifyContent: "space-between",
          flex: 1,
          marginBottom: 0,
        },
      ]}
    >
      <View style={{ gap: 24, marginVertical: 24 }}>
        <Display size="small">Ange skick</Display>
        <Body size="medium">
          Utgå från produktens funktion. Beskriv slitage, defekter eller annan
          info som underlättar för en köpare i annonsfältet Bra att veta.
        </Body>
        {Object.values(conditions).map((value, i) => {
          return (
            <View style={{ gap: 12 }} key={i}>
              <Headline size="small">{value.name}</Headline>
              <Body size="medium">{value.description}</Body>
            </View>
          );
        })}
      </View>
    </View>
  );

  if (isDesktop) {
    return (
      <Popup open={show} onClose={onDismiss}>
        <View
          style={{
            paddingTop: 16,
            paddingBottom: 24,
            paddingHorizontal: 24,
            justifyContent: "center",
          }}
        >
          <Header
            title="Ange skick"
            showBackButton={false}
            showDivider
            ctas={[
              {
                icon: "X",
                onPress: onDismiss,
              },
            ]}
          />
          <View style={{ padding: 48, paddingTop: 24 }}>{content}</View>
        </View>
      </Popup>
    );
  }

  return (
    <BottomSheet
      open={show}
      name="conditions explanation"
      title="Ange skick"
      onDismiss={onDismiss}
    >
      {content}
    </BottomSheet>
  );
};
