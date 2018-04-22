export default {
  properties: {
    url: { type: 'keyword' }, // exact URL found in the articles
    canonical: { type: 'keyword' }, // The canonical URL fetched from the page
    title: { type: 'text', analyzer: 'cjk' },
    summary: { type: 'text', analyzer: 'cjk' }, // Extracted summary text
    html: { type: 'keyword' }, // Fetched raw html input
    topImageUrl: { type: 'keyword' }, // Image URL for preview

    fetchedAt: { type: 'date' },
  },
};
