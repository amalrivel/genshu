import { expect, test } from "bun:test";

test("theme bootstrap runs in server HTML and is inert on client renders", () => {
  // Isolate React's client exports from the suite's react-server condition.
  const providerPath = new URL("../src/components/theme-provider.tsx", import.meta.url).pathname;
  const result = Bun.spawnSync([process.execPath, "--eval", String.raw`
    import { createElement } from "react";
    import { renderToStaticMarkup } from "react-dom/server";
    import { runInNewContext } from "node:vm";
    import { ThemeProvider } from ${JSON.stringify(providerPath)};

    const html = renderToStaticMarkup(createElement(ThemeProvider, {
      attribute: "class", defaultTheme: "system", enableSystem: true,
      scriptProps: { "data-cfasync": "false" },
    }, createElement("main", null, "Lesson")));
    const script = html.match(/<script([^>]*)>([\s\S]*?)<\/script>/);
    const classes = new Set(["font-sans"]);
    const root = {
      classList: {
        remove: (...values) => values.forEach(value => classes.delete(value)),
        add: value => classes.add(value),
      },
      style: {},
    };
    const apply = (savedTheme) => {
      runInNewContext(script[2], {
        document: { documentElement: root },
        localStorage: { getItem: () => savedTheme },
        window: { matchMedia: () => ({ matches: true }) },
      });
      return [...classes];
    };
    const saved = apply("light");
    const system = apply(null);
    globalThis.window = {};
    const client = ThemeProvider({
      children: "Lesson", scriptProps: { "data-cfasync": "false" },
    });
    console.log(JSON.stringify({
      html, saved, system, clientScriptProps: client.props.scriptProps,
    }));
  `], { cwd: new URL("..", import.meta.url).pathname });

  expect(result.stderr.toString()).toBe("");
  expect(result.exitCode).toBe(0);
  const output = JSON.parse(result.stdout.toString());
  expect(output.html).toContain('type="text/javascript"');
  expect(output.html).toContain('data-cfasync="false"');
  expect(output.html).toContain("<main>Lesson</main>");
  expect(output.saved).toEqual(["font-sans", "light"]);
  expect(output.system).toEqual(["font-sans", "dark"]);
  expect(output.clientScriptProps).toEqual({
    "data-cfasync": "false",
    type: "text/plain",
  });
});
