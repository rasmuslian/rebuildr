import Svg from "react-native-svg";
import { IconProps } from "./icon";

interface SeasonIconProps extends IconProps {}

export const SeasonIcon = ({
  height = 30,
  width = 30,
  color,
  ...svgProps
}: SeasonIconProps) => {
  return (
    <Svg {...svgProps} width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect width="30" height="30" fill="url(#pattern0_418_242)" />
      <defs>
        <pattern
          id="pattern0_418_242"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_418_242" transform="scale(0.0208333)" />
        </pattern>
        <image
          id="image0_418_242"
          width="48"
          height="48"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAMKADAAQAAAABAAAAMAAAAADbN2wMAAAEDklEQVRoBe2YPWjUYBiAq9zQwcHBwaFDhhsE6ybYwaFDBwcHBwcHB4UOIh0cCgo6BKwgWLCgg6BoQQdBB8EOBTsIFqwoKCio4FCog6DQQcGCgj6PTSCtd5cvyeVawReeS/K9v99v0vb11Ss7CS//rMxSudQmjdoirwburzl+39a6E9Qdv+4ZWKm7A3XHdwPLfyk7AodwPF3WuQt+5raG0nIGz19wuXSE8o7mNLc1VJIpvA00WSCKx2cEQwneFzlSzWVOc3dFDLiQE6mJfgKegslboS4GbTuJuYIGbEunKIE6izkLRxP7Z1znYBE+geJJFMEI7APlDlyADz5slBwj8VdYhhi2Q55oE4M++h6DDZF0kznajnBR0Udfl5qxeipp8a7TRoXM+qYbtmedGCdpV08I4qUn3akKgxHkGmHlup0Jsi5mZExjR8XcilmbZBkGirkFWRvT2A+CrEsYRfi4dGKoSyYI/APqGKA/L6nagicjYuHmiJPnrl5eEO1xVyO2DmYOcwVJ6F9kHne7IThwUPbWRuYwlzlzJbQDTq0fY29yI1Y3mE9yBb0c7aWGtxInLn0rcBzS7xjb0mCLPtQsnnR74GNInnSa/KgTJb2uPq3+Ovq9kp8k6vpMDxLUI/RIr3oRmid0D7wjoCNjRzaVpEsoryiLfw9DeYYV9S5V95uHhrV9gy+wCJUlJkK3X2QWfBCuw2twmbbiO+3PYQL2Qylp4mXwuJT3WidH2TifwZhep2EMRsClGsFesIPjMAN2RHs7ewIaUEjuYm2QqJDXWuPDPPrR5mz64eaIhhbijB2BJbAjdrSQuDb95H0IoUmzCfzeN/ECNLOKAvd2whlzRkrJCbws4mJB7wOJ332uZTqfphtN4lQ6UKaSIOfTqAFXN+EHqFK8aebhjTdVxCJugDPhcnJTdpIdKLUd72QUoHMJG+dcgG2QyRhWbkb3RQwmaCXDNJp4pJUyaXNDNjvoVaV7KM8uJ8xatcHugAXKEzgEWYl4UHc025jca/sW1M8mbe0ucyhKLZ9LOC60i5q02xGnVrvJpC29NLjx6LyRNnDdBi4/C38Fo+BSayfqnO2Jdgbt2i+jMMn6otrZt2ufRmEnLMQ98xIsaAzsYJ5oZx2DeYZZ/ZnEaSrbWPK+iZ8F34TX4L4ZgVDxH8POVCFxfdqJbonvDkfxJwxDqAxhqJ+zsKFykuwW4uh3Wu/ri3xEg2/f/vWKXj677t0DnlJ+T92DEBnFaFOM/jSFWLh7YRwsahI6yUGU7ptZaHQyrFs3QAILyR4G3tuJ27AdsuJsXQH1L2C9nqbeisXaAQvLSsyD7c7MQ7gFfjPZJtdgQ9c9+f/IEr/Tq7d//Q7SchVewSLMQAwRbBrZRSXb6qjmN2kG3ZP711YjAAAAAElFTkSuQmCC"
        />
      </defs>
    </Svg>
  );
};
