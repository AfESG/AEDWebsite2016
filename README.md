# AED
Frontend scaffold: Webpack, Babel, Stylus (autoprefixer), React, Redux, ESLint

## Narratives
The narratives for each geographical area are kept in a separate repo and included in this repo as a submodule. To ensure that the narratives are included in this development environment, after cloning this repo, run the following command to pull latest from the [AEDNarratives](https://github.com/AfESG/AEDNarratives) repo:

* `git submodule update --init --recursive`

When making a change to the AEDNarratives repo, pull the latest by running:

* `git submodule update --recursive`

## Develop
* `npm install`
* `npm install -g webpack-dev-server`
* `npm start`

## Test
* `npm test`

## Build
* Set `['output']['publicPath']` to your deployment URL in `webpack-production.config.js`
* npm run build

## Build and Demo Production server

`npm run production`
