import DistanceDB from './DistanceDB';

describe('DistanceDB', () => {
  it('handles empty case', async () => {
    const db = new DistanceDB(0.7, 0.4);

    expect(await db.findDuplication('foo')).toBe(null);
  });

  it('finds exact duplicate', async () => {
    const db = new DistanceDB(0.7, 0.4);
    const str = `
      蔡英文政府下令
      106年2月4日起
      愛滋醫療費用目前由公務預算全額支付，開始服藥二年後之醫療費用，則由健保給付。(外籍人士亦然)
      真正落實~台灣成為愛滋島
    `;

    db.add(str, 'foo');

    expect(await db.findDuplication(str)).toBe('foo');
  });

  it('rejects not similar strings properly', async () => {
    const db = new DistanceDB(0.7, 0.4);
    db.add(
      `
      蔡英文政府下令
      106年2月4日起
      愛滋醫療費用目前由公務預算全額支付，開始服藥二年後之醫療費用，則由健保給付。(外籍人士亦然)
      真正落實~台灣成為愛滋島
    `,
      'foo'
    );

    expect(
      await db.findDuplication(`
      7-11圖片條碼換大熱拿鐵，一支手機一次，家裡有幾支手機就可以換幾杯拿鐵。
      把這個圖片存下來，可以去7-11換一杯大熱拿
      要開圖片給他刷條碼
      2/28前要換掉

      記住！是7-11唷
    `)
    ).toBe(null);
  });
});
