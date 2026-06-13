import {
  getApiOrigin,
  getYoutubeEmbedPageOrigin,
} from "@/utils/resolve-media-url";

/**
 * Fraction of a video that must be watched before it is auto-marked complete.
 * Posted up to native as the `video-complete` message.
 */
export const VIDEO_COMPLETION_THRESHOLD = 0.8;

export function buildYoutubeEmbedHtml(
  videoId: string,
  pageOrigin: string,
): string {
  const id = JSON.stringify(videoId);
  const origin = JSON.stringify(pageOrigin);
  const threshold = VIDEO_COMPLETION_THRESHOLD;
  // Uses the YouTube IFrame API so we can watch playback progress and post a
  // `video-complete` message once >= threshold of the video has been watched
  // (or it reaches the end).
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden}#player{position:absolute;inset:0;width:100%;height:100%}#player iframe{width:100%;height:100%;border:0}</style></head><body><div id="player"></div><script>(function(){function p(t){try{window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(t)}catch(e){}}var fired=false,poll=null;function complete(){if(fired)return;fired=true;if(poll){clearInterval(poll);poll=null}p('video-complete')}window.onYouTubeIframeAPIReady=function(){try{new YT.Player('player',{videoId:${id},playerVars:{autoplay:1,playsinline:1,rel:0,modestbranding:1,origin:${origin}},events:{onReady:function(){p('iframe-loaded')},onError:function(){p('iframe-error')},onStateChange:function(e){if(e.data===YT.PlayerState.PLAYING){if(poll)clearInterval(poll);poll=setInterval(function(){try{var pl=e.target,d=pl.getDuration(),t=pl.getCurrentTime();if(d>0&&t/d>=${threshold})complete()}catch(x){}},1000)}else if(e.data===YT.PlayerState.ENDED){complete()}}}})}catch(x){p('iframe-error')}};var s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=function(){p('iframe-error')};document.head.appendChild(s)})();</script></body></html>`;
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
  const threshold = VIDEO_COMPLETION_THRESHOLD;
  // Loads the Vimeo Player API to watch `timeupdate.percent` and post a
  // `video-complete` message once >= threshold has been watched (or it ends).
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden}iframe{position:absolute;inset:0;width:100%;height:100%;border:0}</style></head><body><iframe id="player" src="${srcAttr}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe><script>(function(){var f=document.getElementById('player');function p(t){try{window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(t)}catch(e){}}var fired=false;function complete(){if(fired)return;fired=true;p('video-complete')}if(f){f.addEventListener('error',function(){p('iframe-error')})}var s=document.createElement('script');s.src='https://player.vimeo.com/api/player.js';s.onerror=function(){p('iframe-loaded')};s.onload=function(){try{var player=new Vimeo.Player(f);player.on('loaded',function(){p('iframe-loaded')});player.on('timeupdate',function(d){if(d&&d.percent>=${threshold})complete()});player.on('ended',function(){complete()});player.ready().then(function(){p('iframe-loaded')}).catch(function(){})}catch(x){p('iframe-loaded')}};document.head.appendChild(s)})();</script></body></html>`;
}

export { getYoutubeEmbedPageOrigin };
