# LZW Compression Suite

A production-ready, single-page application implementing the Lempel-Ziv-Welch (LZW) lossless data compression algorithm with a luxurious, high-converting interface.

## Overview

The LZW algorithm is a dictionary-based lossless compression technique that builds a translation table dynamically during encoding. Unlike Huffman coding which requires prior frequency analysis, LZW operates in a single pass, making it ideal for streaming applications. The algorithm was patented by Welch in 1984 and became the foundation for GIF image format and the Unix `compress` utility .

This implementation provides both compression and decompression capabilities through an elegant web interface designed to demonstrate the algorithm's mechanics while maintaining production-grade code quality.

## Features

- **Dual-mode operation**: Compress strings to numeric arrays; decompress numeric arrays back to strings
- **Real-time visual feedback**: Animated gradient backgrounds, glassmorphism panels, and micro-interactions
- **Zero dependencies**: Pure HTML, CSS, and JavaScript in a single file
- **Production-ready architecture**: Modular code structure with comprehensive error handling
- **Responsive design**: Adaptive layout for mobile, tablet, and desktop viewports
- **Accessibility**: ARIA labels, keyboard navigation, and semantic HTML

## Architecture

The application follows a three-layer architecture:

1. **Presentation Layer**: HTML structure with semantic elements and ARIA attributes
2. **Styling Layer**: CSS custom properties, flexbox/grid layouts, and keyframe animations
3. **Logic Layer**: LZW codec implementation with clean separation between compression and decompression

## Algorithm Implementation

### Compression

The encoder maintains a dictionary initialized with all single-byte symbols (0-255). It processes the input string character by character, building progressively longer substrings until encountering a sequence not present in the dictionary. At that point, it outputs the code for the previously matched substring and adds the new sequence to the dictionary .

### Decompression

The decoder reconstructs the dictionary on-the-fly, mirroring the encoder's dictionary construction. It handles the special case where a code refers to an entry not yet in the dictionary (the "KwKwK" scenario) by using the previous entry's first character to complete the new entry .

```

### Deployment Configuration

| Environment | Build Command | Output Directory |
|-------------|---------------|------------------|
| Static | None | Root |
| Vercel | None | `.` |
| Netlify | None | `.` |

## Test Cases

| Input | Mode | Expected Output |
|-------|------|-----------------|
| `"TOBEORNOTTOBEORTOBEORNOT"` | Compress | `[84,79,66,69,79,82,78,79,84,256,258,260,265,259,261,263]` |
| `[84,79,66,69,79,82,78,79,84,256,258,260,265,259,261,263]` | Decompress | `"TOBEORNOTTOBEORTOBEORNOT"` |
| `"BABAABAAA"` | Compress | `[66,65,256,257,65,260]` |
| `[66,65,256,257,65,260]` | Decompress | `"BABAABAAA"` |

## Usage

Open `index.html` in any modern browser. No build step required.

```bash
# Optional: serve locally
npx serve .
# or
python -m http.server 8080
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## References

Welch, T. A. (1984). A technique for high-performance data compression. *Computer*, 17(6), 8-19.

Ziv, J., & Lempel, A. (1977). A universal algorithm for sequential data compression. *IEEE Transactions on Information Theory*, 23(3), 337-343.

Ziv, J., & Lempel, A. (1978). Compression of individual sequences via variable-rate coding. *IEEE Transactions on Information Theory*, 24(5), 530-536.

## License

MIT
```
