import { Badge } from "@components/badges/badge";
import { Button } from "@components/buttons/button";
import { ImageQuickLink } from "@components/buttons/imageQuickLink";
import { AdGrid } from "@components/cards/ad-grid";
import { FilterChip } from "@components/chips/filterChip";
import { Check } from "@components/controls/check";
import { Radio } from "@components/controls/radio";
import { Toggle } from "@components/controls/toggle";
import { FavIcon } from "@components/logo/favIcon";
import { Logo } from "@components/logo/logo";
import { SearchBar } from "@components/search/search-bar";
import { ContinuousSlider } from "@components/slider/continuous-slider";
import { Slider } from "@components/slider/slider";
import { Icon } from "@icons/icon";
import { Pictogram } from "@pictograms/pictogram";
import React, { useState } from "react";
import { View } from "react-native";
import Placeholder from "@assets/images/placeholder.png";
import { ScrollView } from "react-native-gesture-handler";
import { ProductConditionEnum } from "@/gql/graphql";
import { Form } from "@components/forms/form";

export default function Page() {
  const [searchString, setSearchString] = useState("");
  const [sliderValue, setSliderValue] = useState(2);
  const [cSliderValue, setCSliderValue] = useState(10);

  //form
  const [formText, setFormText] = useState("");
  const [formToggle, setFormToggle] = useState(false);
  const [formCheckbox, setFormCheckbox] = useState(false);

  return (
    <ScrollView
      contentContainerStyle={{
        gap: 20,
        margin: 20,
        flexGrow: 1,
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        <Icon icon="check" />
        <Icon icon="chevronLeft" />
        <Icon icon="chevronRight" />
        <Icon icon="chevronUp" />
        <Icon icon="chevronDown" />
        <Icon icon="X" />
        <Icon icon="bullet" />
        <Icon icon="eye" />
        <Icon icon="eyeOff" />
        <Icon icon="arrowLeft" />
        <Icon icon="arrowRight" />
        <Icon icon="filterList" />
        <Icon icon="heart" />
        <Icon icon="heartFilled" />
        <Icon icon="list" />
        <Icon icon="grid" />
        <Icon icon="map" />
        <Icon icon="location" />
        <Icon icon="sort" />
        <Icon icon="reset" />
        <Icon icon="drag" />
        <Icon icon="addImage" />
        <Icon icon="filterList2" />
        <Icon icon="search" />
        <Icon icon="addPhoto" />
        <Icon icon="photos" />
        <Icon icon="+" />
        <Icon icon="trash" />
        <Icon icon="upload" />
        <Icon icon="file" />
        <Icon icon="addFile" />
        <Icon icon="user" />
        <Icon icon="message" />
        <Icon icon="newListing" />
        <Icon icon="categories" />
      </View>
      <View style={{ flexDirection: "row" }}>
        <Pictogram pictorgram="sparkle" />
        <Pictogram pictorgram="bathtub" />
        <Pictogram pictorgram="bricks" />
        <Pictogram pictorgram="door" />
        <Pictogram pictorgram="drill" />
        <Pictogram pictorgram="giveAway" />
        <Pictogram pictorgram="interior" />
        <Pictogram pictorgram="materialStone" />
        <Pictogram pictorgram="nails" />
        <Pictogram pictorgram="paint" />
        <Pictogram pictorgram="powerOutlet" />
        <Pictogram pictorgram="roof" />
        <Pictogram pictorgram="season" />
        <Pictogram pictorgram="tree" />
        <Pictogram pictorgram="wheelBarrow" />
        <Pictogram pictorgram="window" />
      </View>
      <View style={{ flexDirection: "row" }}>
        <Pictogram pictorgram="sparkle" type="large" />
        <Pictogram pictorgram="bathtub" type="large" />
        <Pictogram pictorgram="bricks" type="large" />
        <Pictogram pictorgram="door" type="large" />
        <Pictogram pictorgram="drill" type="large" />
        <Pictogram pictorgram="giveAway" type="large" />
        <Pictogram pictorgram="interior" type="large" />
        <Pictogram pictorgram="materialStone" type="large" />
        <Pictogram pictorgram="nails" type="large" />
        <Pictogram pictorgram="paint" type="large" />
        <Pictogram pictorgram="powerOutlet" type="large" />
        <Pictogram pictorgram="roof" type="large" />
        <Pictogram pictorgram="season" type="large" />
        <Pictogram pictorgram="tree" type="large" />
        <Pictogram pictorgram="wheelBarrow" type="large" />
        <Pictogram pictorgram="window" type="large" />
      </View>
      <View>
        <FavIcon />
        <FavIcon type="dark" />
      </View>
      <View>
        <Logo size="large" />
        <Logo size="small" />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 16 }}>
        <Button icon="X" label={"Button label"} type="default" />
        <Button icon="addFile" label={"Button label"} type="tonal" />
        <Button icon="X" label={"Button label"} type="text" />
        <Button icon="X" label={"Button label"} type="outlined" />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 16 }}>
        <Button icon="X" label={"Button label"} type="default" disabled />
        <Button icon="addFile" label={"Button label"} type="tonal" disabled />
        <Button icon="X" label={"Button label"} type="text" disabled />
        <Button icon="X" label={"Button label"} type="outlined" disabled />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 16 }}>
        <Button icon="X" type="default" />
        <Button label={"Button label"} type="tonal" />
        <Button type="outlined" />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 16 }}>
        <ImageQuickLink source={Placeholder} label="Quick link" />
        <ImageQuickLink
          source={Placeholder}
          label="Quick link sdjkj kjdskjdskj jkjsd"
          disabled
        />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 16 }}>
        <FilterChip selected label={"Filter Label"} />
        <FilterChip label={"Filter Label"} />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 16 }}>
        <FilterChip selected label={"Filter Label"} disabled />
        <FilterChip label={"Filter Label"} disabled />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 16 }}>
        <Toggle onPress={() => console.log("hej")} />
        <Toggle onPress={() => console.log("hej")} value />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 16 }}>
        <Toggle onPress={() => console.log("hej")} disabled />
        <Toggle onPress={() => console.log("hej")} value disabled />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 16 }}>
        <Radio />
        <Radio selected />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 16 }}>
        <Radio disabled />
        <Radio selected disabled />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 16 }}>
        <Check />
        <Check selected />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 16 }}>
        <Check disabled />
        <Check selected disabled />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 16 }}>
        <Badge size="large" />
        <Badge size="medium" />
        <Badge size="small" />
      </View>
      <Slider
        values={[1, 2, 3, 4]}
        value={sliderValue}
        compareFunction={(v1, v2) => v1 === v2}
        onChange={(v) => setSliderValue(v)}
      />
      <ContinuousSlider
        min={0}
        max={100}
        value={cSliderValue}
        onChange={(v) => setCSliderValue(v)}
      />
      <SearchBar
        placeholder={"Vad letar du efter?"}
        value={searchString}
        onChange={(v) => setSearchString(v)}
      />
      <AdGrid
        imageUri={Placeholder}
        onPress={() => {}}
        title="Pergo vinylgolv Volcanica"
        quantity={28}
        condition={ProductConditionEnum.Good}
        account={{
          rating: 3.2,
          isBusiness: true,
          location: "Kungsholmen, Stockholm",
        }}
        price={500}
        heart
      />
      <Form
        fields={[
          {
            heading: "Header",
            description: "beskrvining",
            helperText: "hjälptext",
            type: "text",
            placeholder: "Placeholder text",
            value: formText,
            onChangeText: (text) => setFormText(text),
          },
          {
            heading: "Disabled",
            type: "text",
            placeholder: "Placeholder text",
            value: formText,
            onChangeText: (text) => setFormText(text),
            disabled: true,
          },
          {
            heading: "Error",
            type: "text",
            placeholder: "Placeholder text",
            value: formText,
            onChangeText: (text) => setFormText(text),
            error: true,
          },
          {
            heading: "Password",
            type: "masked",
            placeholder: "Placeholder text",
            value: formText,
            onChangeText: (text) => setFormText(text),
          },
          {
            heading: "Select",
            type: "select",
            value: formText,
            onPress: () => {},
            placeholder: "Placeholder",
            options: [],
            onSelect: (v) => {},
          },
          {
            heading: "Error",
            type: "select",
            value: formText,
            onPress: () => {},
            placeholder: "Placeholder",
            error: true,
            options: [],
            onSelect: (v) => {},
          },
          {
            heading: "Disabled",
            type: "select",
            value: formText,
            onPress: () => {},
            placeholder: "Placeholder",
            error: true,
            disabled: true,
            options: [],
            onSelect: (v) => {},
          },
          {
            explainer:
              "This is an explainer. Keep it real short, but it can span over a maximum of three rows.",
            type: "toggle",
            onPress: () => setFormToggle(!formToggle),
            value: formToggle,
          },
          {
            explainer:
              "This is an explainer. Keep it real short, but it can span over a maximum of three rows.",
            type: "toggle",
            onPress: () => setFormToggle(!formToggle),
            value: formToggle,
            disabled: true,
          },
          {
            explainer:
              "This is an explainer. Keep it real short, but it can span over a maximum of three rows.",
            type: "checkbox",
            selected: formCheckbox,
            onPress: () => setFormCheckbox(!formCheckbox),
          },
        ]}
      />
    </ScrollView>
  );
}
