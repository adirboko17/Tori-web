/** The real store marks, for every place the site names App Store or Google Play. */

export function AppleLogo({ size = "1em" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

export function GooglePlayLogo({ size = "1em" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g strokeLinejoin="round" strokeWidth="1.4">
        <path d="M3.4 2 13.5 12 3.4 22Z" fill="#4285F4" stroke="#4285F4" />
        <path d="M3.4 2 16.4 9.1 13.5 12Z" fill="#34A853" stroke="#34A853" />
        <path d="M16.4 9.1 21.2 12 16.4 14.9 13.5 12Z" fill="#FBBC04" stroke="#FBBC04" />
        <path d="M3.4 22 13.5 12 16.4 14.9Z" fill="#EA4335" stroke="#EA4335" />
      </g>
    </svg>
  );
}

/** A store name with its mark, kept on one line (with its Hebrew prefix) and bidi-isolated. */
export function Store({ name, prefix }) {
  const apple = name === "apple";
  const mark = (
    <span className="tori-store">
      {prefix}
      <bdi dir="ltr">
        {apple ? <AppleLogo /> : <GooglePlayLogo />}
        {apple ? "App Store" : "Google Play"}
      </bdi>
    </span>
  );
  // a prefixed name continues a sentence, so the line may break before it
  return prefix ? <>{" "}{mark}</> : mark;
}
