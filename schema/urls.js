export default {
  properties: {
    url: { type: 'keyword' }, // exact URL found in the articles
    canonical: { type: 'keyword' }, // The canonical URL fetched from the page
    title: { type: 'text', analyzer: 'cjk' },
    summary: { type: 'text', analyzer: 'cjk' }, // Extracted summary text
    html: { type: 'keyword', index: false, doc_values: false }, // Fetched raw html input.
    // We disables html's indexing and doc_values because html would be super long and cause
    // "DocValuesField is too large" error when indexed or sorted.

    topImageUrl: { type: 'keyword' }, // Image URL for preview

    fetchedAt: { type: 'date' },
  },
};
