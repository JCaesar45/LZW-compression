      // ── Self-Verification Harness ──
      // Runs the specification's test vectors on load.
      // Results log to console; failures surface in the UI.
      function runSelfTests() {
        var cases = [
          {
            name: 'Test 2/4 — Compress TOBEORNOT',
            run: function () {
              var got = compress('TOBEORNOTTOBEORTOBEORNOT');
              var want = [84, 79, 66, 69, 79, 82, 78, 79, 84, 256, 258, 260, 265, 259, 261, 263];
              return JSON.stringify(got) === JSON.stringify(want);
            }
          },
          {
            name: 'Test 3/5 — Decompress TOBEORNOT',
            run: function () {
              var got = decompress([84, 79, 66, 69, 79, 82, 78, 79, 84, 256, 258, 260, 265, 259, 261, 263]);
              return got === 'TOBEORNOTTOBEORTOBEORNOT';
            }
          },
          {
            name: 'Test 6 — Compress digits',
            run: function () {
              var got = compress('0123456789');
              var want = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
              return JSON.stringify(got) === JSON.stringify(want);
            }
          },
          {
            name: 'Test 7 — Decompress digits',
            run: function () {
              return decompress([48, 49, 50, 51, 52, 53, 54, 55, 56, 57]) === '0123456789';
            }
          },
          {
            name: 'Test 8 — Compress BABAABAAA',
            run: function () {
              var got = compress('BABAABAAA');
              var want = [66, 65, 256, 257, 65, 260];
              return JSON.stringify(got) === JSON.stringify(want);
            }
          },
          {
            name: 'Test 9 — Decompress BABAABAAA',
            run: function () {
              return decompress([66, 65, 256, 257, 65, 260]) === 'BABAABAAA';
            }
          },
          {
            name: 'Round-trip fuzz (1k random strings)',
            run: function () {
              var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
              for (var t = 0; t < 1000; t++) {
                var len = 1 + Math.floor(Math.random() * 200);
                var s = '';
                for (var i = 0; i < len; i++) {
                  s += alphabet[Math.floor(Math.random() * alphabet.length)];
                }
                if (decompress(compress(s)) !== s) return false;
              }
              return true;
            }
          }
        ];

        var passed = 0;
        var failed = [];
        for (var i = 0; i < cases.length; i++) {
          try {
            if (cases[i].run()) {
              passed++;
              console.log('%c✓ ' + cases[i].name, 'color:#50ffa0');
            } else {
              failed.push(cases[i].name);
              console.error('✗ ' + cases[i].name);
            }
          } catch (e) {
            failed.push(cases[i].name + ' — ' + e.message);
            console.error('✗ ' + cases[i].name, e);
          }
        }

        console.log(
          '%cLZW Suite self-tests: ' + passed + '/' + cases.length + ' passed',
          'color:#7850ff;font-weight:bold;font-size:13px'
        );

        return failed.length === 0;
      }

      // Expose the core API for external use, testing, and integration.
      window.LZW = function (mode, input) {
        if (typeof mode !== 'boolean') {
          throw new TypeError('LZW: first argument must be a boolean (true=compress, false=decompress)');
        }
        if (mode) {
          if (typeof input !== 'string') {
            throw new TypeError('LZW: compress mode expects a string');
          }
          return compress(input);
        }
        if (!Array.isArray(input)) {
          throw new TypeError('LZW: decompress mode expects an array of numbers');
        }
        return decompress(input);
      };
