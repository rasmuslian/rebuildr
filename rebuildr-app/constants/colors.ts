export const primitives = {
  primary100: "#E9F6ED",
  primary200: "#D6E6DC",
  primary300: "#70AEA3",
  primary400: "#5EA193",
  primary500: "#4B9382",
  primary600: "#417D6E",
  primary700: "#176457",
  primary800: "#00493E",
  primary900: "#00332B",
  secondary100: "#FBF8F1",
  secondary200: "#F8F1E3",
  secondary300: "#F2E6D1",
  secondary400: "#E9DCC5",
  secondary500: "#DFD2BA",
  secondary600: "#C0B196",
  secondary700: "#8B7E65",
  secondary800: "#564A34",
  secondary900: "#30291D",
  accent100: "#F5EFFF",
  accent200: "#DDC7FF",
  accent300: "#AC82FF",
  accent400: "#995FFF",
  accent500: "#863CFF",
  accent600: "#7E24F3",
  accent700: "#7017DD",
  accent800: "#5A0BBC",
  accent900: "#40048E",
  neutrals10: "#FFFFFF0D",
  neutrals50: "#FFFFFF4D",
  neutrals90: "#FFFFFFE6",
  neutrals100: "#FFFFFF",
  neutrals200: "#E6E6E6",
  neutrals300: "#C7C7C7",
  neutrals400: "#AEAEAE",
  neutrals500: "#959595",
  neutrals600: "#616161",
  neutrals700: "#4B4B4B",
  neutrals800: "#323232",
  neutrals900: "#1E1E1E",
  semanticError100: "#FFEDEB",
  semanticError200: "#FFDAD7",
  semanticError300: "#FFB3AD",
  semanticError400: "#FF8981",
  semanticError500: "#E66A63",
  semanticError600: "#C5524C",
  semanticError700: "#A53A36",
  semanticError800: "#852221",
  semanticError900: "#65090E",
};

export type TextTokens = {
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  disabled: string;
  link: string;
  error: string;
  success: string;
};
const textTokensLight: TextTokens = {
  primaryDark: primitives.neutrals900,
  primaryLight: primitives.neutrals100,
  secondary: primitives.neutrals600,
  disabled: primitives.neutrals400,
  link: primitives.accent500,
  error: primitives.semanticError600,
  success: primitives.primary600,
};
const textTokensDark: TextTokens = {
  primaryDark: primitives.neutrals100,
  primaryLight: primitives.neutrals900,
  secondary: primitives.neutrals200,
  disabled: primitives.neutrals50,
  link: primitives.accent200,
  error: primitives.semanticError400,
  success: primitives.primary400,
};

type BackgroundTokens = {
  neutral: string;
  secondary: string;
  primary: string;
};
const backgroundTokensLight: BackgroundTokens = {
  neutral: primitives.neutrals100,
  secondary: primitives.secondary200,
  primary: primitives.primary100,
};
const backgroundTokensDark: BackgroundTokens = {
  neutral: primitives.neutrals900,
  secondary: primitives.secondary900,
  primary: primitives.primary900,
};

type DividersTokens = {
  neutral: string;
  secondary: string;
  primary: string;
};
const dividersTokensLight: DividersTokens = {
  neutral: primitives.neutrals300,
  secondary: primitives.secondary500,
  primary: primitives.primary300,
};
const dividersTokensDark: DividersTokens = {
  neutral: primitives.neutrals700,
  secondary: primitives.secondary700,
  primary: primitives.primary700,
};

