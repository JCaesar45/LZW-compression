import { useMemo, useState } from "react";
import { compress, decompress, Codes } from "../../core/typescript/lzw";

type Mode = "compress" | "decompress";

export function Compressor() {
  const [mode, setMode] = useState<Mode>("compress");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (!input || !output) return null;
    if (mode === "compress") {
      const parsed: Codes = JSON.parse(output);
      return { in: input.length, out: parsed.length };
    }
    const parsed: Codes = JSON.parse(input);
    return { in: parsed.length, out: output.length };
  }, [input, output, mode]);

  const run = () => {
    setError(null);
    try {
      if (mode === "compress") {
        setOutput(JSON.stringify(compress(input)));
      } else {
        const codes: Codes = JSON.parse(input);
        setOutput(decompress(codes));
      }
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  return (
    <section className="card">
      <div className="mode-toggle">
        <button
          className={mode === "compress" ? "active" : ""}
          onClick={() => setMode("compress")}
        >Compress</button>
        <button
          className={mode === "decompress" ? "active" : ""}
          onClick={() => setMode("decompress")}
        >Decompress</button>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "compress"
          ? "Enter text to compress…"
          : "Enter JSON array like [84, 79, 66]…"}
      />

      <button onClick={run}>Run</button>

      {error && <div className="error">{error}</div>}
      {output && <pre className="output">{output}</pre>}

      {stats && (
        <dl className="stats">
          <div><dt>Input</dt><dd>{stats.in}</dd></div>
          <div><dt>Output</dt><dd>{stats.out}</dd></div>
          <div><dt>Ratio</dt><dd>{(stats.out / stats.in).toFixed(3)}×</dd></div>
        </dl>
      )}
    </section>
  );
}
