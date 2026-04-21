import React from "react";

function extractText(obj: any): string {
  if (typeof obj === 'string') return obj;
  if (Array.isArray(obj)) return obj.map(item => `• ${extractText(item)}`).join('\n');
  if (typeof obj === 'object' && obj !== null) {
    if (obj.explanation && Object.keys(obj).length === 1) return extractText(obj.explanation);
    return Object.entries(obj).map(([key, value]) => `**${key}:**\n${extractText(value)}`).join('\n\n');
  }
  return String(obj);
}

export function renderText(text: string | undefined | null | any) {
  if (!text) return null;
  
  // Fallback if the LLM backend returned an object instead of a string
  const safeText = typeof text === 'string' ? text : extractText(text);

  const parts = safeText.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    // Handle newlines and remove unnecessary asterisks from bullets
    const lines = part.split("\n");
    return (
      <span key={index}>
        {lines.map((line: string, i: number) => (
          <React.Fragment key={i}>
            {line.replace(/^\s*\*\s+/, "• ").replace(/^\s*-\s+/, "• ")}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </span>
    );
  });
}
