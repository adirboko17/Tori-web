// One-time, reviewable conversion of the supplied export to compiled React modules.
// The attached markdown and prompt files are reference data, never executed.
import fs from "node:fs";
import path from "node:path";
import { parse } from "parse5";

const read = (p) => fs.readFileSync(path.join("design-reference", p), "utf8");
const write = (p, content) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
};
const assetPaths = (s) =>
  s
    .replaceAll("../../assets/", "/assets/")
    .replaceAll("../assets/", "/assets/")
    .replace(/(?<!\/)assets\//g, "/assets/")
    .replaceAll("Onboarding.html", "/onboarding")
    .replaceAll("Tori.html", "/");
const attrMap = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  inputmode: "inputMode",
  maxlength: "maxLength",
  minlength: "minLength",
  readonly: "readOnly",
  autoplay: "autoPlay",
  playsinline: "playsInline",
  srcset: "srcSet",
  crossorigin: "crossOrigin",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  "fill-opacity": "fillOpacity",
  "stroke-opacity": "strokeOpacity",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "clip-path": "clipPath",
  "color-interpolation-filters": "colorInterpolationFilters",
};
const booleanAttrs = new Set([
  "checked",
  "selected",
  "disabled",
  "required",
  "multiple",
  "loop",
  "muted",
  "autoplay",
  "playsinline",
  "readonly",
  "autofocus",
  "hidden",
  "open",
  "controls",
]);
const voidTags = new Set([
  "input",
  "img",
  "br",
  "hr",
  "source",
  "wbr",
  "area",
  "embed",
  "link",
  "meta",
  "track",
  "col",
]);
function styleObject(value) {
  const obj = {};
  for (const part of value.split(/;(?![^()]*\))/)) {
    const at = part.indexOf(":");
    if (at < 0) continue;
    const raw = part.slice(0, at).trim();
    const key = raw.startsWith("--")
      ? raw
      : raw
          .replace(/^-webkit-/, "Webkit-")
          .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    obj[key] = assetPaths(part.slice(at + 1).trim());
  }
  return obj;
}
const prop = (n, key) => n.attrs?.find((a) => a.name === key)?.value;
const walk = (n, fn) => {
  fn(n);
  n.childNodes?.forEach((c) => walk(c, fn));
};
function jsx(n, rootRef = false) {
  if (n.nodeName === "#text")
    return n.value.trim() ? `{${JSON.stringify(n.value)}}` : "\n";
  if (!n.tagName || ["script", "style"].includes(n.tagName)) return "";
  let attrs = (n.attrs || [])
    .filter((a) => !/^on[a-z]/i.test(a.name))
    .map((a) => {
      if (a.name === "style")
        return `style={${JSON.stringify(styleObject(a.value))}}`;
      let name = attrMap[a.name] || a.name;
      if (
        name === "value" &&
        ["input", "textarea", "select"].includes(n.tagName)
      )
        name = "defaultValue";
      if (name === "checked") name = "defaultChecked";
      if (booleanAttrs.has(a.name)) return `${name}={${a.value !== "false"}}`;
      return `${name}=${JSON.stringify(assetPaths(a.value))}`;
    });
  if (rootRef) attrs.push("ref={rootRef}");
  if (n.tagName === "video" && !n.attrs.some((a) => a.name === "muted"))
    attrs.push("muted");
  if (n.tagName === "img" && !n.attrs.some((a) => a.name === "alt"))
    attrs.push('alt=""');
  if (n.tagName === "input" && prop(n, "data-act")?.startsWith("on.card"))
    attrs.push("disabled", 'aria-label="שדה תשלום להמחשה בלבד"');
  if (
    n.tagName === "a" &&
    prop(n, "href") === "#" &&
    n.childNodes?.some((x) => x.value?.includes("לממשק הניהול"))
  )
    attrs = attrs.map((a) => (a === 'href="#"' ? 'href="/dashboard"' : a));
  const opening = `<${n.tagName}${attrs.length ? " " + attrs.join(" ") : ""}`;
  return voidTags.has(n.tagName)
    ? `${opening} />`
    : `${opening}>${(n.childNodes || []).map((c) => jsx(c)).join("")}</${n.tagName}>`;
}

fs.cpSync("design-reference/assets", "public/assets", { recursive: true });
const tokenFiles = [
  "fonts",
  "colors",
  "typography",
  "spacing",
  "radii",
  "elevation",
  "motion",
  "base",
];
write(
  "src/styles/design-system.css",
  tokenFiles.map((n) => assetPaths(read(`tokens/${n}.css`))).join("\n") +
    "\n" +
    read("components/tori-components.css"),
);

