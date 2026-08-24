import { Body } from "@components/typography/text";

type Props = {
  count?: number;
};

export const FilterCount = ({ count }: Props) => {
  if (count === undefined) {
    return null;
  }

  return (
    <Body size="medium" color="secondary">
      {` (${count})`}
    </Body>
  );
};
