import Svg from "react-native-svg";
import { IconProps } from "./icon";

interface GiftIconProps extends IconProps {}

export const GiftIcon = ({
  height = 30,
  width = 30,
  color,
  ...svgProps
}: GiftIconProps) => {
  return (
    <Svg
      {...svgProps}
      width={width}
      height={height}
      viewBox="0 0 30 30"
      fill="none"
      color={color}
    >
      <rect width="30" height="30" fill="url(#pattern0_418_247)" />
      <defs>
        <pattern
          id="pattern0_418_247"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_418_247" transform="scale(0.0208333)" />
        </pattern>
        <image
          id="image0_418_247"
          width="48"
          height="48"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAMKADAAQAAAABAAAAMAAAAADbN2wMAAAEuklEQVRoBdWYPYgdVRiGl2WLLRa0ENkixRYWFim2sFghxaCCC1oEDYIQYQsrSWFIQMGAV0iRXsFAkCy4EAv/SkETBwwkoEUqExIhK0YTUVCI6GKC8Xnuzhlmz87MnZl7J5t94d1zvv/v/MzsvXdqql/Mk17uOszS8QD+k9G5ul2Bg3T5E7wH1zI6V6ftgcUSnV2ANnsRKgc4V6dNn6INcWexh/Ifwia7XDwdY4zdMXS9513jJrrQ4k56z7vspDHGNjm5iTX/FJmq7nnXIvHzYY3e8D2Z3bEf4d4JVjGXOc1tjd6Qkvkv+F/Gk4wPwa4w1hwh35/MU9gbUjLLRXgOumO34RHYFsYYa44voaeQZmToBylpZcALTNahTVyFz8FR0EffspgUvewNKZlljDdQ/A2Luxn7uMPutD5Vp5Zik70hJbMsw6MoP4DhPofnI77n+uhbhhSl7A0pmWUdis+HD7x0131mtNUhxSgbY7qxZ3PHS7j6Ln8Rml86V6dtopiZaLatyT5F/DVTOe8F7s6uxq5fQNsrtNHzcfWdf/j9dr7FIq7jK5vC3G3yb8v7MJol6DgJtF1AXc3a3uaIfBf6vg5UVj8OJrGARr29R5d34Am4nI3K6sfBJBYwsjePxl23+SKU1Vddpyb3tckC6vKM7M3XqB+yxFebQ/43yMGeG7LJSUYbHMBZ2BZejePQHOYqQ6gdegk+Qd7rAsKr9G6wZmOQgz0yTx1C8Ql8G16DB2FTrOBozFvQHOYqQ6gdegk+QZ4Z5x/ZDbLZ9JPwZ+jPJKN+89mHz7fwNPQrpLHmMFcnjLOAUPAikyX4CtwDXUT8m88CujPwG+id19cYY8dCOKJRSZ7AwcIW/L3CeQ39x/BN6BecA9DvBm7SZSjegSfghkIFHkHv4m5V2LepEzT3oGMRCYL68GuBc3+sPQpHwZNwQcZI5+pGwcVbI8SF2kkUqKyP4/BPLqjIkDCq/wO+CvfBVahOuQmewUk2gTnNvQqtpWztut4S7JULeCkLfk2nAlLmJm6yo4Ww2ukC1tswhUX4dnIB9lJEgjBc2HRRG83/zeRfIv0K8gx8P9KPI4ZcK1GSm5kceonMm2LCUHZMc+i9j2swRtiZldjQQTaH9c0Zw9r2YC9FJAh5z1uEohfz45mjdzLGeRS/waqPGrF/mWys19FcMRIUNmkPMRIU+QJ8RSo8D2PMorgOL8OZyJggGzeAXTEgMG+kkMRa1vwB2kOM/SiMW9QwnwmvK5RgGZ3OvuJinEdhoa7w44Q5YljLmtYug71q93/GEFf4+0U2Lxs+R+lbYj4yDpC3JIrsdaLFjT0WOVnDWtasgr1e0RjeQh8xfxo+prIEPmBnS/TDJOgXSmyjVKGW1ySGtcoeav2Mexbacw5X7cP0da5pNklwcxcd2yIhoEusPdqrPecncIv5YZjAAXxQMaCxBNqrPW/DKpo7cHmbpVyRoO6yi2ZrG2tP1lqFlZjFcgl6ROGOVjpjSOD9WIC92NN30B5zTOezzckGw354F34G5+BOwx7sxZ4OQHvMES9Awzp8GT4OT8GdxmkasBd7WoeNcRRPr8diTYSJb0DHtmgSa217sJdOqGu+U8IOQbU9/A/mIEVVMfkU1gAAAABJRU5ErkJggg=="
        />
      </defs>
    </Svg>
  );
};
