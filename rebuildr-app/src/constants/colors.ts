export const Primitives = {
  Primary100: "#E9F6ED",
  Primary200: "#D6E6DC",
  Primary300: "#70AEA3",
  Primary400: "#5EA193",
  Primary500: "#4B9382",
  Primary600: "#417D6E",
  Primary700: "#176457",
  Primary800: "#00493E",
  Primary900: "#00332B",
  Secondary100: "#FBF8F1",
  Secondary200: "#F8F1E3",
  Secondary300: "#F2E6D1",
  Secondary400: "#E9DCC5",
  Secondary500: "#DFD2BA",
  Secondary600: "#C0B196",
  Secondary700: "#8B7E65",
  Secondary800: "#564A34",
  Secondary900: "#30291D",
  Accent100: "#F5EFFF",
  Accent200: "#DDC7FF",
  Accent300: "#AC82FF",
  Accent400: "#995FFF",
  Accent500: "#863CFF",
  Accent600: "#7E24F3",
  Accent700: "#7017DD",
  Accent800: "#5A0BBC",
  Accent900: "#40048E",
  Neutrals100: "#FFFFFF",
  Neutrals200: "#E6E6E6",
  Neutrals300: "#C7C7C7",
  Neutrals400: "#AEAEAE",
  Neutrals500: "#959595",
  Neutrals600: "#616161",
  Neutrals700: "#4B4B4B",
  Neutrals800: "#323232",
  Neutrals900: "#1E1E1E",
  SemanticError100: "#FFEDEB",
  SemanticError200: "#FFDAD7",
  SemanticError300: "#FFB3AD",
  SemanticError400: "#FF8981",
  SemanticError500: "#E66A63",
  SemanticError600: "#C5524C",
  SemanticError700: "#A53A36",
  SemanticError800: "#852221",
  SemanticError900: "#65090E",
};

export type TextTokens = {
  PrimaryDark: string;
  PrimaryLight: string;
  Secondary: string;
  Disabled: string;
  Link: string;
  Error: string;
  Success: string;
};
const textTokensLight: TextTokens = {
  PrimaryDark: Primitives.Neutrals900,
  PrimaryLight: Primitives.Neutrals100,
  Secondary: Primitives.Neutrals900,
  Disabled: Primitives.Neutrals400,
  Link: Primitives.Accent500,
  Error: Primitives.SemanticError600,
  Success: Primitives.Primary600,
};
const textTokensDark: TextTokens = {
  PrimaryDark: Primitives.Neutrals100,
  PrimaryLight: Primitives.Neutrals900,
  Secondary: Primitives.Neutrals200,
  Disabled: Primitives.Neutrals500,
  Link: Primitives.Accent200,
  Error: Primitives.SemanticError400,
  Success: Primitives.Primary400,
};

type BackgroundTokens = {
  Neutral: string;
  Secondary: string;
  Primary: string;
};
const backgroundTokensLight: BackgroundTokens = {
  Neutral: Primitives.Neutrals100,
  Secondary: Primitives.Secondary100,
  Primary: Primitives.Primary100,
};
const backgroundTokensDark: BackgroundTokens = {
  Neutral: Primitives.Neutrals900,
  Secondary: Primitives.Secondary900,
  Primary: Primitives.Primary900,
};

type DividersTokens = {
  Neutral: string;
  Secondary: string;
  Primary: string;
};
const dividersTokensLight: DividersTokens = {
  Neutral: Primitives.Neutrals300,
  Secondary: Primitives.Secondary500,
  Primary: Primitives.Primary300,
};
const dividersTokensDark: DividersTokens = {
  Neutral: Primitives.Neutrals700,
  Secondary: Primitives.Secondary700,
  Primary: Primitives.Primary700,
};

