import { useCallback, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

type ScrollableNode = {
  scrollTo?: (options: { x: number; animated?: boolean }) => void;
  scrollToOffset?: (options: { offset: number; animated?: boolean }) => void;
};

// Tolerance for float rounding at the scroll edges, so an arrow never
// lingers when the row is already fully scrolled.
const EDGE_EPSILON = 2;

const SCROLL_STEP_RATIO = 0.85;

export const useCarouselScroll = () => {
  const nodeRef = useRef<ScrollableNode | null>(null);
  const offsetXRef = useRef(0);
  const containerWidthRef = useRef(0);
  const contentWidthRef = useRef(0);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback(() => {
    const offsetX = offsetXRef.current;
    const containerWidth = containerWidthRef.current;
    const contentWidth = contentWidthRef.current;
    setCanScrollLeft(offsetX > EDGE_EPSILON);
    setCanScrollRight(offsetX + containerWidth < contentWidth - EDGE_EPSILON);
  }, []);

  // Callback ref instead of a typed RefObject so the same hook works for
  // both ScrollView (scrollTo) and FlatList (scrollToOffset).
  const setScrollRef = useCallback((node: ScrollableNode | null) => {
    nodeRef.current = node;
  }, []);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      offsetXRef.current = event.nativeEvent.contentOffset.x;
      update();
    },
    [update],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      containerWidthRef.current = event.nativeEvent.layout.width;
      update();
    },
    [update],
  );

  const onContentSizeChange = useCallback(
    (width: number) => {
      contentWidthRef.current = width;
      update();
    },
    [update],
  );

  const scrollBy = useCallback((direction: -1 | 1) => {
    const maxOffset = Math.max(
      contentWidthRef.current - containerWidthRef.current,
      0,
    );
    const step = containerWidthRef.current * SCROLL_STEP_RATIO;
    const target = Math.min(
      Math.max(offsetXRef.current + direction * step, 0),
      maxOffset,
    );
    const node = nodeRef.current;
    if (node?.scrollToOffset) {
      node.scrollToOffset({ offset: target, animated: true });
    } else {
      node?.scrollTo?.({ x: target, animated: true });
    }
  }, []);

  return {
    setScrollRef,
    scrollProps: {
      onScroll,
      onLayout,
      onContentSizeChange,
      scrollEventThrottle: 16,
    },
    canScrollLeft,
    canScrollRight,
    scrollBy,
  };
};
