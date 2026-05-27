"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Checkbox,
  Divider,
  Form,
  Input,
  Radio,
  Select,
  Spin,
  Typography,
} from "antd";
import {
  ShippingProviderEnum,
  SystemMessageRoleEnum,
  SystemMessageStepEnum,
  TransportationEnum,
} from "gql/graphql";
import { previewSystemMessage } from "@/queries/system-messages/preview-system-message";
import { SystemMessagePreview } from "./system-message-preview";

type FormValues = {
  step: SystemMessageStepEnum;
  role: SystemMessageRoleEnum;
  transportation: TransportationEnum;
  isFree: boolean;
  firstSale: boolean;
  provider: ShippingProviderEnum;
  decision: string;
  showAddPayoutText: boolean;
};

const STEP_LABELS: Record<SystemMessageStepEnum, string> = {
  [SystemMessageStepEnum.PurchaseInitiated]: "Köp initierat",
  [SystemMessageStepEnum.SellerResponded]: "Säljaren svarade",
  [SystemMessageStepEnum.HandoffConfirmed]: "Överlämning bekräftad",
  [SystemMessageStepEnum.ShipmentDroppedOff]: "Paket inlämnat",
  [SystemMessageStepEnum.ShipmentArrived]: "Paket framme hos ombud",
  [SystemMessageStepEnum.ShipmentDelivered]: "Paket uthämtat",
  [SystemMessageStepEnum.PurchaseSuccess]: "Köp slutfört",
  [SystemMessageStepEnum.PurchaseReported]: "Köp rapporterat",
  [SystemMessageStepEnum.SupportConcluded]: "Ärende avslutat av support",
  [SystemMessageStepEnum.PurchaseAbortedByBuyer]: "Köp avbrutet av köpare",
  [SystemMessageStepEnum.PurchaseAbortedBySeller]: "Köp avbrutet av säljare",
  [SystemMessageStepEnum.LateShippingDropOff]: "Sen inlämning",
};

const SHIPPING_STEPS = new Set<SystemMessageStepEnum>([
  SystemMessageStepEnum.ShipmentDroppedOff,
  SystemMessageStepEnum.ShipmentArrived,
  SystemMessageStepEnum.ShipmentDelivered,
  SystemMessageStepEnum.LateShippingDropOff,
]);

const TRANSPORT_STEPS = new Set<SystemMessageStepEnum>([
  SystemMessageStepEnum.PurchaseInitiated,
  SystemMessageStepEnum.SellerResponded,
  SystemMessageStepEnum.PurchaseAbortedByBuyer,
  SystemMessageStepEnum.PurchaseAbortedBySeller,
]);

const FREE_STEPS = new Set<SystemMessageStepEnum>([
  SystemMessageStepEnum.PurchaseInitiated,
  SystemMessageStepEnum.SellerResponded,
  SystemMessageStepEnum.PurchaseSuccess,
  SystemMessageStepEnum.PurchaseAbortedByBuyer,
  SystemMessageStepEnum.PurchaseAbortedBySeller,
]);

const initialValues: FormValues = {
  step: SystemMessageStepEnum.PurchaseInitiated,
  role: SystemMessageRoleEnum.Buyer,
  transportation: TransportationEnum.Shipping,
  isFree: false,
  firstSale: false,
  provider: ShippingProviderEnum.Dhl,
  decision: "",
  showAddPayoutText: false,
};