type ButtonsTokens = {
  Filled: {
    Enabled: string;
    Hovered: string;
    Focused: string;
    Pressed: string;
    Disabled: string;
  };
  Tonal: {
    Enabled: string;
    Hovered: string;
    Focused: string;
    Pressed: string;
    Disabled: string;
  };
  Text: {
    Hovered: string;
    Focused: string;
    Pressed: string;
    Disabled: string;
  };
  OutlinedStroke: {
    Enabled: string;
    Hovered: string;
    Focused: string;
    Pressed: string;
    Disabled: string;
  };
  OutlinedFill: {
    Enabled: string;
    Hovered: string;
    Focused: string;
    Pressed: string;
    Disabled: string;
  };
  ImageQuickLinkStroke: {
    Enabled: string;
    Hovered: string;
    Focused: string;
    Pressed: string;
    Disabled: string;
  };
  ImageQuickLinkFill: {
    Enabled: string;
    Hovered: string;
    Focused: string;
    Pressed: string;
  };
  Favorite: {
    Enabled: string;
    Active: string;
  };
};
const buttonTokensLight: ButtonsTokens = {
  Filled: {
    Enabled: Primitives.Accent500,
    Hovered: Primitives.Accent400,
    Focused: Primitives.Accent400,
    Pressed: Primitives.Accent500,
    Disabled: Primitives.Neutrals200,
  },
  Tonal: {
    Enabled: Primitives.Accent100,
    Hovered: Primitives.Accent200,
    Focused: Primitives.Accent200,
    Pressed: Primitives.Accent300,
    Disabled: Primitives.Neutrals200,
  },
  Text: {
    Hovered: Primitives.Accent100,
    Focused: Primitives.Accent200,
    Pressed: Primitives.Accent300,
    Disabled: Primitives.Neutrals200,
  },
  OutlinedStroke: {
    Enabled: Primitives.Neutrals400,
    Hovered: Primitives.Neutrals700,
    Focused: Primitives.Neutrals700,
    Pressed: Primitives.Neutrals400,
    Disabled: Primitives.Neutrals200,
  },
  OutlinedFill: {
    Enabled: Primitives.Neutrals100,
    Hovered: Primitives.Accent100,
    Focused: Primitives.Accent100,
    Pressed: Primitives.Neutrals100,
    Disabled: Primitives.Neutrals100,
  },
  ImageQuickLinkStroke: {
    Enabled: Primitives.Neutrals400,
    Hovered: Primitives.Neutrals700,
    Focused: Primitives.Neutrals700,
    Pressed: Primitives.Neutrals400,
    Disabled: Primitives.Neutrals200,
  },
  ImageQuickLinkFill: {
    Enabled: Primitives.Neutrals100,
    Hovered: Primitives.Neutrals100,
    Focused: Primitives.Neutrals100,
    Pressed: Primitives.Neutrals100,
  },
  Favorite: {
    Enabled: Primitives.Neutrals900,
    Active: Primitives.Neutrals500,
  },
};
const buttonTokensDark: ButtonsTokens = {
  Filled: {
    Enabled: Primitives.Neutrals100,
    Hovered: Primitives.Secondary200,
    Focused: Primitives.Secondary200,
    Pressed: Primitives.Neutrals500,
    Disabled: Primitives.Neutrals100,
  },
  Tonal: {
    Enabled: Primitives.Neutrals500,
    Hovered: Primitives.Secondary200,
    Focused: Primitives.Secondary200,
    Pressed: Primitives.Neutrals500,
    Disabled: Primitives.Neutrals100,
  },
  Text: {
    Hovered: Primitives.Neutrals100,
    Focused: Primitives.Neutrals500,
    Pressed: Primitives.Neutrals500,
    Disabled: Primitives.Neutrals100,
  },
  OutlinedStroke: {
    Enabled: Primitives.Neutrals500,
    Hovered: Primitives.Neutrals100,
    Focused: Primitives.Neutrals500,
    Pressed: Primitives.Neutrals500,
    Disabled: Primitives.Neutrals100,
  },
  OutlinedFill: {
    Enabled: Primitives.Neutrals100,
    Hovered: Primitives.Neutrals500,
    Focused: Primitives.Neutrals500,
    Pressed: Primitives.Neutrals100,
    Disabled: Primitives.Neutrals100,
  },
  ImageQuickLinkStroke: {
    Enabled: Primitives.Neutrals500,
    Hovered: Primitives.Neutrals100,
    Focused: Primitives.Neutrals500,
    Pressed: Primitives.Neutrals500,
    Disabled: Primitives.Neutrals100,
  },
  ImageQuickLinkFill: {
    Enabled: Primitives.Neutrals100,
    Hovered: Primitives.Neutrals500,
    Focused: Primitives.Neutrals500,
    Pressed: Primitives.Neutrals100,
  },
  Favorite: {
    Enabled: Primitives.Neutrals100,
    Active: Primitives.Neutrals100,
  },
};

