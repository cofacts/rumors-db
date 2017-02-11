module.exports = {
  extends: 'airbnb',
  env: {node: true, browser: false, jest: true},
  rules: {
    'no-underscore-dangle': 'off', // elastic search results uses dangling underscore a lot (like _source)
    'no-param-reassign': 'off', // ctx.body = xxx is how koa2 works.
    'no-restricted-syntax': 'off', // we use for-of along with await.
    'no-console': 'off' // It's seed script! We use no-console a hell lot.
  },
  settings: {
    'import/resolver': {
      'babel-module': {}
    }
  }
}
