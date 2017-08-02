# static-angular
[![Known Vulnerabilities](https://snyk.io/test/github/crisz/static-angular/badge.svg)](https://snyk.io/test/github/crisz/static-angular)
[![NPM Downloads](https://img.shields.io/npm/dw/static-angular.svg)
---

Simple zero-dependences middleware for serving Angular from a [NodeJS](https://nodejs.org/en/) server, keeping all the comforts of [@angular/cli](https://github.com/angular/angular-cli). 

It can be configured in orther to skip some routes and use them for other purposes, in this way a NodeJS server can be used for both serving client and APIs.


## How to install
This module is available through the npm registry. It can be installed using the command:

    npm install static-angular

## How to use

You can use *static-angular* as a middleware, 

### For an existing project

### With ExpressJS / Connect

Open *app.js* file and require *static angular* module

    const angular = require('static-angular');

Configure static-angular as a middleware

    const options = {
      path: 'path/to/angular'
    }
    
    app.use(angular(options));

### With Loopback

Open *server/middleware.json* and add static-angular

    "routes": {
      "static-angular": {
         "params": {
            "path": "$!path/to/angular"
          }
      }
    }

### With vanilla NodeJS

    function createServer(cfg) {
      const _angular = require('static-angular');

      const server = http.createServer(function(req, res) {
        _angular(req, res, function onNext(err) {
          res.statusCode = err ? (err.status || 500) : 404
          res.end(err ? err.message : 'Page not found')
      });

      server.listen(3000);
    });


### From scratch (in 2 minutes)

Install express-generator

    npm install express-generator -g

Run `express my-project`

Install @angular/cli

    npm install @angular/cli -g

Open *app.js* file and require *static angular* module

    const angular = require('static-angular');

Use static-angular as a middleware 

    app.use(angular());

Run `ng new my-project`

Rename *my-project* folder as *client*

Run

    cd client
    npm build
    cd ..
    npm start

## API

### angular(options)

Create new middleware to serve angular project existing in the `options.path` folder. 
If `options` parameter is not provided or it does not not contain a `path` property, it will use `/client/dist` as default.
If `options` is a string, it will used as path.

#### options

Object used to configure your middleware. It accepts following properties:

- `path`: path containing your *@angular/cli* project
- `except`: string or array containing a list of routes to be skipped
- `assetsUrl`: string to specify a different route to serve assets (default: /assets)
- `assetsFolder`: string to specify a different folder in fs to put assets (default {{path}}/assets)

## Examples 

### Serving APIs with express

    const express = require('express');
    const angular = require('static-angular');
    const app = express();

    app.use('/api', (req, res, next) => {
      res.json({message: '/api works'});
    });

    app.use('/user/:name', (req, res, next) => {
      res.json({message: `Your name is ${req.params.name}`});
    });

    const options = {
      except: ['/api', '/user']
    }

    app.use(angular(options));

    app.listen(3000);

#### Test
From browser:
- `http://localhost:3000/` => outputs angular client
- `http://localhost:3000/random_page` => outputs angular client (and triggers client routing, if present)
- `http://localhost:3000/api` => outputs {"message": "/api works"}
- `http://localhost:3000/api/some/thing` => outputs {"message": "/api works"}
- `http://localhost:3000/apis` => outputs angular client
- `http://localhost:3000/user/crisz` => outputs {"message": "Your name is crisz"}
- `http://localhost:3000/users/crisz` => outputs angular client

### Do not serve some file extensions

    const express = require('express');
    const angular = require('static-angular');
    const app = express();

    app.use(express.static('./file.pdf'));

    const options = {
      except: ['/api', '*.pdf']
    }

    app.use(angular(options));

    app.listen(3000);

#### Test
From browser:
- `http://localhost:3000/` => outputs angular client
- `http://localhost:3000/random_page` => outputs angular client (and triggers client routing, if present)
- `http://localhost:3000/file.pdf` => send pdf file
- `http://localhost:3000/other_file.pdf` => outputs "Cannot GET /other_file.pdf"



## License
[MIT](https://github.com/crisz/static-angular/blob/master/LICENSE)
