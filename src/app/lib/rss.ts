import { XMLParser } from "fast-xml-parser";

export function parseRss(xml: string) {
  const p = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const js = p.parse(xml);
  if (js.rss) {
    const ch = js.rss.channel;
    const items = Array.isArray(ch.item) ? ch.item : [ch.item].filter(Boolean);
    return (items || []).map((it: any) => ({
      title: it.title || "",
      link: it.link || "",
      pubDate: it.pubDate || "",
      summary: it.description || ""
    }));
  }
  if (js.feed && js.feed.entry) {
    const items = Array.isArray(js.feed.entry) ? js.feed.entry : [js.feed.entry];
    return items.map((it: any) => ({
      title: it.title?.["#text"] || it.title || "",
      link: it.link?.["@_href"] || it.link?.[0]?.["@_href"] || "",
      pubDate: it.updated || it.published || "",
      summary: it.summary || it.content || ""
    }));
  }
  return [];
}
