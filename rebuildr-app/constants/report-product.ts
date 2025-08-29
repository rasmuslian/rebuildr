import { ReportProductTypeEnum } from "@/gql/graphql";

export const reportType: {
  [key in ReportProductTypeEnum]: { title: string; description: string };
} = {
  [ReportProductTypeEnum.IncorrectInformation]: {
    title: "Felaktig information",
    description:
      "Beskrivningen verkar inte stämma, t.ex. fel produktnamn, mått eller egenskaper.",
  },
  [ReportProductTypeEnum.MisleadingAdvertisement]: {
    title: "Oseriös eller vilseledande annons",
    description:
      "Text eller bilder känns fejkade, överdrivna eller uppenbart missvisande.",
  },
  [ReportProductTypeEnum.DuplicateOrSpam]: {
    title: "Dubblett/Spam",
    description: "Samma annons verkar ha publicerats flera gånger.",
  },
  [ReportProductTypeEnum.IrrelevantProduct]: {
    title: "Annonsen hör inte hemma här",
    description:
      "Den är i fel kategori eller verkar inte tillhöra plattformen alls.",
  },
  [ReportProductTypeEnum.UnreasonablePrice]: {
    title: "Pris verkar orimligt",
    description:
      "T.ex. om det är misstänkt lågt för att locka klick, eller känns som ett bedrägeri.",
  },
  [ReportProductTypeEnum.Other]: {
    title: "Annat",
    description: "Något annat som inte verkar stämma.",
  },
};
