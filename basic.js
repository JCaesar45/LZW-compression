function LZW(mode, input) {
  if (mode) {
    // Compression
    const str = input;
    const dictionary = {};
    let dictSize = 256;
    
    // Initialize dictionary with single characters
    for (let i = 0; i < 256; i++) {
      dictionary[String.fromCharCode(i)] = i;
    }
    
    const result = [];
    let w = '';
    
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      const wc = w + c;
      
      if (dictionary.hasOwnProperty(wc)) {
        w = wc;
      } else {
        result.push(dictionary[w]);
        dictionary[wc] = dictSize++;
        w = c;
      }
    }
    
    if (w !== '') {
      result.push(dictionary[w]);
    }
    
    return result;
  } else {
    // Decompression
    const codes = input;
    const dictionary = {};
    let dictSize = 256;
    
    // Initialize dictionary with single characters
    for (let i = 0; i < 256; i++) {
      dictionary[i] = String.fromCharCode(i);
    }
    
    let w = dictionary[codes[0]];
    let result = w;
    
    for (let i = 1; i < codes.length; i++) {
      const k = codes[i];
      let entry;
      
      if (dictionary.hasOwnProperty(k)) {
        entry = dictionary[k];
      } else if (k === dictSize) {
        entry = w + w[0];
      } else {
        throw new Error('Bad compressed k: ' + k);
      }
      
      result += entry;
      dictionary[dictSize++] = w + entry[0];
      w = entry;
    }
    
    return result;
  }
}