type ChipsTokens = {
  FilterStroke: {
    Enabled: string;
    Hovered: string;
    Focused: string;
    Disabled: string;
  };
  FillSelectedFalse: {
    Enabled: string;
    Hovered: string;
    Focused: string;
  };
  FillSelectedTrue: {
    Enabled: string;
    Hovered: string;
    Focused: string;
    Disabled: string;
  };
};
const chipsTokensLight: ChipsTokens = {
  FilterStroke: {
    Enabled: Primitives.Neutrals400,
    Hovered: Primitives.Neutrals700,
    Focused: Primitives.Neutrals700,
    Disabled: Primitives.Neutrals200,
  },
  FillSelectedFalse: {
    Enabled: Primitives.Neutrals100,
    Hovered: Primitives.Neutrals200,
    Focused: Primitives.Neutrals200,
  },
  FillSelectedTrue: {
    Enabled: Primitives.Accent200,
    Hovered: Primitives.Accent200,
    Focused: Primitives.Accent300,
    Disabled: Primitives.Neutrals200,
  },
};
const chipsTokensDark: ChipsTokens = {
  FilterStroke: {
    Enabled: Primitives.Neutrals500,
    Hovered: Primitives.Neutrals100,
    Focused: Primitives.Neutrals500,
    Disabled: Primitives.Neutrals100,
  },
  FillSelectedFalse: {
    Enabled: Primitives.Neutrals100,
    Hovered: Primitives.Neutrals500,
    Focused: Primitives.Neutrals500,
  },
  FillSelectedTrue: {
    Enabled: Primitives.Accent500,
    Hovered: Primitives.Accent100,
    Focused: Primitives.Accent100,
    Disabled: Primitives.Neutrals100,
  },
};

type SwitchTokens = {
  True: {
    Enabled: string;
    Hovered: string;
    Disabled: string;
    Handle: BackgroundTokens["Neutral"];
  };
  False: {
    Enabled: string;
    Hovered: string;
    Disabled: string;
    Handle: BackgroundTokens["Neutral"];
  };
};
const switchTokensLight: SwitchTokens = {
  True: {
    Enabled: Primitives.Accent500,
    Hovered: Primitives.Accent700,
    Disabled: Primitives.Neutrals200,
    Handle: backgroundTokensLight.Neutral,
  },
  False: {
    Enabled: Primitives.Neutrals400,
    Hovered: Primitives.Neutrals500,
    Disabled: Primitives.Neutrals200,
    Handle: backgroundTokensLight.Neutral,
  },
};
const switchTokensDark: SwitchTokens = {
  True: {
    Enabled: Primitives.Neutrals500,
    Hovered: Primitives.Neutrals100,
    Disabled: Primitives.Neutrals100,
    Handle: backgroundTokensDark.Neutral,
  },
  False: {
    Enabled: Primitives.Neutrals100,
    Hovered: Primitives.Neutrals500,
    Disabled: Primitives.Neutrals200,
    Handle: backgroundTokensDark.Neutral,
  },
};