const SystemMessagesTable = () => {
  const [values, setValues] = useState<FormValues>(initialValues);

  const showTransport =
    TRANSPORT_STEPS.has(values.step) && !SHIPPING_STEPS.has(values.step);
  const showProvider =
    values.step === SystemMessageStepEnum.ShipmentArrived ||
    (values.step === SystemMessageStepEnum.PurchaseInitiated &&
      values.transportation === TransportationEnum.Shipping);
  const showFree = FREE_STEPS.has(values.step);
  const showFirstSale =
    values.step === SystemMessageStepEnum.PurchaseSuccess &&
    values.role === SystemMessageRoleEnum.Seller &&
    !values.isFree;
  const showDecision =
    values.step === SystemMessageStepEnum.SupportConcluded;
  const showRole = values.step !== SystemMessageStepEnum.ShipmentArrived;
  const showAddPayoutText =
    values.role === SystemMessageRoleEnum.Seller &&
    (values.step === SystemMessageStepEnum.PurchaseInitiated ||
      values.step === SystemMessageStepEnum.PurchaseSuccess);

  const { data: preview, isLoading } = useQuery({
    queryKey: ["preview-system-message", values],
    queryFn: () =>
      previewSystemMessage({
        step: values.step,
        role: values.role,
        transportation: showTransport ? values.transportation : undefined,
        isFree: showFree ? values.isFree : undefined,
        firstSale: showFirstSale ? values.firstSale : undefined,
        provider: showProvider ? values.provider : undefined,
        decision: showDecision ? values.decision || undefined : undefined,
        showAddPayoutText: showAddPayoutText ? values.showAddPayoutText : undefined,
      }),
  });

  const set = (patch: Partial<FormValues>) =>
    setValues((prev) => ({ ...prev, ...patch }));

  return (
    <div className="flex w-full flex-col gap-6">
      <Divider orientation="start">
        <h3>Systemmeddelanden – förhandsgranska</h3>
      </Divider>

      <div className="flex w-full gap-6 items-start">
        <div className="flex flex-col gap-6" style={{ flex: 1 }}>
          <Card>
            <Form layout="vertical">
              <Form.Item label="Händelse">
                <Select
                  value={values.step}
                  onChange={(step) => set({ step })}
                  options={Object.values(SystemMessageStepEnum).map((s) => ({
                    value: s,
                    label: STEP_LABELS[s],
                  }))}
                />
              </Form.Item>

              {showRole && (
                <Form.Item label="Mottagare">
                  <Radio.Group
                    value={values.role}
                    onChange={(e) => set({ role: e.target.value })}
                  >
                    <Radio.Button value={SystemMessageRoleEnum.Buyer}>
                      Köpare
                    </Radio.Button>
                    <Radio.Button value={SystemMessageRoleEnum.Seller}>
                      Säljare
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              )}

              {showTransport && (
                <Form.Item label="Transportmetod">
                  <Radio.Group
                    value={values.transportation}
                    onChange={(e) => set({ transportation: e.target.value })}
                  >
                    <Radio.Button value={TransportationEnum.Pickup}>
                      Avhämtning
                    </Radio.Button>
                    <Radio.Button value={TransportationEnum.Shipping}>
                      Frakt
                    </Radio.Button>
                    <Radio.Button value={TransportationEnum.Delivery}>
                      Hemtransport
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              )}

              {showProvider && (
                <Form.Item label="Fraktleverantör">
                  <Radio.Group
                    value={values.provider}
                    onChange={(e) => set({ provider: e.target.value })}
                  >
                    <Radio.Button value={ShippingProviderEnum.Dhl}>DHL</Radio.Button>
                    <Radio.Button value={ShippingProviderEnum.Postnord}>
                      PostNord
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              )}

              {showFree && (
                <Form.Item>
                  <Checkbox
                    checked={values.isFree}
                    onChange={(e) => set({ isFree: e.target.checked })}
                  >
                    Gratis köp (0 kr)
                  </Checkbox>
                </Form.Item>
              )}

              {showFirstSale && (
                <Form.Item>
                  <Checkbox
                    checked={values.firstSale}
                    onChange={(e) => set({ firstSale: e.target.checked })}
                  >
                    Första försäljning
                  </Checkbox>
                </Form.Item>
              )}

              {showAddPayoutText && (
                <Form.Item>
                  <Checkbox
                    checked={values.showAddPayoutText}
                    onChange={(e) =>
                      set({ showAddPayoutText: e.target.checked })
                    }
                  >
                    Visa utbetalningsonboarding-länk
                  </Checkbox>
                </Form.Item>
              )}

              {showDecision && (
                <Form.Item label="Beslut">
                  <Input
                    placeholder="Skriv beslutets text..."
                    value={values.decision}
                    onChange={(e) => set({ decision: e.target.value })}
                  />
                </Form.Item>
              )}
            </Form>
          </Card>

          <Card title="Förhandsgranskning">
            {isLoading ? (
              <Spin />
            ) : (
              <Typography.Paragraph>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {preview}
                </pre>
              </Typography.Paragraph>
            )}
          </Card>
        </div>

        <Card title="Visuell förhandsgranskning" style={{ width: 320, flexShrink: 0 }}>
          {isLoading ? (
            <Spin />
          ) : preview ? (
            <SystemMessagePreview text={preview} />
          ) : null}
        </Card>
      </div>
    </div>
  );
};

export default SystemMessagesTable;
