import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useMemo, useState } from "react";
import {
  Text,
  useColorScheme,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { WebView, type WebViewNavigation } from "react-native-webview";

import {
  containsHtmlMarkup,
  normalizeHtmlToPlainText,
  sanitizeHtmlForDisplay,
} from "@/utils/html-content";

const ACCENT = "#DA6728";

type HtmlContentViewProps = {
  html: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

function buildHtmlDocument(
  body: string,
  colors: { text: string; link: string },
): string {
  const safeBody = sanitizeHtmlForDisplay(body);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: ${colors.text};
      background: transparent;
      -webkit-text-size-adjust: 100%;
    }
    p { margin: 0 0 12px; }
    p:last-child { margin-bottom: 0; }
    strong, b { font-weight: 700; }
    ul, ol { margin: 0 0 12px; padding-left: 20px; }
    li { margin-bottom: 6px; }
    a { color: ${colors.link}; word-break: break-word; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    h1, h2, h3, h4 { margin: 0 0 10px; line-height: 1.3; }
  </style>
</head>
<body>${safeBody}</body>
</html>`;
}

function AutoHeightHtmlWebView({ html }: { html: string }) {
  const colorScheme = useColorScheme();
  const [height, setHeight] = useState(48);

  const colors = useMemo(
    () =>
      colorScheme === "dark"
        ? { text: "rgba(255, 255, 255, 0.85)", link: "#F0A06A" }
        : { text: "rgba(26, 26, 26, 0.8)", link: ACCENT },
    [colorScheme],
  );

  const source = useMemo(
    () => ({ html: buildHtmlDocument(html, colors) }),
    [html, colors],
  );

  const onMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    const next = Number.parseInt(event.nativeEvent.data, 10);
    if (Number.isFinite(next) && next > 0) {
      setHeight((current) => (Math.abs(current - next) > 2 ? next : current));
    }
  }, []);

  const onShouldStartLoadWithRequest = useCallback((request: WebViewNavigation) => {
    const url = request.url ?? "";
    if (
      url === "about:blank" ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    ) {
      return true;
    }

    void WebBrowser.openBrowserAsync(url);
    return false;
  }, []);

  const injectedJavaScript = `
    (function () {
      function postHeight() {
        var height = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        );
        window.ReactNativeWebView.postMessage(String(height));
      }
      postHeight();
      if (typeof ResizeObserver !== "undefined") {
        new ResizeObserver(postHeight).observe(document.body);
      }
      window.addEventListener("load", postHeight);
    })();
    true;
  `;

  return (
    <WebView
      source={source}
      style={{ height, backgroundColor: "transparent" }}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      originWhitelist={["*"]}
      onMessage={onMessage}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      injectedJavaScript={injectedJavaScript}
      javaScriptEnabled
      domStorageEnabled={false}
    />
  );
}

export function HtmlContentView({
  html,
  style,
  textStyle,
}: HtmlContentViewProps) {
  const trimmed = html.trim();
  if (!trimmed) return null;

  if (!containsHtmlMarkup(trimmed)) {
    return (
      <Text style={textStyle ?? (style as StyleProp<TextStyle>)}>
        {normalizeHtmlToPlainText(trimmed)}
      </Text>
    );
  }

  return (
    <View style={style}>
      <AutoHeightHtmlWebView html={trimmed} />
    </View>
  );
}
