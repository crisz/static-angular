/*!
 * static-angular
 * MIT Licensed
*/
'use strict';

/**
 * Module dependencies
 * @private
 */

const path = require('path');
const fs = require('fs');

/**
 * @param {string | object} [config]
 * @return {function}
 * @public
 */
module.exports = function serveAngular(config) {
  let cfg;
  let angularPath, angularAssetsPath, files, assets;

  /**
   * default config object
   * @private
   */
  let defaultConfig = {
    path: './client/dist',
    assetsFolder: 'assets',
    assetsUrl: '/assets'
  };

  //working directory
  let wkd = path.normalize(path.dirname(require.main.filename));


  //if the type of parameter is a string, assume it is the path
  if (typeof config === 'string')
    cfg = Object.assign(defaultConfig, { path: config });
  else if (typeof config === 'object')
    cfg = Object.assign(defaultConfig, config);
  else if (config === undefined || config === null)
    cfg = defaultConfig;
  else 
    throw new TypeError('Parameter type must be a string or an object, ' + typeof config + ' received');

  if(!cfg.assetsUrl.startsWith('/')) throw new Error('assetsUrl parameter should start with /');


  if(!path.isAbsolute(cfg.path)) {
    angularPath = path.join(wkd, cfg.path);
    angularAssetsPath = path.join(wkd, cfg.path, cfg.assetsFolder);
  } else {
    angularPath = cfg.path;
    angularAssetsPath = path.join(cfg.path, cfg.assetsFolder);
  }
  assets = fs.existsSync(angularAssetsPath) ? fs.readdirSync(angularAssetsPath) : [];
  if(!fs.existsSync(angularPath)) throw new Error('Cannot find folder ' + angularPath);
  
  if(!fs.existsSync(path.join(angularPath, 'index.html')) && 
    fs.existsSync(path.join(angularPath, '..', '.angular-cli.json')))
      angularPath = require(path.join(angularPath, '..', '.angular-cli.json')).outDir;
  
  files = fs.readdirSync(angularPath);

  if(this){
    this.cfg = cfg;
    this.angularPath = angularPath;
  }
  // middleware
  return function serveAngular(req, res, next) {

    if(req.method !== 'GET') return next();

    if(!res.sendFile) {
      res.sendFile = sendFile.bind(res); 
    }

    if (isOutOfContext(req.url)) {
      let err = new Error('Cannot access page');
      err.status = 400;
      return next(err);
    }

    if (toBeEscaped(req.url, cfg.except)) {
      return next();
    }

    //serve assets

    const routeRegexp = ( req.route && req.route.regexp ) || /^\/$/;

    if(
      req.url.endsWith('.jpg')  ||
      req.url.endsWith('.jpeg') ||
      req.url.endsWith('.gif')  ||
      req.url.endsWith('.png')  ||
      req.url.endsWith('.svg')
    ) {
      for(let i=0; i<assets.length; i++) {
        if(path.dirname(req.url) === cfg.assetsUrl && assets[i] === path.basename(req.url)) 
          return res.sendFile(path.join(angularAssetsPath, assets[i]));
      }

      for(let i=0; i<files.length; i++) {
        if(routeRegexp.test(path.dirname(req.url)) && files[i] === path.basename(req.url)) 
          return res.sendFile(path.join(angularPath, files[i]));
      }

      return next(new Error('Image not found').status = 404);
    }

    for(let i=0; i<files.length; i++) {
      if(files[i] === path.basename(req.url)) {
        return res.sendFile(path.join(angularPath, files[i]));
      }
    }

    res.sendFile(path.join(angularPath, 'index.html'));
    }
}

/**
 * Prevent users to get server files 
 * @param {string} url 
 * @param {object} res
 * @private
 */
function isOutOfContext(url){
  if (typeof url !== 'string') {
    throw new TypeError('URL should be a string');
  }

  return url.indexOf('..')>-1;
}

/**
 * Do not serve angular if the path is used for other purposes (e.g. expose API)
 * @private
 */
function toBeEscaped(url, escape) {
  let escapeArray = [];
  if (typeof escape === 'string')
    escapeArray.push(escape);
  if (typeof escape === 'object')
    escapeArray = escape;
  for(let i=0; i<escapeArray.length; i++){
    let pathToBeEscaped = escapeArray[i];
    if (pathToBeEscaped.match(/(\*\.)[a-z]{2,4}$/g)) {
      if(pathToBeEscaped.substring(pathToBeEscaped.lastIndexOf('.')) === url.substring(url.lastIndexOf('.')))
        return true;
    }
    else if (url === pathToBeEscaped || url.startsWith(pathToBeEscaped+'/')) {
      return true;
    }
  }
  return false;
}

function sendFile(filePath) {
  fs.createReadStream(filePath)
    .pipe(this);
}