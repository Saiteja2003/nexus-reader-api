import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Use the same robust RSS parser you used in Express, ported for Deno
import Parser from "https://esm.sh/rss-parser@3.13.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const parser = new Parser();

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) throw new Error("URL is required");

    // Fetch with a User-Agent to prevent news sites from blocking the request
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Target site blocked request or is down (HTTP ${response.status})`,
      );
    }

    const xmlText = await response.text();

    // Parse the XML using rss-parser
    const feed = await parser.parseString(xmlText);

    // Standardize the output for your React frontend
    const items = feed.items.map((item) => ({
      title: item.title || "No title",
      link: item.link || "",
      pubDate: item.pubDate || item.isoDate || "",
      contentSnippet: item.contentSnippet || item.summary || "",
      content: item["content:encoded"] || item.content || "",
    }));

    return new Response(JSON.stringify({ title: feed.title, items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("RSS Parse Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
