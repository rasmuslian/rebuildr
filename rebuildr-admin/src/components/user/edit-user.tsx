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
import { App } from "antd";

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

  const onSubmit = async (formData: UserSchemaType) => {
    const updatedUser: CmsUpdateUsersInput = {
      id: user.id,
      address: formData.address,
      role: formData.isAdmin ? UserRoleEnum.Admin : UserRoleEnum.User,
    };

    mutate(updatedUser);
  };

  return (
    <UserForm
      title="Redigera användare"
      control={control}
      errors={errors}
      isPending={isPending}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      submitLabel="Spara"
    />
  );
};

export default EditUser;
