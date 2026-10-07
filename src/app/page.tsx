import { defaultLocale, localeStorageKey, locales } from "@/i18n/config";

const pickLocale = `(function(){var l=${JSON.stringify(locales)},d=${JSON.stringify(defaultLocale)},s;try{s=localStorage.getItem(${JSON.stringify(localeStorageKey)})}catch(e){}if(l.indexOf(s)<0){s=d;var n=navigator.languages||[navigator.language];for(var i=0;i<n.length;i++){var c=(n[i]||"").slice(0,2).toLowerCase();if(l.indexOf(c)>=0){s=c;break}}}location.replace("/"+s)})();`;

export default function RootRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content={`2;url=/${defaultLocale}`} />
      <script dangerouslySetInnerHTML={{ __html: pickLocale }} />
      <p style={{ padding: 24, fontFamily: "sans-serif" }}>
        {locales.map((l) => (
          <a key={l} href={`/${l}`} style={{ marginRight: 12 }}>
            {l.toUpperCase()}
          </a>
        ))}
      </p>
    </>
  );
}
