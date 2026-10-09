import express, { Request, Response } from "express";
import { compress, decompress } from "../../core/typescript/lzw";

const app = express();
app.use(express.json({ limit: "2mb" }));

app.post("/api/compress", (req: Request, res: Response) => {
  const { data } = req.body ?? {};
  if (typeof data !== "string") {
    return res.status(400).json({ error: "field 'data' must be a string" });
  }
  const codes = compress(data);
  res.json({ codes, size: codes.length });
});

app.post("/api/decompress", (req: Request, res: Response) => {
  const { codes } = req.body ?? {};
  if (!Array.isArray(codes) || !codes.every(Number.isInteger)) {
    return res.status(400).json({ error: "field 'codes' must be an integer array" });
  }
  try {
    const data = decompress(codes);
    res.json({ data, size: data.length });
  } catch (err) {
    res.status(422).json({ error: (err as Error).message });
  }
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

const PORT = Number(process.env.PORT ?? 8080);
app.listen(PORT, () => console.log(`LZW API listening on :${PORT}`));
