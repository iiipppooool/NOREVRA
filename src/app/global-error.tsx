"use client";

/**
 * Last resort: the root layout itself failed, so there are no fonts, no CSS
 * variables and no chrome. Styled inline, deliberately.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-GB">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: "#f2eee6",
          color: "#191816",
          fontFamily: "Helvetica Neue, Arial, sans-serif",
        }}
      >
        <main style={{ padding: "2rem", maxWidth: "36rem" }}>
          <p
            style={{
              fontSize: "0.6875rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#6a655d",
              margin: 0,
            }}
          >
            Norevra
          </p>
          <h1 style={{ fontSize: "2rem", fontWeight: 400, lineHeight: 1.1, margin: "1.5rem 0 0" }}>
            The site failed to load.
          </h1>
          <p style={{ color: "#33302b", lineHeight: 1.7, marginTop: "1.25rem" }}>
            Something went wrong before the page could be built. Please reload; if it persists,
            write to studio@norevra.com.
          </p>
          {error.digest && (
            <p style={{ color: "#6a655d", fontSize: "0.8125rem", marginTop: "1.25rem" }}>
              Reference {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              height: "3rem",
              padding: "0 1.75rem",
              background: "#191816",
              color: "#faf8f4",
              border: 0,
              cursor: "pointer",
              fontSize: "0.8125rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
