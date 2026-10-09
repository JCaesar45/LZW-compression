from flask import Flask, jsonify, request
from core.python.lzw import compress, decompress

app = Flask(__name__)


@app.post("/api/compress")
def api_compress():
    payload = request.get_json(silent=True) or {}
    data = payload.get("data")
    if not isinstance(data, str):
        return jsonify(error="field 'data' must be a string"), 400

    codes = compress(data)
    return jsonify(codes=codes, size=len(codes))


@app.post("/api/decompress")
def api_decompress():
    payload = request.get_json(silent=True) or {}
    codes = payload.get("codes")
    if not isinstance(codes, list) or not all(isinstance(c, int) for c in codes):
        return jsonify(error="field 'codes' must be an array of integers"), 400

    try:
        data = decompress(codes)
    except ValueError as exc:
        return jsonify(error=str(exc)), 422

    return jsonify(data=data, size=len(data))


@app.get("/api/health")
def health():
    return jsonify(status="ok")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
