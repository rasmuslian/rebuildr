import Svg, { Path, Rect, SvgProps } from "react-native-svg";
import { useThemeColor } from "../hooks/useThemeColor";

interface FaviconProps extends SvgProps {
  type?: "light" | "dark";
}

export const FavIcon = ({ type = "light", ...props }: FaviconProps) => {
  const colors = useThemeColor();
  if (type === "light") {
    return (
      <Svg
        width={125}
        height={125}
        fill="none"
        viewBox="0 0 125 125"
        {...props}
      >
        <Rect width={125} height={125} fill={colors.logo.Background} rx={33} />
        <Path
          fill={colors.logo.Vector}
          d="M89 52.716c0-7.642-3.16-14.562-8.26-19.569l-11.218 10.56c2.493 2.218 4.059 5.405 4.059 9.009 0 6.838-5.642 12.167-12.581 12.167-6.939 0-12.58-5.33-12.58-12.167 0-6.838 5.641-12.209 12.58-12.209.16 0 .327 0 .488.012l.042 5.283 16.175-14.656L61.333 20l.042 5.106c-.125 0-.25-.006-.369-.006C45.563 25.096 33 37.486 33 52.716v42.412h15.42V80.525C55.845 87.779 68.682 97 86.143 97h1.059V81.793c-6.874 0-13.176-1.908-18.52-4.444C80.4 74.538 89 65.323 89 52.722v-.006Z"
        />
      </Svg>
    );
  }

  return (
    <Svg width={125} height={125} fill="none" viewBox="0 0 125 125" {...props}>
      <Rect width={125} height={125} fill={colors.logo.Vector} rx={33} />
      <Path
        fill={colors.logo.Background}
        d="M89 52.716c0-7.642-3.16-14.562-8.26-19.569l-11.218 10.56c2.493 2.218 4.059 5.405 4.059 9.009 0 6.838-5.642 12.167-12.581 12.167-6.939 0-12.58-5.33-12.58-12.167 0-6.838 5.641-12.209 12.58-12.209.16 0 .327 0 .488.012l.042 5.283 16.175-14.656L61.333 20l.042 5.106c-.125 0-.25-.006-.369-.006C45.563 25.096 33 37.486 33 52.716v42.412h15.42V80.525C55.845 87.779 68.682 97 86.143 97h1.059V81.793c-6.874 0-13.176-1.908-18.52-4.444C80.4 74.538 89 65.323 89 52.722v-.006Z"
      />
    </Svg>
  );
};
