import Svg from "react-native-svg";
import { IconProps } from "./icon";

interface PointUpIconProps extends IconProps {}

export const PointUpIcon = ({
  height = 30,
  width = 30,
  color,
  ...svgProps
}: PointUpIconProps) => {
  return (
    <Svg
      {...svgProps}
      width={width}
      height={height}
      viewBox="0 0 30 30"
      fill="none"
      color={color}
    >
      <rect width="30" height="30" fill="url(#pattern0_418_238)" />
      <defs>
        <pattern
          id="pattern0_418_238"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_418_238" transform="scale(0.0208333)" />
        </pattern>
        <image
          id="image0_418_238"
          width="48"
          height="48"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAMKADAAQAAAABAAAAMAAAAADbN2wMAAADiklEQVRoBe2YPWgUQRiG/StSnJDiihSCV1ikEElhkcJiCyWCKSxSpLxCMIVFCgsFwRQWggFTBIxgsWAlNhYBBYVEFFQMKCiYLgumUBREFA0a0OfVHRwvM7e3tzt3F7gPnpvZmW++n5nZ2b3dvaM8qWDqEPyAb+WZDW9pDy6uwE/4lXKfch9sC5klSgW+AONwFj7BC1ByPS1VotPMzzVEeZRrJVVvaO+5yyNEpEAjR2RahcbEHGrFmnYVG950i3zG9mBB+5nDiyaQ6SC0Qj+B0DOcZb+/AlkzFLq/vwKhZzjLfsgV2I/zJCuAov0hEygaW0vjQ79syf4pGEujeUY5DxswDKfTcpXyOqjsqER4870Lqf172v+aUqjtFdRBfXpfepqWup4AI1UqwV9FIpw0S0BvqnZQeks1/xsUuIKUKNBlUEKT8AZkVzyBEQgiEVabJXDH4XUhHXO4oU9BmqBfUj8D07AGX6AGpUuERV8CX+mLoVEu0qAxrvtP7boPBsCI/tl9gNg02GXIU+ij7ciq70zrm1abXdWqbVgN69QfQuOK/VEJmYAVQ66qHbwZqNWsmAu77MUE7Pgy680SUMZTsATP4SoMQU+JLwEFfxeuwV54D0pGx9txaEW0l+85FBdpu+VoV5PaXWM86v7mGbp0IkxYKjXqOt50jl8ASQTSUxlSYowneRysouyaCa1MDAr6Noyn9YgypMQYT1wOXGex9Krw2DFAp0EdVkD3RKvbCdUw4rsHlnF3AgY9budpPwZKSOI70//2duF3BJ/a63GGbz0lZ2AgQ69od4yBJK+RWQZor2ufd1tiAkjyBqFZ1c38FnxbKa/NdvVjBiauwb57QLobUIchuAzbVsxWirqYQYzvpF3/ZiutYaDSrpGC42LGJy4bzbaQ0TdbSSdOfyuZWclZLqK/knPMFvVubiUFf29LRG00jDJGDzg9iTslVRzpeWReIAv77fSpNJUmoLeDUsTeSnpGhBT50oPU9WJZyK9mQ586HoHvjbaQg3TwHKW2T5Rel1qcxJqM34QQSZitoySCyTksKwmtRA3KkhkMya5OnhCTg9l/MklVnwSFEtIDr10ZZeASKPgbkBm8+ciEbiGpMXoBxmATlkFfotdTzB8fLv8TBaiEh0F/oA7COzgPMXRcDuDxEqyC+Yir2cxCug9gGnTytCxlrYDP4RAdmuGKR0GrZVZJ9dzyG7pDwb8kcSdSAAAAAElFTkSuQmCC"
        />
      </defs>
    </Svg>
  );
};
