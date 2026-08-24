import { InfoCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { PropsWithChildren, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type DashboardSectionProps = PropsWithChildren<{
  title: string;
  description?: string;
  /** Plain-language explanation shown behind an info icon next to the title. */
  hint?: string;
  /** Right-aligned controls (toggles, links) on the heading row. */
  actions?: ReactNode;
  className?: string;
}>;

/**
 * Section heading + body. Owning the heading here keeps every section
 * consistent — components must not render their own dividers.
 */
const DashboardSection = ({
  title,
  description,
  hint,
  actions,
  children,
  className,
}: DashboardSectionProps) => (
  <section className={twMerge("flex flex-col gap-3", className)}>
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <div className="flex flex-col gap-0.5">
        <h4 className="text-headline-small m-0 flex items-center gap-1">
          {title}
          {hint && (
            <Tooltip title={hint}>
              <InfoCircleOutlined className="text-body-small text-gray-400" />
            </Tooltip>
          )}
        </h4>
        {description && (
          <p className="text-body-small m-0 text-gray-600">{description}</p>
        )}
      </div>
      {actions}
    </div>
    {children}
  </section>
);

export default DashboardSection;
