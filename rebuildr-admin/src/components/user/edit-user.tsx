"use client";

import React from "react";
import { User, UserRoleEnum, CmsUpdateUsersInput } from "gql/graphql";
import UserForm from "./user-form";
import { useForm } from "react-hook-form";
import { UserSchema, UserSchemaType } from "@/schema/user-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { updateUser } from "@/queries/user/update-user";
import { resetIdentity } from "@/queries/user/reset-identity";
import { App, Button, Divider, Popconfirm } from "antd";

type Props = {
  user: User;
  onSettled: () => void;
};

const EditUser = ({ user, onSettled }: Props) => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserSchemaType>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      address: user.address ?? undefined,
      isAdmin: user.role === UserRoleEnum.Admin,
      isFeatured: user.isFeatured,
      name: user.name ?? undefined,
      city: user.city ?? undefined,
      postCode: user.postCode ?? undefined,
      phoneNumber: user.phoneNumber ?? undefined,
      websiteUrl: user.websiteUrl ?? undefined,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (input: CmsUpdateUsersInput) => {
      const response = await updateUser(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_USERS] });
      notification.success({
        message: "Hurra!",
        description: "Användaren har uppdaterats.",
      });
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Användaren kunde inte uppdateras.",
      });
    },
    onSettled: () => onSettled(),
  });

  const { mutate: mutateResetIdentity, isPending: isResettingIdentity } =
    useMutation({
      mutationFn: () => resetIdentity(user.id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.LIST_USERS] });
        notification.success({
          message: "Klart!",
          description: "BankID-verifieringen har återställts.",
        });
      },
      onError: (error: Error) => {
        notification.error({
          message: "Tyvärr!",
          description: error.message ?? "Kunde inte återställa verifieringen.",
        });
      },
    });

  const onSubmit = async (formData: UserSchemaType) => {
    const { isAdmin } = formData;

    const updatedUser: CmsUpdateUsersInput = {
      id: user.id,
      role: isAdmin ? UserRoleEnum.Admin : UserRoleEnum.User,
      city: formData.city ?? null,
      address: formData.address ?? null,
      name: formData.name ?? null,
      phoneNumber: formData.phoneNumber ?? null,
      postCode: formData.postCode ?? null,
      isFeatured: formData.isFeatured,
      websiteUrl: formData.websiteUrl ?? null,
    };

    mutate(updatedUser);
  };

  return (
    <div>
      <UserForm
        title="Redigera användare"
        control={control}
        errors={errors}
        isPending={isPending}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        submitLabel="Spara"
        userType={user.type}
      />
      <Divider />
      <Popconfirm
        title="Återställ BankID-verifiering"
        description="Är du säker? Användarens verifiering tas bort."
        okText="Återställ"
        okButtonProps={{ danger: true }}
        cancelText="Avbryt"
        onConfirm={() => mutateResetIdentity()}
      >
        <Button danger loading={isResettingIdentity}>
          Återställ BankID-verifiering
        </Button>
      </Popconfirm>
    </div>
  );
};

export default EditUser;