type ButtonsTokens = {
  filled: {
    enabled: string;
    hovered: string;
    focused: string;
    pressed: string;
    disabled: string;
  };
  danger: {
    enabled: string;
    hovered: string;
    focused: string;
    pressed: string;
    disabled: string;
  };
  tonal: {
    enabled: string;
    hovered: string;
    focused: string;
    pressed: string;
    disabled: string;
  };
  text: {
    hovered: string;
    focused: string;
    pressed: string;
    disabled: string;
  };
  outlinedStroke: {
    enabled: string;
    hovered: string;
    focused: string;
    pressed: string;
    disabled: string;
  };
  outlinedFill: {
    enabled: string;
    hovered: string;
    focused: string;
    pressed: string;
    disabled: string;
  };
  iconQuickLink: {
    hovered: string;
    focused: string;
    pressed: string;
  };
  imageQuickLinkStroke: {
    enabled: string;
    hovered: string;
    focused: string;
    pressed: string;
    disabled: string;
  };
  imageQuickLinkFill: {
    enabled: string;
    hovered: string;
    focused: string;
    pressed: string;
  };
  favorite: {
    enabled: string;
    active: string;
  };
};
const buttonTokensLight: ButtonsTokens = {
  filled: {
    enabled: primitives.accent500,
    hovered: primitives.accent400,
    focused: primitives.accent400,
    pressed: primitives.accent500,
    disabled: primitives.neutrals200,
  },
  danger: {
    enabled: primitives.semanticError500,
    hovered: primitives.semanticError400,
    focused: primitives.semanticError400,
    pressed: primitives.semanticError500,
    disabled: primitives.neutrals200,
  },
  tonal: {
    enabled: primitives.accent100,
    hovered: primitives.accent200,
    focused: primitives.accent200,
    pressed: primitives.accent300,
    disabled: primitives.neutrals200,
  },
  text: {
    hovered: primitives.accent100,
    focused: primitives.accent200,
    pressed: primitives.accent300,
    disabled: primitives.neutrals200,
  },
  outlinedStroke: {
    enabled: primitives.neutrals400,
    hovered: primitives.neutrals700,
    focused: primitives.neutrals700,
    pressed: primitives.neutrals400,
    disabled: primitives.neutrals200,
  },
  outlinedFill: {
    enabled: primitives.neutrals10,
    hovered: primitives.accent100,
    focused: primitives.accent100,
    pressed: primitives.neutrals10,
    disabled: primitives.neutrals10,
  },
  iconQuickLink: {
    hovered: primitives.secondary300,
    focused: primitives.secondary500,
    pressed: primitives.secondary500,
  },
  imageQuickLinkStroke: {
    enabled: primitives.neutrals400,
    hovered: primitives.neutrals700,
    focused: primitives.neutrals700,
    pressed: primitives.neutrals400,
    disabled: primitives.neutrals200,
  },
  imageQuickLinkFill: {
    enabled: primitives.neutrals10,
    hovered: primitives.neutrals100,
    focused: primitives.neutrals100,
    pressed: primitives.neutrals100,
  },
  favorite: {
    enabled: primitives.neutrals90,
    active: primitives.neutrals50,
  },
};
const buttonTokensDark: ButtonsTokens = {
  filled: {
    enabled: primitives.neutrals100,
    hovered: primitives.secondary200,
    focused: primitives.secondary200,
    pressed: primitives.neutrals500,
    disabled: primitives.neutrals10,
  },
  danger: {
    enabled: primitives.semanticError500,
    hovered: primitives.semanticError400,
    focused: primitives.semanticError400,
    pressed: primitives.semanticError500,
    disabled: primitives.neutrals10,
  },
  tonal: {
    enabled: primitives.neutrals500,
    hovered: primitives.secondary200,
    focused: primitives.secondary200,
    pressed: primitives.neutrals50,
    disabled: primitives.neutrals10,
  },
  text: {
    hovered: primitives.neutrals10,
    focused: primitives.neutrals50,
    pressed: primitives.neutrals50,
    disabled: primitives.neutrals10,
  },
  outlinedStroke: {
    enabled: primitives.neutrals50,
    hovered: primitives.neutrals10,
    focused: primitives.neutrals50,
    pressed: primitives.neutrals50,
    disabled: primitives.neutrals10,
  },
  outlinedFill: {
    enabled: primitives.neutrals10,
    hovered: primitives.neutrals50,
    focused: primitives.neutrals50,
    pressed: primitives.neutrals10,
    disabled: primitives.neutrals10,
  },
  iconQuickLink: {
    hovered: primitives.neutrals10,
    focused: primitives.neutrals50,
    pressed: primitives.neutrals50,
  },
  imageQuickLinkStroke: {
    enabled: primitives.neutrals50,
    hovered: primitives.neutrals10,
    focused: primitives.neutrals50,
    pressed: primitives.neutrals50,
    disabled: primitives.neutrals10,
  },
  imageQuickLinkFill: {
    enabled: primitives.neutrals10,
    hovered: primitives.neutrals50,
    focused: primitives.neutrals50,
    pressed: primitives.neutrals10,
  },
  favorite: {
    enabled: primitives.neutrals10,
    active: primitives.neutrals10,
  },
};

