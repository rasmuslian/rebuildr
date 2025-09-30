import { colors } from "tailwind.config";

export const contentStyle = `
  img {
    height: auto;
    display: block;
    max-width: 100%;
    border-radius: 12px;
  }
  .accordion {
    padding: 10px;
    margin: 20px 0px;
    background-color: ${colors.accent_100};
  }
  .link-group{
    background-color: ${colors.semantic_error_100};
    gap: 10px;
    list-style: none;
    margin: 20px 0px;
    padding: 0px;
    cursor: pointer;
  }
  .link-group li{
    border-bottom: 1px solid ${colors.neutrals_300};
    padding: 10px;
  }
  .link-group label{
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
  }
  .link-group p{
    font-size: 12px;
    line-height: 16px;
    font-weight: 400;
  }
  .link-group button {
    display: none;
  }
  .display-small {
    font-size: 30px;
    line-height: 36px;
    font-weight: 600;
  }
  .headline-small {
    font-size: 20px;
    line-height: 28px;
    font-weight: 500;
  }
  .cta-block {
    background-color: ${colors.secondary_200};
    padding: 16px;
    margin: 20px auto;
    border-radius: 8px;
    text-align: center;
    width: 375px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
  }
  .cta-block h2 {
    font-size: 20px;
    font-weight: 500;
    margin: 0px 0px 16px 0px;
  }
  .cta-block p {
    font-size: 14px;
    margin: 0px 0px 24px 0px;
  }
  .cta-block button {
    all: unset;
    display: inline-block;
    background-color: ${colors.accent_500};
    color: white;
    padding: 8px;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
  }
  .divider {
    margin: 20px auto;
    width: 100%;
    height: 1px;
    background-color: ${colors.neutrals_300};
  }
`;
