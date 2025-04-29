import {
  PreviewProjectQueryQuery,
  PreviewProjectQueryQueryVariables,
} from "@/gql/graphql";
import { gql, useSuspenseQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Map } from "@components/maps/map";
import { Body, Label, Title } from "@components/typography/text";
import { View } from "react-native";

const PREVIEW_PROJECT_QUERY = gql`
  query PreviewProjectQuery($input: GetProjectInput!) {
    getProject(input: $input) {
      id
      title
      description
      contactName
      contactEmail
      contactPhone
      address
      location {
        lat
        lng
      }
      approximatePlace {
        lat
        lng
        address
      }
    }
  }
`;

type Props = {
  id: string;
  onEdit: () => void;
};

export const PreviewProject = ({ id, onEdit }: Props) => {
  const { data } = useSuspenseQuery<
    PreviewProjectQueryQuery,
    PreviewProjectQueryQueryVariables
  >(PREVIEW_PROJECT_QUERY, { variables: { input: { id } } });

  const project = data.getProject;
  return (
    <View style={{ gap: 24 }}>
      <View style={{ gap: 4 }}>
        <Title size="medium">{project.title}</Title>
        <Body size="medium">{project.description}</Body>
      </View>
      <View style={{ gap: 4 }}>
        <Label size="medium" style={{ marginBottom: 2 }}>
          Alternativ kontakt:
        </Label>
        <Body size="medium">Namn: {project.contactName}</Body>
        <Body size="medium">Mail: {project.contactEmail}</Body>
        <Body size="medium">Telefon: {project.contactPhone}</Body>
      </View>
      <View style={{ gap: 4 }}>
        <Label size="medium">Adress</Label>
        <Body size="medium">{project.approximatePlace.address}</Body>
      </View>
      <View style={{ gap: 12 }}>
        <Map
          lat={project.approximatePlace.lat}
          lng={project.approximatePlace.lng}
          radius={5000}
          interactive={false}
          zoom={10}
        />
        <Body size="small" color="secondary">
          Köparen ser inte projektets exakta adress ({project.address}), bara
          ett ungefärligt område på kartan enligt ovan. Den fullständiga
          adressen visas först när ett köp har genomförts.
        </Body>
      </View>
      <Button label="Redigera projekt" onPress={() => onEdit()} type="tonal" />
    </View>
  );
};
