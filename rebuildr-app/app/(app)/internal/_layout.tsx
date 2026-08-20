import { Slot } from "expo-router";

import RebuildrHead from "@components/meta-data/rebuildr-head";

export default function InternalLayout() {
  return (
    <>
      <RebuildrHead title="Återbanken" />
      <Slot />
    </>
  );
}
