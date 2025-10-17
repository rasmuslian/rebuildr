import React from "react";
import { Result } from "antd";

const NotFoundPage = () => {
  return (
    <Result
      style={{ margin: "auto" }}
      status="404"
      title="Oj! Sidan finns inte"
      subTitle="Vi kan tyvärr inte hitta sidan du letar efter. Kontrollera webbadressen eller gå tillbaka till startsidan."
    />
  );
};

export default NotFoundPage;
