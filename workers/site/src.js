// The fixed destination prevents user-controlled paths becoming external redirects.
export default {
  fetch(request, env) {
    const source = new URL(request.url);
    if (source.hostname !== "blog.rickmark.me") return env.ASSETS.fetch(request);
    const target = new URL("https://rickmark.me");
    target.pathname = source.pathname === "/blog" || source.pathname.startsWith("/blog/")
      ? source.pathname
      : `/blog${source.pathname}`;
    if (target.pathname === "/blog") target.pathname = "/blog/";
    target.search = source.search;
    return new Response(null, {
      status: 301,
      headers: { Location: target.href },
    });
  },
};