type RadioTokens = {
  True: {
    Enabled: string;
    Hovered: string;
    Disabled: string;
    Handle: BackgroundTokens["Neutral"];
  };
  False: {
    Enabled: string;
    Hovered: string;
    Disabled: string;
    Handle: BackgroundTokens["Neutral"];
  };
};
const radioTokensLight: RadioTokens = {
  True: {
    Enabled: Primitives.Accent500,
    Hovered: Primitives.Accent700,
    Disabled: Primitives.Neutrals200,
    Handle: backgroundTokensLight.Neutral,
  },
  False: {
    Enabled: Primitives.Neutrals400,
    Hovered: Primitives.Neutrals500,
    Disabled: Primitives.Neutrals200,
    Handle: backgroundTokensLight.Neutral,
  },
};
const radioTokensDark: RadioTokens = {
  True: {
    Enabled: Primitives.Neutrals500,
    Hovered: Primitives.Neutrals100,
    Disabled: Primitives.Neutrals100,
    Handle: backgroundTokensDark.Neutral,
  },
  False: {
    Enabled: Primitives.Neutrals100,
    Hovered: Primitives.Neutrals500,
    Disabled: Primitives.Neutrals100,
    Handle: backgroundTokensDark.Neutral,
  },
};

type CheckTokens = {
  True: {
    Enabled: string;
    Hovered: string;
    Disabled: string;
    Handle: BackgroundTokens["Neutral"];
  };
  False: {
    Enabled: string;
    Hovered: string;
    Disabled: string;
    Handle: BackgroundTokens["Neutral"];
  };
};
const checkTokensLight: CheckTokens = {
  True: {
    Enabled: Primitives.Accent500,
    Hovered: Primitives.Accent700,
    Disabled: Primitives.Neutrals200,
    Handle: backgroundTokensLight.Neutral,
  },
  False: {
    Enabled: Primitives.Neutrals400,
    Hovered: Primitives.Neutrals500,
    Disabled: Primitives.Neutrals200,
    Handle: backgroundTokensLight.Neutral,
  },
};
const checkTokensDark: CheckTokens = {
  True: {
    Enabled: Primitives.Neutrals500,
    Hovered: Primitives.Neutrals100,
    Disabled: Primitives.Neutrals100,
    Handle: backgroundTokensDark.Neutral,
  },
  False: {
    Enabled: Primitives.Neutrals100,
    Hovered: Primitives.Neutrals500,
    Disabled: Primitives.Neutrals100,
    Handle: backgroundTokensDark.Neutral,
  },
};

type TextFieldsTokens = {
  Enabled: string;
  Hovered: string;
  Clicked: string;
  Disabled: string;
  Error: string;
};
const textFieldsTokensLight: TextFieldsTokens = {
  Enabled: Primitives.Neutrals400,
  Hovered: Primitives.Neutrals500,
  Clicked: Primitives.Accent300,
  Disabled: Primitives.Neutrals200,
  Error: Primitives.SemanticError500,
};
const textFieldsTokensDark: TextFieldsTokens = {
  Enabled: Primitives.Neutrals100,
  Hovered: Primitives.Neutrals500,
  Clicked: Primitives.Accent300,
  Disabled: Primitives.Neutrals100,
  Error: Primitives.SemanticError500,
};

type BadgesTokens = {
  Large: string;
  Medium: string;
  Small: string;
};
const badgesTokensLight: BadgesTokens = {
  Large: Primitives.Primary200,
  Medium: Primitives.Accent500,
  Small: Primitives.Accent500,
};
const badgesTokensDark: BadgesTokens = {
  Large: Primitives.Primary700,
  Medium: Primitives.Accent200,
  Small: Primitives.Accent500,
};

type LogoTokens = {
  Vector: string;
  Background: string;
};
const logoTokensLight: LogoTokens = {
  Vector: Primitives.Primary800,
  Background: Primitives.Secondary200,
};
const logoTokensDark: LogoTokens = {
  Vector: Primitives.Secondary200,
  Background: Primitives.Primary800,
};

type CardTokens = {
  Message: string;
};
const cardTokensLight: CardTokens = {
  Message: Primitives.Secondary100,
};
const cardTokensDark: CardTokens = {
  Message: Primitives.Secondary800,
};

type ColorTokens = {
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
  },
};
