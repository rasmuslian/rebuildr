import Svg from "react-native-svg";
import { IconProps } from "./icon";

interface TilesIconProps extends IconProps {}

export const TilesIcon = ({
  height = 30,
  width = 30,
  color,
  ...svgProps
}: TilesIconProps) => {
  return (
    <Svg
      {...svgProps}
      width={width}
      height={height}
      viewBox="0 0 30 30"
      fill="none"
      color={color}
    >
      <rect width="30" height="30" fill="url(#pattern0_418_251)" />
      <defs>
        <pattern
          id="pattern0_418_251"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_418_251" transform="scale(0.0208333)" />
        </pattern>
        <image
          id="image0_418_251"
          width="48"
          height="48"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAMKADAAQAAAABAAAAMAAAAADbN2wMAAACiklEQVRoBe2YMUsdQRDHX4IBCyEPtLBIaZHCwg9gcR8hhYKFIJLGb2ObVBbxA6RMIWhhr4WFgnaCr1DyAiksBP3/zp24WW/vTrzceWYH/re7M7OzszO3O+/dYJCo2wi88ZZfVH9NmPN4se6sBKOYsIDfpP6R7H8VaAdveYg+CbvCkvBOYGMxDCX7KNDGdHx+0/qrWvdAWBFymtDzQvghTOac8kcm8a1AW4cyKTWpj487wk9hkgzMC6T4i3AtvHTCR3zNM8sG6EDj+6YXz0vn5dDOQC+8LnIybaAoKm3yep8BrtApF7FNtWUHeVZyipcd+i71zYcpNuATBaiI3otJ8eIK+yWcuLYrfS3/QJm6VYWmjs6DxfsiV2WzEf3en4G0Af896KKfMtBF1P01e5+BuoXMCocVLytqfjD8flv6tQuZX7xwzi9qvuPW/9f6tk7eZnq2UnT+WjU+qOPPH53en4G0gfib0I7kVWTgt4uVXX3thO55q8y46WMywBeusfBZ4JvLSyd8XBNGwpH9IVnR4JvARo6FGyFGZGpBOBTQr6Km9Vmbf5HLwnfbAE7wgWvDtYzLqKoSh3Ob1CfA28J+uEgapwj8jxHgEHPAtgS7Qj+oH35uESu/mc7pVBA3hN3ToeqlGFZ3Qpk/ruPDtSasWyVmI4Arb06wzaibE2P4yE031qJHUEKChyw2z/hP8SFcY5CJU/TTOsZ/ZECMPYdQFuOHepkYtX2wDIRGejNOG+g6VSkDKQPPjAB3r1/IuIMXhJFAoTCiDqB3KIyNGWmZjz42fGI+NrFRRkMJsVHlA7bWJ5wlKyJ8zzkVjO/E+cLwkaNbRmcSThco4NCVUDW/rg9VdgpcSKzmI3AHs1OWmFcwz4sAAAAASUVORK5CYII="
        />
      </defs>
    </Svg>
  );
};
