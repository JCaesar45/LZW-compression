<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LZW Compression Suite — Lossless Data Compression</title>
    <style>
      /* ── Design Tokens ── */
      :root {
        --bg-primary: #0a0a0f;
        --bg-secondary: #12121a;
        --surface: rgba(255, 255, 255, 0.03);
        --surface-hover: rgba(255, 255, 255, 0.06);
        --border: rgba(255, 255, 255, 0.08);
        --border-focus: rgba(120, 80, 255, 0.5);
        --text-primary: #f0f0f5;
        --text-secondary: #8888a0;
        --text-tertiary: #55556a;
        --accent-primary: #7850ff;
        --accent-secondary: #ff50a0;
        --accent-gradient: linear-gradient(135deg, #7850ff 0%, #ff50a0 100%);
        --success: #50ffa0;
        --error: #ff5050;
        --radius-sm: 8px;
        --radius-md: 12px;
        --radius-lg: 20px;
        --radius-xl: 28px;
        --shadow-glow: 0 0 40px rgba(120, 80, 255, 0.15);
        --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.4);
        --font-mono: "SF Mono", "Fira Code", "JetBrains Mono", monospace;
        --font-sans:
          -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
        --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
        --transition-smooth: 300ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* ── Reset ── */
      *,
      *::before,
      *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      body {
        font-family: var(--font-sans);
        background: var(--bg-primary);
        color: var(--text-primary);
        min-height: 100vh;
        overflow-x: hidden;
        line-height: 1.6;
      }

      /* ── Ambient Background ── */
      .ambient {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .ambient__orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.4;
        animation: float 20s ease-in-out infinite;
      }

      .ambient__orb--1 {
        width: 500px;
        height: 500px;
        background: radial-gradient(
          circle,
          rgba(120, 80, 255, 0.3),
          transparent 70%
        );
        top: -15%;
        left: -10%;
        animation-delay: 0s;
      }

      .ambient__orb--2 {
        width: 400px;
        height: 400px;
        background: radial-gradient(
          circle,
          rgba(255, 80, 160, 0.25),
          transparent 70%
        );
        bottom: -10%;
        right: -5%;
        animation-delay: -7s;
      }

      .ambient__orb--3 {
        width: 350px;
        height: 350px;
        background: radial-gradient(
          circle,
          rgba(80, 255, 160, 0.15),
          transparent 70%
        );
        top: 40%;
        left: 50%;
        animation-delay: -14s;
      }

      @keyframes float {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        25% {
          transform: translate(30px, -40px) scale(1.05);
        }
        50% {
          transform: translate(-20px, 20px) scale(0.95);
        }
        75% {
          transform: translate(40px, 30px) scale(1.02);
        }
      }

      /* ── Grid Overlay ── */
      .grid-overlay {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        background-size: 60px 60px;
        mask-image: radial-gradient(
          ellipse at center,
          black 30%,
          transparent 70%
        );
        -webkit-mask-image: radial-gradient(
          ellipse at center,
          black 30%,
          transparent 70%
        );
      }

      /* ── Layout ── */
      .container {
        position: relative;
        z-index: 1;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      /* ── Header ── */
      .header {
        padding: 48px 0 32px;
        text-align: center;
      }

      .header__badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 16px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 100px;
        font-size: 0.75rem;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-secondary);
        margin-bottom: 24px;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      .header__badge-dot {
        width: 6px;
        height: 6px;
        background: var(--success);
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.5;
          transform: scale(0.8);
        }
      }

      .header__title {
        font-size: clamp(2.5rem, 6vw, 4rem);
        font-weight: 700;
        letter-spacing: -0.03em;
        line-height: 1.1;
        background: var(--accent-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 16px;
      }

      .header__subtitle {
        font-size: 1.1rem;
        color: var(--text-secondary);
        max-width: 560px;
        margin: 0 auto;
        line-height: 1.7;
      }

      /* ── Main ── */
      .main {
        flex: 1;
        padding-bottom: 48px;
      }

      /* ── Card ── */
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl);
        padding: 32px;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow: var(--shadow-card);
        transition: border-color var(--transition-smooth);
      }

      .card:focus-within {
        border-color: var(--border-focus);
        box-shadow: var(--shadow-card), var(--shadow-glow);
      }

      /* ── Mode Toggle ── */
      .mode-toggle {
        display: flex;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: 4px;
        margin-bottom: 28px;
        position: relative;
      }

      .mode-toggle__option {
        flex: 1;
        padding: 12px 24px;
        text-align: center;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-secondary);
        background: transparent;
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all var(--transition-fast);
        position: relative;
        z-index: 1;
        font-family: var(--font-sans);
      }

      .mode-toggle__option:hover {
        color: var(--text-primary);
      }

      .mode-toggle__option--active {
        color: var(--text-primary);
        background: var(--surface-hover);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      /* ── Input Group ── */
      .input-group {
        margin-bottom: 24px;
      }

      .input-group__label {
        display: block;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--text-tertiary);
        margin-bottom: 10px;
      }

      .input-group__field {
        width: 100%;
        padding: 16px 20px;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-family: var(--font-mono);
        font-size: 0.95rem;
        line-height: 1.6;
        resize: vertical;
        min-height: 120px;
        transition:
          border-color var(--transition-fast),
          box-shadow var(--transition-fast);
        outline: none;
      }

      .input-group__field::placeholder {
        color: var(--text-tertiary);
      }

      .input-group__field:focus {
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px rgba(120, 80, 255, 0.15);
      }

      .input-group__hint {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
        font-size: 0.8rem;
        color: var(--text-tertiary);
      }

      /* ── Actions ── */
      .actions {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 28px;
        border-radius: var(--radius-md);
        font-size: 0.9rem;
        font-weight: 600;
        font-family: var(--font-sans);
        cursor: pointer;
        transition: all var(--transition-fast);
        border: none;
        outline: none;
        position: relative;
        overflow: hidden;
      }

      .btn:focus-visible {
        box-shadow: 0 0 0 3px rgba(120, 80, 255, 0.4);
      }

      .btn--primary {
        flex: 1;
        background: var(--accent-gradient);
        color: white;
      }

      .btn--primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(120, 80, 255, 0.35);
      }

      .btn--primary:active {
        transform: translateY(0);
      }

      .btn--secondary {
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text-secondary);
      }

      .btn--secondary:hover {
        background: var(--surface-hover);
        color: var(--text-primary);
        border-color: rgba(255, 255, 255, 0.15);
      }

      .btn__icon {
        width: 18px;
        height: 18px;
        transition: transform var(--transition-fast);
      }

      .btn:hover .btn__icon {
        transform: translateX(2px);
      }

      /* ── Output ── */
      .output {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: 20px;
        min-height: 80px;
        font-family: var(--font-mono);
        font-size: 0.95rem;
        line-height: 1.7;
        word-break: break-all;
        transition: all var(--transition-smooth);
      }

      .output--empty {
        color: var(--text-tertiary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-style: italic;
        font-family: var(--font-sans);
        font-size: 0.9rem;
      }

      .output--success {
        border-color: rgba(80, 255, 160, 0.3);
      }

      .output--error {
        border-color: rgba(255, 80, 80, 0.3);
        color: var(--error);
      }

      /* ── Stats ── */
      .stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-top: 24px;
      }

      .stat {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: 16px;
        text-align: center;
      }

      .stat__value {
        font-size: 1.5rem;
        font-weight: 700;
        font-family: var(--font-mono);
        color: var(--text-primary);
        line-height: 1.2;
      }

      .stat__label {
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-tertiary);
        margin-top: 4px;
      }

      /* ── Footer ── */
      .footer {
        padding: 32px 0;
        text-align: center;
        border-top: 1px solid var(--border);
      }

      .footer__text {
        font-size: 0.8rem;
        color: var(--text-tertiary);
      }

      .footer__link {
        color: var(--accent-primary);
        text-decoration: none;
        transition: color var(--transition-fast);
      }

      .footer__link:hover {
        color: var(--accent-secondary);
      }

      /* ── Responsive ── */
      @media (max-width: 640px) {
        .container {
          padding: 0 16px;
        }
        .card {
          padding: 20px;
          border-radius: var(--radius-lg);
        }
        .stats {
          grid-template-columns: 1fr;
        }
        .actions {
          flex-direction: column;
        }
        .header {
          padding: 32px 0 24px;
        }
      }

      /* ── Reduced Motion ── */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="ambient" aria-hidden="true">
      <div class="ambient__orb ambient__orb--1"></div>
      <div class="ambient__orb ambient__orb--2"></div>
      <div class="ambient__orb ambient__orb--3"></div>
    </div>
    <div class="grid-overlay" aria-hidden="true"></div>

    <div class="container">
      <header class="header">
        <div class="header__badge">
          <span class="header__badge-dot"></span>
          Lossless Compression
        </div>
        <h1 class="header__title">LZW Suite</h1>
        <p class="header__subtitle">
          Dictionary-based compression at the speed of thought. Encode strings
          into numeric codes, decode them back without a single bit lost.
        </p>
      </header>

      <main class="main">
        <div class="card">
          <div class="mode-toggle" role="tablist" aria-label="Operation mode">
            <button
              class="mode-toggle__option mode-toggle__option--active"
              id="mode-compress"
              role="tab"
              aria-selected="true"
              aria-controls="input-panel"
              data-mode="compress"
            >
              Compress
            </button>
            <button
              class="mode-toggle__option"
              id="mode-decompress"
              role="tab"
              aria-selected="false"
              aria-controls="input-panel"
              data-mode="decompress"
            >
              Decompress
            </button>
          </div>

          <div id="input-panel" role="tabpanel" aria-labelledby="mode-compress">
            <div class="input-group">
              <label class="input-group__label" for="input-field">Input</label>
              <textarea
                class="input-group__field"
                id="input-field"
                placeholder="Enter text to compress…"
                spellcheck="false"
                aria-describedby="input-hint"
              ></textarea>
              <div class="input-group__hint" id="input-hint">
                <span id="input-format">Plain text string</span>
                <span id="input-count">0 characters</span>
              </div>
            </div>
          </div>

          <div class="actions">
            <button class="btn btn--primary" id="btn-process">
              <svg
                class="btn__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span id="btn-label">Compress</span>
            </button>
            <button class="btn btn--secondary" id="btn-clear">
              <svg
                class="btn__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Clear
            </button>
          </div>

          <div class="input-group">
            <label class="input-group__label" for="output-field">Output</label>
            <div
              class="output output--empty"
              id="output-field"
              role="status"
              aria-live="polite"
            >
              Result will appear here
            </div>
          </div>

          <div class="stats" id="stats-panel" hidden>
            <div class="stat">
              <div class="stat__value" id="stat-input-size">0</div>
              <div class="stat__label">Input Size</div>
            </div>
            <div class="stat">
              <div class="stat__value" id="stat-output-size">0</div>
              <div class="stat__label">Output Size</div>
            </div>
            <div class="stat">
              <div class="stat__value" id="stat-ratio">—</div>
              <div class="stat__label">Ratio</div>
            </div>
          </div>
        </div>
      </main>

      <footer class="footer">
        <p class="footer__text">
          LZW algorithm implementation • Based on Welch, T. A. (1984). A
          technique for high-performance data compression.
          <a
            class="footer__link"
            href="https://doi.org/10.1109/MC.1984.1659158"
            target="_blank"
            rel="noopener noreferrer"
          >
            Computer, 17(6), 8-19
          </a>
          .
        </p>
      </footer>
    </div>

    <script>
      (function () {
        "use strict";

        // ── DOM References ──
        const modeCompress = document.getElementById("mode-compress");
        const modeDecompress = document.getElementById("mode-decompress");
        const inputField = document.getElementById("input-field");
        const inputFormat = document.getElementById("input-format");
        const inputCount = document.getElementById("input-count");
        const btnProcess = document.getElementById("btn-process");
        const btnLabel = document.getElementById("btn-label");
        const btnClear = document.getElementById("btn-clear");
        const outputField = document.getElementById("output-field");
        const statsPanel = document.getElementById("stats-panel");
        const statInputSize = document.getElementById("stat-input-size");
        const statOutputSize = document.getElementById("stat-output-size");
        const statRatio = document.getElementById("stat-ratio");

        let currentMode = "compress";

        // ── LZW Core ──
        function compress(input) {
          var dictionary = {};
          var dictSize = 256;
          var result = [];
          var w = "";
          var i, c, wc;

          for (i = 0; i < 256; i++) {
            dictionary[String.fromCharCode(i)] = i;
          }

          for (i = 0; i < input.length; i++) {
            c = input[i];
            wc = w + c;
            if (dictionary.hasOwnProperty(wc)) {
              w = wc;
            } else {
              result.push(dictionary[w]);
              dictionary[wc] = dictSize++;
              w = c;
            }
          }

          if (w !== "") {
            result.push(dictionary[w]);
          }

          return result;
        }

        function decompress(codes) {
          var dictionary = {};
          var dictSize = 256;
          var i, k, entry, w, result;

          for (i = 0; i < 256; i++) {
            dictionary[i] = String.fromCharCode(i);
          }

          if (codes.length === 0) return "";

          w = dictionary[codes[0]];
          result = w;

          for (i = 1; i < codes.length; i++) {
            k = codes[i];

            if (dictionary.hasOwnProperty(k)) {
              entry = dictionary[k];
            } else if (k === dictSize) {
              entry = w + w[0];
            } else {
              throw new Error("Invalid compressed code: " + k);
            }

            result += entry;
            dictionary[dictSize++] = w + entry[0];
            w = entry;
          }

          return result;
        }

        // ── Input Parsing ──
        function parseInput(raw) {
          if (currentMode === "compress") {
            return raw;
          }

          var trimmed = raw.trim();
          if (trimmed === "") return [];

          try {
            var parsed = JSON.parse(trimmed);
            if (!Array.isArray(parsed)) {
              throw new Error("Input must be a JSON array");
            }
            for (var i = 0; i < parsed.length; i++) {
              if (
                typeof parsed[i] !== "number" ||
                !Number.isInteger(parsed[i]) ||
                parsed[i] < 0
              ) {
                throw new Error("Array must contain non-negative integers");
              }
            }
            return parsed;
          } catch (e) {
            throw new Error(
              "Invalid array format. Expected JSON like: [84, 79, 66]"
            );
          }
        }

        // ── UI Helpers ──
        function setOutput(text, state) {
          outputField.textContent = text;
          outputField.className = "output" + (state ? " output--" + state : "");
        }

        function setError(message) {
          setOutput(message, "error");
          statsPanel.hidden = true;
        }

        function setSuccess(text) {
          setOutput(text, "success");
        }

        function updateStats(inputSize, outputSize) {
          statInputSize.textContent = inputSize.toLocaleString();
          statOutputSize.textContent = outputSize.toLocaleString();

          if (inputSize > 0 && outputSize > 0) {
            var ratio = (outputSize / inputSize).toFixed(3);
            statRatio.textContent = ratio + "×";
          } else {
            statRatio.textContent = "—";
          }

          statsPanel.hidden = false;
        }

        function clearOutput() {
          setOutput("Result will appear here", "empty");
          statsPanel.hidden = true;
        }

        function updateInputMeta() {
          var value = inputField.value;

          if (currentMode === "compress") {
            inputFormat.textContent = "Plain text string";
            inputCount.textContent = value.length + " characters";
          } else {
            inputFormat.textContent = "JSON array of integers";
            var trimmed = value.trim();
            if (trimmed === "") {
              inputCount.textContent = "0 elements";
            } else {
              try {
                var arr = JSON.parse(trimmed);
                if (Array.isArray(arr)) {
                  inputCount.textContent = arr.length + " elements";
                } else {
                  inputCount.textContent = "not an array";
                }
              } catch (e) {
                inputCount.textContent = "invalid JSON";
              }
            }
          }
        }

        // ── Mode Switching ──
        function setMode(mode) {
          currentMode = mode;

          if (mode === "compress") {
            modeCompress.classList.add("mode-toggle__option--active");
            modeDecompress.classList.remove("mode-toggle__option--active");
            modeCompress.setAttribute("aria-selected", "true");
            modeDecompress.setAttribute("aria-selected", "false");
            btnLabel.textContent = "Compress";
            inputField.placeholder = "Enter text to compress…";
          } else {
            modeDecompress.classList.add("mode-toggle__option--active");
            modeCompress.classList.remove("mode-toggle__option--active");
            modeDecompress.setAttribute("aria-selected", "true");
            modeCompress.setAttribute("aria-selected", "false");
            btnLabel.textContent = "Decompress";
            inputField.placeholder = "Enter JSON array like [84, 79, 66, 69]…";
          }

          updateInputMeta();
          clearOutput();
        }

        // ── Main Process ──
        function process() {
          var raw = inputField.value;

          if (raw.trim() === "") {
            setError("Please enter some input to process.");
            return;
          }

          try {
            if (currentMode === "compress") {
              var codes = compress(raw);
              var output = JSON.stringify(codes);
              setSuccess(output);
              updateStats(raw.length, codes.length);
            } else {
              var parsed = parseInput(raw);
              var text = decompress(parsed);
              setSuccess(text);
              updateStats(parsed.length, text.length);
            }
          } catch (err) {
            setError(err.message);
          }
        }

        // ── Event Listeners ──
        modeCompress.addEventListener("click", function () {
          setMode("compress");
        });
        modeDecompress.addEventListener("click", function () {
          setMode("decompress");
        });

        btnProcess.addEventListener("click", process);

        btnClear.addEventListener("click", function () {
          inputField.value = "";
          clearOutput();
          updateInputMeta();
          inputField.focus();
        });

        inputField.addEventListener("input", updateInputMeta);

        inputField.addEventListener("keydown", function (e) {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            process();
          }
        });

        // ── Init ──
        updateInputMeta();
      })();
    </script>
  </body>
</html>
