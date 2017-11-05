# AEDWebsite2016

## Important note aboue AEDNarratives repo
The narratives for each geographical area (content found in the 'overview' section of the sidebars) are kept in a separate repo and included in this repo as a submodule. To ensure that the narratives are included in this development environment, after cloning this repo, run the following command to pull latest from the [AEDNarratives](https://github.com/AfESG/AEDNarratives) repo:

* `git submodule update --init --recursive`

When making a change to the AEDNarratives repo, pull the latest by running:

* `git submodule update --recursive --remote`

## Develop
Frontend scaffold: Webpack, Babel, Stylus (autoprefixer), React, Redux, ESLint

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

## Deploy

### Staging
Currently this site is staged in the `elephantdatabase` project on Heroku. 

The URL for the current staging deployment is [http://elephantdatabase.herokuapp.com](http://elephantdatabase.herokuapp.com).

In order to push changes to this staging environment you will first need to be given access as a team member to the `africanelephantdatabase` team on Heroku. Next you will need to add the `elephantdatabase` Heroku remote to this repo (which you should have already cloned on your local dev machine), but entering the following command: 

* `heroku git:remote -a elephantdatabase`

When you want to push changes to the staging environment on Heroku you just need push this repo to the Heroku git remote (`git push heroku master`). Heroku should then automatically compile the project and run `npm start` which will start the Node server and serve the application.

### Production
There is currently no production environment deployed. In order to deploy to a production environment you must first set the NODE_ENV environment variable on the production environment you intend to deploy to. Set it to the following `NODE_ENV=production`.

When pushing to the production environment, set the deployment up so that it will run `npm run production`, (for example if pushing to Heroku, setup a `Procfile` with the following command `web: npm run production`). This command will build the production assets using webpack and run the Node server using the appropriate `NODE_ENV` variable. 
