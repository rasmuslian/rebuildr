"use client";

import React from "react";

const ACTION_HREFS = new Set(["ABORT", "REPORT", "ABOUTREVIEW", "ABOUTPAYOUT"]);

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // matches _em_, [text](<href>), and [text](href)
  const regex = /_([^_]+)_|\[([^\]]*)\]\(<([^>]+)>\)|\[([^\]]*)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined) {
      // _em_ → small secondary text, but recurse to parse links inside
      parts.push(
        <span key={match.index} style={{ fontSize: 12, color: "#888" }}>
          {parseInline(match[1])}
        </span>,
      );
    } else {
      const linkText = match[2] ?? match[4];
      const href = match[3] ?? match[5];
      if (ACTION_HREFS.has(href)) {
        parts.push(
          <span
            key={match.index}
            style={{
              textDecoration: "underline",
              textDecorationColor: "#863CFF",
              color: "#863CFF",
            }}
          >
            {linkText || href}
          </span>,
        );
      } else {
        parts.push(linkText || href);
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

type Props = {
  text: string;
};

export const SystemMessagePreview = ({ text }: Props) => {
  const sections = text.split("\n");

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
      {/* System avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: "#d0d7e3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          color: "#555",
          flexShrink: 0,
          marginBottom: 2,
        }}
      >
        SYS
      </div>

      {/* Bubble */}
      <div
        style={{
          backgroundColor: "#DDE3EE",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderBottomRightRadius: 16,
          borderBottomLeftRadius: 4,
          paddingInline: 16,
          paddingBlock: 10,
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {sections.map((section, i) => {
          if (!section.trim()) return null;

          const isHeading = section.startsWith("# ");
          const content = isHeading ? section.slice(2) : section;

          return (
            <p
              key={i}
              style={{
                margin: 0,
                fontSize: isHeading ? 16 : 12,
                fontWeight: isHeading ? 400 : 400,
                color: "#1a1a1a",
                lineHeight: 1.45,
              }}
            >
              {parseInline(content)}
            </p>
          );
        })}
      </div>
    </div>
  );
};
