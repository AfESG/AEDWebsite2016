if (process.env.NODE_ENV === 'production') {
  const express = require('express');
  const app = express();
  app.use(express.static(`${__dirname}/public`));
  app.get('/*', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
  });
  const port = process.env.PORT || 8080;
  app.listen(port, () => console.log('Express server running at http://localhost:8080'));
} else {
  const webpack = require('webpack');
  const WebpackDevServer = require('webpack-dev-server');
  const config = require('./webpack/webpack.config');
  new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    contentBase: 'public/',
    hot: true,
    historyApiFallback: true,
    stats: {
      assets: false,
      colors: true,
      version: false,
      hash: false,
      timings: false,
      chunks: false,
      chunkModules: false
    }
  }).listen(3000, 'localhost', (err) => {
    if (err) {
      console.log(err);
    }
    console.log('Listening at localhost:3000');
  });
}
