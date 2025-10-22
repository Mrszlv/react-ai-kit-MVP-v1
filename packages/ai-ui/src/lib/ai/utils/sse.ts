export async function readOpenAISSE(
  res: Response,
  onDelta: (t: string) => void
): Promise<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder("utf-8");
  let buf = "",
    full = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    const parts = buf.split("\n\n");
    buf = parts.pop() || "";

    for (const part of parts) {
      if (!part.startsWith("data:")) continue;
      const payload = part.replace(/^data:\s*/g, "").trim();
      if (payload === "[DONE]") break;

      try {
        const json = JSON.parse(payload);

        const delta =
          json.choices?.[0]?.delta?.content ??
          json.choices?.[0]?.message?.content ??
          "";
        if (delta) {
          onDelta(delta);
          full += delta;
        }
      } catch {
        /* ignore line */
      }
    }
  }
  return full;
}
