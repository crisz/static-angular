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

Open *server/server.js* 