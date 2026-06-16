import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Body, Headline } from "@components/typography/text";
import { Button } from "@components/buttons/button";
import { UserCard } from "@components/cards/user-card";
import {
  ProfileUpdateUserMutation,
  ProfileUpdateUserMutationVariables,
  UserType,
} from "@/gql/graphql";
import { PROFILE_UPDATE_USER } from "queries";
import { useMutation } from "@apollo/client";
import { useImageHandler } from "@hooks/use-image-handler";
import { Divider } from "@components/dividers/divider";
import { TextInput } from "@components/forms/textInput";
import { useUser } from "@hooks/useUser";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";

type Props = {
  onEditCompleted: () => void;
};

export const EditProfile = ({ onEditCompleted }: Props) => {
  const { isLoggedIn, me, loading } = useUser();
  const { pickImage } = useImageHandler();

  const [description, setDescription] = useState("");
  const [profilePicture, setProfilePicture] = useState<{
    uri: string;
    mimeType: string;
    file: File;
    size: number;
  }>();

  const [updateProfile, { loading: updateProfileLoading }] = useMutation<
    ProfileUpdateUserMutation,
    ProfileUpdateUserMutationVariables
  >(PROFILE_UPDATE_USER);

  const onPickProfilePicture = async () => {
    const image = await pickImage();
    if (!image) return;
    setProfilePicture(image);
  };

  const onSaveProfile = () => {
    if (updateProfileLoading || !me) return;
    updateProfile({
      variables: {
        input: {
          id: me.id,
          description,
          profilePicture: profilePicture
            ? { mimeType: profilePicture.mimeType }
            : undefined,
        },
      },
      onCompleted: async (data) => {
        if (data.updateUser.profilePicturePutUrl && profilePicture) {
          await fetch(data.updateUser.profilePicturePutUrl, {
            method: "PUT",
            headers: {
              "Content-Type": profilePicture.mimeType,
              "x-amz-acl": "public-read",
            },
            body: profilePicture.file,
          });
        }
        setProfilePicture(undefined);
        onEditCompleted();
      },
    });
  };

  useEffect(() => {
    if (me) {
      setDescription(me?.description ?? "");
    }
  }, [me]);

  if (!isLoggedIn || !me || loading) return <LoadingSpinner />;

  return (
    <View style={{ gap: 24 }}>
      <UserCard
        userType={me.type}
        profilePictureUrl={profilePicture?.uri ?? me.profilePicture?.url}
        username={me.username}
        numberOfPublishedProducts={me.numberOfPublishedProducts}
        numberOfSoldProducts={me.numberOfSoldProducts}
        rating={me.rating}
      />
      <Button label="Ladda upp profilbild" onPress={onPickProfilePicture} />
      <View style={{ gap: 16 }}>
        <Divider />
        <Headline size="small">
          {me.type === UserType.Business
            ? "Din företagspresentation"
            : "Din profil"}
        </Headline>
        <View style={{ gap: 12 }}>
          <TextInput
            style={{ minHeight: 172 }}
            multiline
            value={description}
            onChange={(t) => setDescription(t.slice(0, 5000))}
            placeholder={
              me.type === UserType.Business
                ? "Här kan du skriva en presentation om ditt företag/organisation."
                : "Här kan du skriva en kort beskrivning om dig själv och vad du säljer."
            }
          />
          <Body size="small" color="secondary">
            {description.length ?? 0} av 5000 tecken
          </Body>
        </View>
      </View>
      <Button
        label="Spara"
        loading={updateProfileLoading}
        onPress={onSaveProfile}
      />
    </View>
  );
};
