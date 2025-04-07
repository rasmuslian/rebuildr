import { CreateBusiness } from "@components/login/createBusiness";
import { ScreenLayout } from "@components/screen-layout/screen-layout";

import { router } from "expo-router";

export default function CreateBusinessScreen() {
  return (
    <ScreenLayout style={{ paddingTop: 16, paddingBottom: 16, flex: 1 }}>
      <CreateBusiness
        onDone={() => router.replace("/")}
        onExit={() => router.dismissAll()}
      />
    </ScreenLayout>
  );
}
