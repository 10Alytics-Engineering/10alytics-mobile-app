import {
  getApiOrigin,
  getYoutubeEmbedPageOrigin,
} from "@/utils/resolve-media-url";

export function buildYoutubeEmbedHtml(
  videoId: string,
  pageOrigin: string,
): string {
  const id = encodeURIComponent(videoId);
  const qs = new URLSearchParams({
    autoplay: "1",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    enablejsapi: "1",
    origin: pageOrigin,
  });
  const src = `https://www.youtube.com/embed/${id}?${qs.toString()}`;
  const srcAttr = src.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden}iframe{position:absolute;inset:0;width:100%;height:100%;border:0}</style></head><body><iframe id="player" src="${srcAttr}" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><script>(function(){var f=document.getElementById('player');function p(t){try{window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(t)}catch(e){}}if(f){f.addEventListener('load',function(){p('iframe-loaded')});f.addEventListener('error',function(){p('iframe-error')})}})();</script></body></html>`;
}

/**
 * Origin for Vimeo iframe embeds — must match a domain in the video's
 * Vimeo domain-whitelist setting.
 * Override via `EXPO_PUBLIC_VIMEO_EMBED_ORIGIN` if needed.
 */
export function getVimeoEmbedPageOrigin(): string {
  const explicit = process.env.EXPO_PUBLIC_VIMEO_EMBED_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const fromApi = getApiOrigin();
  if (fromApi) return fromApi;
  return "https://www.10alytics.io";
}

export function buildVimeoEmbedHtml(embedUrl: string): string {
  const sep = embedUrl.includes("?") ? "&" : "?";
  const params = new URLSearchParams({
    autoplay: "1",
    playsinline: "1",
    title: "0",
    byline: "0",
    portrait: "0",
    dnt: "1",
  });
  const src = `${embedUrl}${sep}${params.toString()}`;
  const srcAttr = src.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden}iframe{position:absolute;inset:0;width:100%;height:100%;border:0}</style></head><body><iframe id="player" src="${srcAttr}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe><script>(function(){var f=document.getElementById('player');function p(t){try{window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(t)}catch(e){}}if(f){f.addEventListener('load',function(){p('iframe-loaded')});f.addEventListener('error',function(){p('iframe-error')})}})();</script></body></html>`;
}

export { getYoutubeEmbedPageOrigin };
