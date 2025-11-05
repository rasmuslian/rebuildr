import { DoSearchQuery } from "@/gql/graphql";
import { createContext, useState, PropsWithChildren, useEffect } from "react";

type SearchDropdownContextType = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  position: { x: number; y: number; width: number };
  setPosition: (position: { x: number; y: number; width: number }) => void;
  searchData: DoSearchQuery | undefined;
  setSearchData: (data: DoSearchQuery | undefined) => void;
  searchString?: string;
  setSearchString: (searchString: string) => void;
};

export const SearchDropdownContext = createContext<SearchDropdownContextType>({
  visible: false,
  setVisible: () => {},
  position: { x: 0, y: 0, width: 0 },
  setPosition: () => {},
  searchData: undefined,
  setSearchData: () => {},
  searchString: "",
  setSearchString: () => {},
});

export const SearchDropdownContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0 });
  const [searchData, setSearchData] = useState<DoSearchQuery | undefined>(
    undefined,
  );
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    if (!visible) {
      setPosition({ x: 0, y: 0, width: 0 });
    }
  }, [visible]);

  return (
    <SearchDropdownContext.Provider
      value={{
        visible,
        setVisible,
        position,
        setPosition,
        searchData,
        setSearchData,
        searchString,
        setSearchString,
      }}
    >
      {children}
    </SearchDropdownContext.Provider>
  );
};
