import 'dotenv/config';
import '../util/catchUnhandledRejection';
import elasticsearch from 'elasticsearch';

const SEEDS = {
  '/articles/listArticleTest1': {
    userId: 'user1',
    appId: 'app1',
    replyRequestCount: 2,
    normalArticleReplyCount: 2,
    updatedAt: 1,
    text: `
      憶昔封書與君夜，金鑾殿後欲明天。今夜封書在何處？廬山庵裏曉燈前。籠鳥檻猿俱未死，人間相見是何年？

      微之，微之！此夕此心，君知之乎！
    `,
  },
  '/articles/listArticleTest2': {
    userId: 'user1',
    appId: 'app1',
    replyRequestCount: 1,
    normalArticleReplyCount: 1,
    updatedAt: 2,
    text:
      '臣亮言：先帝創業未半，而中道崩殂。今天下三分，益州 疲弊，此誠危急存亡之秋也。',
  },
  '/articles/listArticleTest3': {
    userId: 'user2',
    appId: 'app1',
    replyRequestCount: 0,
    normalArticleReplyCount: 0,
    updatedAt: 3,
    text:
      '人生幾何，離闊如此！況以膠漆之心，置於胡越之身，進不得相合，退不能相忘，牽攣乖隔，各欲白首。',
  },
  '/articles/listArticleTest4': {
    userId: 'user2',
    appId: 'app1',
    replyRequestCount: 0,
    normalArticleReplyCount: 0,
    updatedAt: 4,
    text: '我好餓 http://gohome.com',
    hyperlinks: [
      {
        url: 'http://gohome.com',
        title: '馮諼很餓',
        summary:
          '居有頃，倚柱彈其劍，歌曰：「長鋏歸來乎！食無魚。」左右以告。孟嘗君曰：「食之，比門下之客。」',
      },
    ],
  },
  '/urls/gohome': {
    url: 'http://gohome.com',
    title: '馮諼很餓',
    summary:
      '居有頃，倚柱彈其劍，歌曰：「長鋏歸來乎！食無魚。」左右以告。孟嘗君曰：「食之，比門下之客。」',
  },
  '/urls/biau': {
    url: 'http://出師表.com',
    title: '出師表',
    summary:
      '臣亮言：先帝創業未半，而中道崩殂。今天下三分，益州 疲弊，此誠危急存亡之秋也。',
  },
};

const client = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_URL,
  log: 'debug',
});

async function loadSeeds(seedMap) {
  const body = [];
  const indexes = new Set();
  Object.keys(seedMap).forEach(key => {
    const [, _index, _id] = key.split('/');
    body.push({ index: { _index, _type: 'doc', _id } });
    body.push(seedMap[key]);
    indexes.add(_index);
  });

  const result = await client.bulk({ body, refresh: 'true' });
  if (result.errors) {
    throw new Error(`Seed load failed : ${JSON.stringify(result, null, '  ')}`);
  }
}

loadSeeds(SEEDS);
