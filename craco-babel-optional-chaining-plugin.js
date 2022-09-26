// craco babel config ovveride for use @babel/plugin-proposal-optional-chaining
// info: https://babeljs.io/docs/en/babel-plugin-proposal-optional-chaining

module.exports = {
  overrideCracoConfig: ({ cracoConfig }) => {
    cracoConfig.babel.plugins.push([
      '@babel/plugin-proposal-optional-chaining',
    ]);

    return cracoConfig;
  },
};
