import { compareTwoStrings } from 'string-similarity';
import SimHash from 'simhash';
import readline from 'readline';

const simhash = SimHash();

function sanitize(str) {
  return str.replace(/[\n\r ,.!()~:;"'“”，。！（）～：；「」『』]/g, '');
}

function toBigram(str) {
  const length = str.length;
  return str.split('').reduce((bigram, word, i, arr) => {
    if (i === length - 1) return bigram;
    return bigram.concat(word + arr[i + 1]);
  }, []);
}

function toSimHash(str) {
  const grams = toBigram(sanitize(str));
  return simhash(grams);
}

function hammingDistance(bits1, bits2, maxDist = 10) {
  let dist = 0;
  for (let i = 0; i < bits1.length && dist <= maxDist; i += 1) {
    if (bits1[i] !== bits2[i]) dist += 1;
  }

  return dist;
}

function askSimilarity(doc1, doc2) {
  return new Promise((resolve) => {
    console.log('\n==============================');
    console.log(doc1);
    console.log('------------------------------');
    console.log(doc2);
    console.log('==============================\n');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Are these 2 documents the same? (y/N)', (ans) => {
      if (ans === 'y') resolve(true);
      else resolve(false);
      rl.close();
    });
  });
}

export default class DistanceDB {
  constructor(safeSimilarity, minSimilarity) {
    this._safeSimilarity = safeSimilarity;
    this._minSimiarity = minSimilarity;

    // Overlapping bins, which will apply different hamming distance threshold,
    // as simhash is sensitive to document length.
    // http://www.lanceyan.com/tech/arch/simhash_hamming_distance_similarity.html
    //
    // an entry = {hash: hashed text for index, sanitizedText, text, payload}
    //
    this._shortEntries = []; // < 100 words
    this._shortEntries._minHashDistThres = 8; // bits
    this._mediumEntries = []; // 80 ~ 200 words
    this._mediumEntries._minHashDistThres = 6; // bits
    this._longEntries = []; // 150+ words
    this._longEntries._minHashDistThres = 3; // bits

    this.payloads = []; // all added payloads
  }

  _findDuplicateEntriesAndSimilarities(text, entries) {
    const hash = toSimHash(text);
    const maxDist = entries._minHashDistThres;
    const candidates = entries.filter(
      entry => hammingDistance(entry.hash, hash, maxDist) <= maxDist,
    );

    const sanitizedText = sanitize(text);
    console.log(`${candidates.length} / ${entries.length} entires are being scanned...`);

    return candidates.map(entry => ({
      similarity: compareTwoStrings(sanitizedText, entry.sanitizedText),
      entry,
    })).filter(({ similarity }) => similarity > this._minSimiarity);
  }

  _binsToCheck(sanitizedTextLength) {
    const bins = [];
    if (sanitizedTextLength < 100) bins.push(this._shortEntries);
    if (sanitizedTextLength > 80 && sanitizedTextLength < 200) bins.push(this._mediumEntries);
    if (sanitizedTextLength > 150) bins.push(this._longEntries);
    return bins;
  }

  async findDuplication(text) {
    let bestSimilarity = this._minSimiarity;
    let bestMatchEntry = null;

    this._binsToCheck(sanitize(text).length).forEach((bin) => {
      this._findDuplicateEntriesAndSimilarities(text, bin).forEach(({ entry, similarity }) => {
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatchEntry = entry;
        }
      });
    });

    if (!bestMatchEntry) return null;

    if (bestSimilarity > this._safeSimilarity) return bestMatchEntry.payload;

    return (await askSimilarity(bestMatchEntry.text, text)) ? bestMatchEntry.payload : null;
  }

  add(textToIndex, payload) {
    const sanitizedText = sanitize(textToIndex);

    const entry = {
      text: textToIndex,
      hash: toSimHash(textToIndex),
      sanitizedText,
      payload,
    };

    this._binsToCheck(sanitizedText.length).forEach(bin => bin.push(entry));
    this.payloads.push(payload);
  }
}
