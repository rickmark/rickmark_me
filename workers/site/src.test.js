import assert from "node:assert/strict";
import test from "node:test";
import worker from "./src.js";

test("serves the main site through the static assets binding", async () => {
  for (const path of ["/", "/blog/checkra1n-and-the-t2/", "/assets/style.css", "/sitemap.xml", "/llms.txt", "/missing/"]) {
    const request = new Request(`https://rickmark.me${path}`);
    const expected = new Response("asset", { status: path === "/missing/" ? 404 : 200 });
    const actual = await worker.fetch(request, { ASSETS: { fetch(received) {
      assert.equal(received, request);
      return expected;
    } } });
    assert.equal(actual, expected);
  }
});

const paths = [
  "/", "/plugnpwn-connect-to-jailbreak/",
  "/work-in-progress-using-apple-internal-builds-for-rootkits/",
  "/untitled-2/", "/untitled/", "/checkra1n-and-the-t2/",
  "/reality-capture-revopoint-miraco-metrox-workflow/",
  "/ace-controller-secrets/", "/wip-icloud-keychain-poisoning/",
  "/abusing-efi-variables-and-the-amt/",
];
for (const path of paths) {
  test(`preserves legacy path ${path} over HTTP and HTTPS`, () => {
    for (const protocol of ["http:", "https:"]) {
      const response = worker.fetch(new Request(`${protocol}//blog.rickmark.me${path}`));
      assert.equal(response.status, 301);
      assert.equal(response.headers.get("Location"), `https://rickmark.me/blog${path}`);
    }
  });
}
test("preserves query strings without duplicating the blog prefix", () => {
  const response = worker.fetch(new Request("https://blog.rickmark.me/blog/untitled/?ref=old&x=1"));
  assert.equal(response.headers.get("Location"), "https://rickmark.me/blog/untitled/?ref=old&x=1");
});
test("normalizes the blog index and cannot redirect to a supplied host", () => {
  for (const path of ["/blog", "//evil.example/path", "/%2F%2Fevil.example/"]) {
    const response = worker.fetch(new Request(`https://blog.rickmark.me${path}`));
    assert.equal(new URL(response.headers.get("Location")).origin, "https://rickmark.me");
  }
});
