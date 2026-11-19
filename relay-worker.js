// 링크 서랍 전용 중계 서버 (Cloudflare Workers, 무료)
// 링크 서랍 사이트가 유튜브 게시물·인스타 게시물 정보를 읽어 올 수 있게 대신 가져다 줘요.
// 아래 주소들만 중계해서, 다른 용도로는 쓸 수 없어요.
const ALLOWED = /(^|\.)(youtube\.com|youtu\.be|ytimg\.com|ggpht\.com|googleusercontent\.com|instagram\.com|cdninstagram\.com|fbcdn\.net)$/i;

export default {
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "GET") return new Response("GET만 돼요", { status: 405, headers: cors });

    const target = new URL(request.url).searchParams.get("url");
    if (!target) return new Response("링크 서랍 중계 서버가 잘 동작하고 있어요.", { headers: { ...cors, "Content-Type": "text/plain; charset=utf-8" } });

    let url;
    try { url = new URL(target); } catch { return new Response("주소가 올바르지 않아요", { status: 400, headers: cors }); }
    if (url.protocol !== "https:" || !ALLOWED.test(url.hostname)) {
      return new Response("유튜브·인스타 주소만 중계해요", { status: 403, headers: cors });
    }

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
        // 유튜브 '동의' 화면 건너뛰기
        "Cookie": "CONSENT=YES+cb; SOCS=CAI"
      },
      redirect: "follow",
      cf: { cacheTtl: 1800, cacheEverything: true }
    });

    const headers = new Headers();
    headers.set("Content-Type", res.headers.get("Content-Type") || "text/html; charset=utf-8");
    headers.set("Cache-Control", "public, max-age=1800");
    for (const [k, v] of Object.entries(cors)) headers.set(k, v);
    return new Response(res.body, { status: res.status, headers });
  }
};
