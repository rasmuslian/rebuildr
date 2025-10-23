import {
  UseCreateOrganizationMutation,
  UseCreateOrganizationMutationVariables,
} from "@/gql/graphql";
import { apolloBadFieldsError } from "@/utils/apollo-errors";
import { gql, useMutation } from "@apollo/client";
import { useState } from "react";

const USE_CREATE_ORGANIZATION = gql`
  mutation UseCreateOrganization($input: CreateOrganizationUserInput!) {
    createOrganizationUser(input: $input) {
      id
      username
      organizationNumber
    }
  }
`;

type Props = {
  initialOrgNumber?: string | null;
  initialName?: string | null;
};

export const useCreateOrganization = (props?: Props) => {
  const [orgNumber, setOrgNumber] = useState(props?.initialOrgNumber ?? "");
  const [name, setName] = useState(props?.initialName ?? "");

  const [createOrganization, { data, loading, error }] = useMutation<
    UseCreateOrganizationMutation,
    UseCreateOrganizationMutationVariables
  >(USE_CREATE_ORGANIZATION);

  const onChangeNumber = (v: string) => {
    //only digits and max 10 of them
    const r = new RegExp(/^[0-9]{0,10}$/);
    if (!r.test(v)) {
      return;
    }
    setOrgNumber(v);
  };

  const onChangeName = (n: string) => {
    setName(n);
  };

  const onCreate = () => {
    if (loading) return;

    createOrganization({
      variables: {
        input: {
          organizationNumber: orgNumber,
          organizationName: name,
        },
      },
    });
  };

  const fieldErrors = error ? apolloBadFieldsError(error) : undefined;
  const canCreate = orgNumber.length === 10 && name.length > 0;

  return {
    orgNumber,
    changeOrgNumber: onChangeNumber,
    name,
    changeName: onChangeName,
    fieldErrors,
    error,
    canCreate,
    create: onCreate,
    loading,
    data,
  };
};
