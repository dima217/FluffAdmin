import { NextRequest, NextResponse } from "next/server";

import { normalizeMediaUrl } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  const fetchUrl = normalizeMediaUrl(url) ?? url;

  try {
    new URL(fetchUrl);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  const range = request.headers.get("range");

  try {
    const upstream = await fetch(fetchUrl, {
      headers: range ? { Range: range } : undefined,
    });
    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json(
        { error: "upstream failed" },
        { status: upstream.status }
      );
    }

    const headers = new Headers();
    for (const name of [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
    ]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
