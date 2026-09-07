"use client";

/** Last-resort boundary; it replaces the whole document, so it ships its own html/body. */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#fbfaf8",
          color: "#1a1f24",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ marginTop: "0.75rem", color: "#5a6570" }}>
            The page couldn&apos;t be displayed. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.7rem 1.4rem",
              borderRadius: "999px",
              border: "none",
              background: "#0e6e73",
              color: "white",
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
