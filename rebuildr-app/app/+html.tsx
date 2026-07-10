import { type PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="sv">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, shrink-to-fit=no, viewport-fit=cover"
        />
        {/* Consent Mode defaults - must be before GTM */}
        <script dangerouslySetInnerHTML={{ __html: consentDefaults }} />

        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${process.env.EXPO_PUBLIC_GTM_ID}');`,
          }}
        />

        {/*
          Replaces expo-router's <ScrollViewStyleReset/> (which locks the document
          with body{overflow:hidden}) so the document itself scrolls and the mobile
          browser chrome can collapse. See constants/layout.ts.
        */}
        <style
          id="scroll-reset"
          dangerouslySetInnerHTML={{
            __html: `
html, body { margin: 0; padding: 0; }
body { min-height: 100vh; min-height: 100dvh; overflow-x: hidden; }
#root { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; }
`,
          }}
        />
      </head>

      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${process.env.EXPO_PUBLIC_GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}

const consentDefaults = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  analytics_storage: 'denied',
  wait_for_update: 500
});
`;
