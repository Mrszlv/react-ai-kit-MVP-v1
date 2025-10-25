export async function readOpenAISSE(
  res: Response,
  onDelta: (chunk: string) => void
): Promise<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    for (const line of buffer.split("\n")) {
      if (!line) continue;
      if (line.startsWith("data: ")) {
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") {
          buffer = "";
          break;
        }
        try {
          const json = JSON.parse(payload);
          const delta: string =
            json.choices?.[0]?.delta?.content ??
            json.choices?.[0]?.message?.content ??
            json.choices?.[0]?.text ??
            "";
          if (delta) {
            full += delta;
            onDelta(delta);
          }
        } catch {
          /* ignore malformed chunk */
        }
      }
    }

    buffer = buffer.endsWith("\n") ? "" : buffer.split("\n").at(-1) ?? "";
  }

  return full;
}
