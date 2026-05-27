import { useState, useEffect } from "react";
import {
  loadConnectAndInitialize,
  StripeConnectInstance,
} from "@stripe/connect-js";
import { gql, useMutation } from "@apollo/client";
import {
  OnboardSellerAccountMutation,
  OnboardSellerAccountMutationVariables,
  SellerAccountCapabilityEnum,
} from "@/gql/graphql";
import { useThemeColor } from "@hooks/useThemeColor";
import { borderRadius } from "@constants/sizes";
import { textStyles } from "@components/typography/typeface";

const ONBOARD_SELLER_ACCOUNT = gql`
  mutation OnboardSellerAccount($input: OnboardSellerAccountInput!) {
    onboardSellerAccount(input: $input) {
      user {
        id
      }
      clientSecret
      fields
    }
  }
`;

export const useStripeConnect = (capability: SellerAccountCapabilityEnum) => {
  const [stripeConnectInstance, setStripeConnectInstance] =
    useState<StripeConnectInstance | null>(null);
  const colors = useThemeColor();

  const [onboardAccount, { data, loading }] = useMutation<
    OnboardSellerAccountMutation,
    OnboardSellerAccountMutationVariables
  >(ONBOARD_SELLER_ACCOUNT, {
    variables: {
      input: {
        capability,
      },
    },
  });

  const createConnectInstance = async () => {
    if (loading) {
      return;
    }
    const fetchClientSecret = async () => {
      const { data } = await onboardAccount();
      if (!data) {
        // eslint-disable-next-line no-throw-literal
        throw "No data";
      }
      return data?.onboardSellerAccount.clientSecret;
    };

    const key = process.env.EXPO_PUBLIC_STRIPE_PK;
    if (!key) {
      throw new Error("No key");
    }

    setStripeConnectInstance(
      loadConnectAndInitialize({
        publishableKey: key,
        fetchClientSecret,
        appearance: {
          overlays: "dialog",
          //Appearance variables: https://docs.stripe.com/connect/embedded-appearance-options
          variables: {
            //Color
            colorPrimary: colors.buttons.filled.enabled,
            colorBackground: colors.background.neutral,
            colorText: colors.text.primaryDark,
            colorDanger: colors.buttons.danger.enabled,
            colorBorder: colors.dividers.neutral,

            //Button
            buttonPrimaryColorBackground: colors.buttons.filled.enabled,
            buttonPrimaryColorText: colors.text.primaryLight,
            buttonSecondaryColorBackground: colors.buttons.tonal.enabled,
            buttonSecondaryColorText: colors.text.primaryDark,
            spacingUnit: "12px",

            //Text
            colorSecondaryText: colors.text.secondary,
            actionPrimaryColorText: colors.text.link,
            actionPrimaryTextDecorationColor: colors.text.link,

            //Badge
            badgeNeutralColorBackground: colors.badges.medium,
            badgeNeutralColorText: colors.text.primaryLight,
            badgeDangerColorBackground: colors.buttons.danger.enabled,

            //Form
            formBackgroundColor: colors.background.neutral,

            // Border Sizing
            buttonBorderRadius: `${borderRadius.medium.toString()}px`,
            formBorderRadius: `${borderRadius.small.toString()}px`,
            badgeBorderRadius: `${borderRadius.medium.toString()}px`,
            borderRadius: `${borderRadius.small.toString()}px`,

            //Font
            bodySmFontWeight: "500px",
            labelSmFontWeight: "500px",
            headingMdFontWeight: "500px",
            headingXlFontWeight: "500px",
            headingXsFontWeight: "500px",
            labelMdFontWeight: "500px",
            headingLgFontWeight: "500px",
            bodyMdFontWeight: "500px",
            headingSmFontWeight: "500px",

            fontFamily: "Poppins, sans-serif",

            bodySmFontSize: `${textStyles.body.medium.fontSize.toString()}px`,
            bodyMdFontSize: `${textStyles.body.large.fontSize.toString()}px`,

            labelSmFontSize: `${textStyles.label.small.fontSize.toString()}px`,
            labelMdFontSize: `${textStyles.label.large.fontSize.toString()}px`,

            headingXsFontSize: "medium",
            headingSmFontSize: `${textStyles.headline.small.fontSize.toString()}px`,
            headingMdFontSize: `${textStyles.title.medium.fontSize.toString()}px`,
            headingLgFontSize: `${textStyles.title.large.fontSize.toString()}px`,
            headingXlFontSize: `${textStyles.display.small.fontSize.toString()}px`,
          },
        },
        locale: "sv",
        fonts: [
          {
            cssSrc:
              "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap",
          },
        ],
      }),
    );
  };

  useEffect(() => {
    createConnectInstance();
  }, []);

  return {
    stripeConnectInstance,
    createConnectInstance,
    fields: data?.onboardSellerAccount.fields,
  };
};
