# AEDWebsite2016

## Important note aboue AEDNarratives repo
The narratives for each geographical area (content found in the 'overview' section of the sidebars) are kept in a separate repo and included in this repo as a submodule. To ensure that the narratives are included in this development environment, after cloning this repo, run the following command to pull latest from the [AEDNarratives](https://github.com/AfESG/AEDNarratives) repo:

* `git submodule update --init --recursive`

When making a change to the AEDNarratives repo, pull the latest by running:

* `git submodule update --recursive --remote`

Then push these changes to github:

* `git push origin master`

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

#### Heroku Setup

Currently this site is staged in the `elephantdatabase` project on Heroku. 

The URL for the current staging deployment is [http://elephantdatabase.herokuapp.com](http://elephantdatabase.herokuapp.com).

If you haven't already done so, in order to push to Heroku you will need to install the Heroku CLI and login using that tool. Follow the instructions on how to install the Heroku CLI for your system here: [Install Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).

Once installed, you need to login with your Heroku credentials by running the following command and follow the prompts:

* `heroku login`

In order to push changes to this staging environment you will first need to be given access as a team member to the `africanelephantdatabase` team on Heroku. Next you will need to add the `elephantdatabase` Heroku remote to this repo (which you should have already cloned on your local dev machine), but entering the following command: 

* `heroku git:remote -a elephantdatabase`

Once this is done, you should be able to now push changes to Heroku.

#### How to deploy changes to Heroku:

When you want to push changes to the staging environment on Heroku you just need push this repo to the Heroku git remote, just like you would if pushing changes here to github only you point to the 'remote' repo on Heroku we set up above:

* `git push heroku master`

The changes will be pushed to Heroku and then will automatically compile the project and run `npm start` which will start the Node server and serve the application at [http://elephantdatabase.herokuapp.com](http://elephantdatabase.herokuapp.com).

### Production
There is currently no production environment deployed. In order to deploy to a production environment you must first set the NODE_ENV environment variable on the production environment you intend to deploy to. Set it to the following `NODE_ENV=production`.

When pushing to the production environment, set the deployment up so that it will run `npm run production`, (for example if pushing to Heroku, setup a `Procfile` with the following command `web: npm run production`). This command will build the production assets using webpack and run the Node server using the appropriate `NODE_ENV` variable. 
