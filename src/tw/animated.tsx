import { cssInterop } from "nativewind";
import React from "react";
import {
  ScrollView as RNScrollView,
  Text as RNText,
  View as RNView,
} from "react-native";
import RNAnimated from "react-native-reanimated";
import { PressableScale } from "./index";

const AnimatedView = cssInterop(RNAnimated.createAnimatedComponent(RNView), {
  className: "style",
});
const AnimatedScrollView = cssInterop(
  RNAnimated.createAnimatedComponent(RNScrollView),
  {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  },
);
const AnimatedText = cssInterop(RNAnimated.createAnimatedComponent(RNText), {
  className: "style",
});
const AnimatedPressableScale = cssInterop(
  RNAnimated.createAnimatedComponent(
    PressableScale as React.ComponentType<any>,
  ),
  { className: "style" },
);

export const Animated = {
  ...RNAnimated,
  View: AnimatedView,
  ScrollView: AnimatedScrollView,
  Text: AnimatedText,
  PressableScale: AnimatedPressableScale,
};