for (const [input, folder, name, selector] of [
  ["Tori.html", "landing", "Landing", "tori-lp"],
  ["Onboarding.html", "onboarding", "Onboarding", "ob"],
]) {
  const doc = parse(read(input));
  let root;
  const styles = [];
  walk(doc, (n) => {
    if (n.tagName === "style")
      styles.push(n.childNodes.map((x) => x.value).join(""));
    if (prop(n, "class")?.split(" ").includes(selector)) root = n;
  });
  const dir = `src/components/${folder}`;
  const css = assetPaths(styles.join("\n")).replace(
    /body\{margin:0;background:#EEEEEB\}/g,
    "",
  );
  write(`${dir}/${folder}.css`, css);
  if (name === "Landing") {
    const imports = [],
      parts = [];
    const names = new Set();
    root.childNodes.forEach((n, i) => {
      if (!n.tagName || ["style", "script"].includes(n.tagName)) return;
      const slug =
        prop(n, "id") || prop(n, "class")?.split(" ")[0] || `${n.tagName}${i}`;
      let section =
        slug
          .replace(/(^|[-_])(\w)/g, (_, p, c) => c.toUpperCase())
          .replace(/[^A-Za-z0-9]/g, "") + "Section";
      if (names.has(section)) section += i;
      names.add(section);
      write(
        `${dir}/sections/${section}.jsx`,
        `export default function ${section}() { return (${jsx(n)}); }\n`,
      );
      imports.push(`import ${section} from './sections/${section}';`);
      parts.push(`<${section} />`);
    });
    const rootCopy = { ...root, childNodes: [] };
    const tag = jsx(rootCopy, true).replace(
      `</${root.tagName}>`,
      `${parts.join("\n")}</${root.tagName}>`,
    );
    write(
      `${dir}/${name}.jsx`,
      `"use client";\nimport { useEffect, useRef } from 'react';\nimport { initializeLanding } from './interactions';\n${imports.join("\n")}\nexport default function Landing() {\nconst rootRef = useRef(null);\nuseEffect(() => initializeLanding(rootRef.current), []);\nreturn (${tag});\n}\n`,
    );
  } else {
    write(
      `${dir}/${name}.jsx`,
      `"use client";\nimport { useEffect, useRef } from 'react';\nimport { initializeOnboarding } from './interactions';\nexport default function Onboarding() {\nconst rootRef = useRef(null);\nuseEffect(() => initializeOnboarding(rootRef.current), []);\nreturn (${jsx(root, true)});\n}\n`,
    );
  }
  let script = read(name === "Landing" ? "tori-site.js" : "tori-onboarding.js");
  script = script
    .replace(
      /^\(function \(\) \{/,
      `import { createDomScope } from '@/lib/dom-scope';\nexport function initialize${name}(root) {\nconst scope = createDomScope();\nconst setTimeout = scope.timeout;\nconst requestAnimationFrame = scope.frame;\nconst listen = scope.listen;\nconst originalOverflow = document.body.style.overflow;\nscope.cleanup(() => { document.body.style.overflow = originalOverflow; });`,
    )
    .replace(/^const root = .*;\r?\n/m, "")
    .replace(/new IntersectionObserver\(/g, "scope.observe(")
    .replace(/([\w.]+)\.addEventListener\(/g, "listen($1, ")
    .replace(/\}\)\(\);\s*$/, "return () => scope.dispose();\n}\n");
  script = assetPaths(script);
  script += "\n";
  write(`${dir}/interactions.js`, script);
}

const modules = [];
function copyComponents(dir) {
  for (const entry of fs.readdirSync(`design-reference/${dir}`, {
    withFileTypes: true,
  })) {
    const relative = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      copyComponents(relative);
      continue;
    }
    if (!/\.(jsx|js)$/.test(entry.name)) continue;
    let content = read(relative);
    if (entry.name === "Logo.jsx")
      content = content.replace(/const base = .*;/, "const base = () => ''; ");
    write(
      `src/components/ui/${relative.replace(/^components\//, "")}`,
      content,
    );
    if (entry.name.endsWith(".jsx"))
      modules.push(
        `export { ${entry.name.replace(".jsx", "")} } from './${relative.replace(/^components\//, "")}';`,
      );
  }
}
copyComponents("components");
write("src/components/ui/index.js", modules.join("\n"));

for (const file of ["app-shell", "app-customer", "app-business", "app-root"]) {
  let source = read(`ui_kits/tori-app/${file}.jsx`);
  source = source
    .replace(
      /const (\{[^\n]+\}) = window\.ToriDesignSystem_1af9b3;/,
      "import $1 from '../ui';",
    )
    .replace(/const (\{[^\n]+\}) = window;/, "import $1 from './app-shell';")
    .replace(/Object\.assign\(window, (\{[^\n]+\})\);/, "export $1;")
    .replace(
      "(window.TORI_ASSET_BASE || '../..') + '/assets/imagery/'",
      "'/assets/imagery/'",
    );
  if (file === "app-shell") {
    source = source.replace(
      "const DS = window.ToriDesignSystem_1af9b3;",
      "import * as DS from '../ui';",
    );
    source = source
      .replace(
        "style={phoneShell.frame}",
        'className="tori-app-frame" style={phoneShell.frame}',
      )
      .replace(
        "style={phoneShell.screen}",
        'className="tori-app-screen" style={phoneShell.screen}',
      );
  }
  if (file === "app-root") {
    source = source.replace(
      /import \{ PhoneFrame,[^\n]+/,
      "import { PhoneFrame } from './app-shell';\nimport { LoginScreen, HomeScreen, BookScreen, ApptScreen, ProfileScreen, TENANT } from './app-customer';\nimport { BizHomeScreen, BizDayScreen, BizClientsScreen, BizSettingsScreen } from './app-business';",
    );
    source = source
      .replace(
        "function ToriApp()",
        "function ToriApp({ initialRole = 'customer' })",
      )
      .replace(
        "React.useState(false);",
        "React.useState(initialRole === 'business');",
      )
      .replace("React.useState('customer')", "React.useState(initialRole)");
    source = source.replace(
      "window.ToriApp = ToriApp;",
      "export default ToriApp;",
    );
  }
  write(
    `src/components/application/${file}.jsx`,
    `"use client";\nimport React from 'react';\n${source}`,
  );
}
console.log(
  "Converted landing, onboarding, application screens and design-system components.",
);