type ChipsTokens = {
  filter: {
    fill: {
      selectedFalse: {
        enabled: string;
        hovered: string;
        focused: string;
      };
      selectedTrue: {
        enabled: string;
        hovered: string;
        focused: string;
        disabled: string;
      };
    };
    stroke: {
      enabled: string;
      hovered: string;
      focused: string;
      disabled: string;
    };
  };
};
const chipsTokensLight: ChipsTokens = {
  filter: {
    fill: {
      selectedFalse: {
        enabled: primitives.neutrals10,
        hovered: primitives.neutrals200,
        focused: primitives.neutrals200,
      },
      selectedTrue: {
        enabled: primitives.accent200,
        hovered: primitives.accent300,
        focused: primitives.accent300,
        disabled: primitives.neutrals200,
      },
    },
    stroke: {
      enabled: primitives.neutrals400,
      hovered: primitives.neutrals700,
      focused: primitives.neutrals700,
      disabled: primitives.neutrals200,
    },
  },
};
const chipsTokensDark: ChipsTokens = {
  filter: {
    fill: {
      selectedFalse: {
        enabled: primitives.neutrals10,
        hovered: primitives.neutrals50,
        focused: primitives.neutrals50,
      },
      selectedTrue: {
        enabled: primitives.neutrals50,
        hovered: primitives.neutrals10,
        focused: primitives.neutrals10,
        disabled: primitives.neutrals10,
      },
    },
    stroke: {
      enabled: primitives.neutrals50,
      hovered: primitives.neutrals10,
      focused: primitives.neutrals50,
      disabled: primitives.neutrals10,
    },
  },
};

type SwitchTokens = {
  true: {
    enabled: string;
    hovered: string;
    disabled: string;
    handle: BackgroundTokens["neutral"];
  };
  false: {
    enabled: string;
    hovered: string;
    disabled: string;
    handle: BackgroundTokens["neutral"];
  };
};
const switchTokensLight: SwitchTokens = {
  true: {
    enabled: primitives.accent500,
    hovered: primitives.accent700,
    disabled: primitives.neutrals200,
    handle: backgroundTokensLight.neutral,
  },
  false: {
    enabled: primitives.neutrals400,
    hovered: primitives.neutrals500,
    disabled: primitives.neutrals200,
    handle: backgroundTokensLight.neutral,
  },
};
const switchTokensDark: SwitchTokens = {
  true: {
    enabled: primitives.neutrals50,
    hovered: primitives.neutrals10,
    disabled: primitives.neutrals10,
    handle: backgroundTokensDark.neutral,
  },
  false: {
    enabled: primitives.neutrals10,
    hovered: primitives.neutrals50,
    disabled: primitives.neutrals10,
    handle: backgroundTokensDark.neutral,
  },
};

type RadioTokens = {
  true: {
    enabled: string;
    hovered: string;
    disabled: string;
    handle: BackgroundTokens["neutral"];
  };
  false: {
    enabled: string;
    hovered: string;
    disabled: string;
    handle: BackgroundTokens["neutral"];
  };
};
const radioTokensLight: RadioTokens = {
  true: {
    enabled: primitives.accent500,
    hovered: primitives.accent700,
    disabled: primitives.neutrals200,
    handle: backgroundTokensLight.neutral,
  },
  false: {
    enabled: primitives.neutrals400,
    hovered: primitives.neutrals500,
    disabled: primitives.neutrals200,
    handle: backgroundTokensLight.neutral,
  },
};
const radioTokensDark: RadioTokens = {
  true: {
    enabled: primitives.neutrals50,
    hovered: primitives.neutrals10,
    disabled: primitives.neutrals10,
    handle: backgroundTokensDark.neutral,
  },
  false: {
    enabled: primitives.neutrals10,
    hovered: primitives.neutrals50,
    disabled: primitives.neutrals10,
    handle: backgroundTokensDark.neutral,
  },
};

