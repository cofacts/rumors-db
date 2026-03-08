import 'dotenv/config';
import '../util/catchUnhandledRejection';
import elasticsearch from '@elastic/elasticsearch';

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_URL,
});

async function clearAllIndices() {
  try {
    // First, get all indices (ES client v8+ may return body directly)
    const raw = await client.cat.indices({ format: 'json' });
    const indices = Array.isArray(raw) ? raw : raw?.body ?? [];
    
    if (!indices || indices.length === 0) {
      console.log('No indices to delete.');
      return;
    }
    
    // Extract index names (exclude system indices starting with .)
    const indexNames = indices
      .map(index => index.index)
      .filter(name => !name.startsWith('.'));
    
    if (indexNames.length === 0) {
      console.log('No user indices to delete.');
      return;
    }
    
    // Delete all indices explicitly
    await client.indices.delete({ index: indexNames });
    console.log(`Deleted ${indexNames.length} indices: ${indexNames.join(', ')}`);
  } catch (error) {
    console.error('Error clearing indices:', error);
    throw error;
  }
}

clearAllIndices();
