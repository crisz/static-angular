# static-angular
[![Known Vulnerabilities](https://snyk.io/test/github/crisz/static-angular/badge.svg)](https://snyk.io/test/github/crisz/static-angular)

static-angualr is a simple middleware which allows your NodeJS API server to get along with angular, keeping all the comforts of @angular/cli. 

## how to install
Installing static-angular package is as easy as typing
    npm install static-angular

## how to use
### for an existing project

### with ExpressJS

Open *app.js* file and require *static angular* module

    const angular = require('static-angular');

Configure static-angular as a middleware

    const options = {
      path: 'path/to/angular'
    }
    
    app.use(angular(options));

### with Loopback

Open *server/middleware.json* and add static-angular

    "routes": {
      "static-angular": {
         "params": {
            "path": "$!path/to/angular"
          }
      }
    }

### from scratch

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

## Set route exceptions

If you are using NodeJS to expose some API endpoints, you can tell static-angular to do not serve angular in that route

    const options = {
      except: '/api'
    }
or    

    const options = {
      except: ['/api', '/users']
    }


## Other options