type CheckTokens = {
  true: {
    enabled: string;
    hovered: string;
    disabled: string;
    handle: BackgroundTokens["neutral"];
  };
  false: {
    enabled: string;
    hovered: string;
    disabled: string;
    handle: BackgroundTokens["neutral"];
  };
};
const checkTokensLight: CheckTokens = {
  true: {
    enabled: primitives.accent500,
    hovered: primitives.accent700,
    disabled: primitives.neutrals200,
    handle: backgroundTokensLight.neutral,
  },
  false: {
    enabled: primitives.neutrals400,
    hovered: primitives.neutrals500,
    disabled: primitives.neutrals200,
    handle: backgroundTokensLight.neutral,
  },
};
const checkTokensDark: CheckTokens = {
  true: {
    enabled: primitives.neutrals50,
    hovered: primitives.neutrals10,
    disabled: primitives.neutrals10,
    handle: backgroundTokensDark.neutral,
  },
  false: {
    enabled: primitives.neutrals10,
    hovered: primitives.neutrals50,
    disabled: primitives.neutrals10,
    handle: backgroundTokensDark.neutral,
  },
};

type TextFieldsTokens = {
  enabled: string;
  hovered: string;
  clicked: string;
  disabled: string;
  error: string;
};
const textFieldsTokensLight: TextFieldsTokens = {
  enabled: primitives.neutrals400,
  hovered: primitives.neutrals500,
  clicked: primitives.accent300,
  disabled: primitives.neutrals200,
  error: primitives.semanticError500,
};
const textFieldsTokensDark: TextFieldsTokens = {
  enabled: primitives.neutrals10,
  hovered: primitives.neutrals50,
  clicked: primitives.accent300,
  disabled: primitives.neutrals10,
  error: primitives.semanticError500,
};

type BadgesTokens = {
  large: string;
  medium: string;
  small: string;
};
const badgesTokensLight: BadgesTokens = {
  large: primitives.accent500,
  medium: primitives.accent500,
  small: primitives.accent500,
};
const badgesTokensDark: BadgesTokens = {
  large: primitives.accent200,
  medium: primitives.accent200,
  small: primitives.accent200,
};

type LogoTokens = {
  vector: string;
  background: string;
};
const logoTokensLight: LogoTokens = {
  vector: primitives.primary800,
  background: primitives.secondary200,
};
const logoTokensDark: LogoTokens = {
  vector: primitives.secondary200,
  background: primitives.primary800,
};

type CardTokens = {
  message: string;
};
const cardTokensLight: CardTokens = {
  message: primitives.secondary100,
};
const cardTokensDark: CardTokens = {
  message: primitives.secondary800,
};

type NavigationTokens = {
  enabled: string;
  hovered: string;
  focused: string;
  pressed: string;
  disabled: string;
};
const navigationTokensLight: NavigationTokens = {
  enabled: primitives.primary200,
  hovered: primitives.primary200,
  focused: primitives.primary200,
  pressed: primitives.primary200,
  disabled: primitives.neutrals200,
};
const navigationTokensDark: NavigationTokens = {
  enabled: primitives.neutrals50,
  hovered: primitives.secondary200,
  focused: primitives.primary800,
  pressed: primitives.primary800,
  disabled: primitives.neutrals10,
};

export type ColorTokens = {
  text: TextTokens;
  background: BackgroundTokens;
  dividers: DividersTokens;
  buttons: ButtonsTokens;
  chips: ChipsTokens;
  switch: SwitchTokens;
  radio: RadioTokens;
  check: CheckTokens;
  textField: TextFieldsTokens;
  badges: BadgesTokens;
  logo: LogoTokens;
  card: CardTokens;
  navigation: NavigationTokens;
};
type ThemeColorTokens = {
  light: ColorTokens;
  dark: ColorTokens;
};
export const themeColorTokens: ThemeColorTokens = {
  light: {
    text: textTokensLight,
    background: backgroundTokensLight,
    dividers: dividersTokensLight,
    buttons: buttonTokensLight,
    chips: chipsTokensLight,
    switch: switchTokensLight,
    radio: radioTokensLight,
    check: checkTokensLight,
    textField: textFieldsTokensLight,
    badges: badgesTokensLight,
    logo: logoTokensLight,
    card: cardTokensLight,
    navigation: navigationTokensLight,
  },
  dark: {
    text: textTokensDark,
    background: backgroundTokensDark,
    dividers: dividersTokensDark,
    buttons: buttonTokensDark,
    chips: chipsTokensDark,
    switch: switchTokensDark,
    radio: radioTokensDark,
    check: checkTokensDark,
    textField: textFieldsTokensDark,
    badges: badgesTokensDark,
    logo: logoTokensDark,
    card: cardTokensDark,
    navigation: navigationTokensDark,
  },
};
