process.env.NODE_ENV = 'test';

var should = require('should');
var angular = require('..');
var http = require('http');
var path = require('path');
const fs = require('fs');
var request = require('supertest');
var ctx;
var server;
describe('serve-angular', function () {

  describe('#params', function () {

    beforeEach(function () {
      ctx = {};
    });

    it('should use default path if not received as parameter', function () {
      angular.call(ctx, {a: 1, b: 2 });

      should(ctx.cfg).hasOwnProperty('path');
      should(ctx.cfg.path).be.equal(path.join('client', 'dist'));
    });

    it('should use default path when the parameter is void', function () {
      angular.call(ctx);

      should(ctx.cfg).hasOwnProperty('path');
      should(ctx.cfg.path).be.equal(path.join('client', 'dist'));

    });

  });

  describe('#serving root', function () {

    it('should serve cfg.path folder content when HTTP gets /', function (done) {
      var cfg = {
        path: path.join('client', 'custom')
      };

      server = createServer(cfg);

      request(server)
        .get('/')
        .expect(200, 'custom', done);
    });

    it('should serve cfg.path folder content when HTTP gets / and the path is absolute', function (done) {
      var cfg = {
        path: path.join(__dirname,  'client', 'custom')
      };
      
      server = createServer(cfg);

      request(server)
        .get('/')
        .expect(200, 'custom', done);
    });

    it('should serve /client/dist content when HTTP gets / and no cfg is provided', function (done) {
      let server = createServer();

      request(server)
        .get('/')
        .expect(200, 'test', done);
    });

    it('should serve cfg.path content when HTTP gets any url', function (done) {
      let server = createServer();

      request(server)
        .get('/meaninglessUrlToBeHandledByClient')
        .expect(200, 'test', done);
    });
    
    it('should call next() if the url is contained in cfg.except', function (done) {
      let cfg = {
       except: '/api' 
      };

      let server = createServer(cfg);

      request(server)
        .get('/api')
        .expect(404, 'Page not found', done);
    });

    it('should call next() if the url is contained in cfg.except array', function (done) {
      let cfg = {
        except: ['/a', '/b', '/c', '/d', '/e']
      };

      let server = createServer(cfg);

      request(server)
        .get('/d')
        .expect(404, 'Page not found', done);
    });

    it('should not call next() if the url starts with a cfg.except element', function (done) {
      let cfg = {
        except: ['/api', '/user']
      };

      let server = createServer(cfg);

      request(server)
        .get('/users')
        .expect(200, 'test', done);
    });

    it('should call next() if the url is a child of a cfg.except element', function (done) {
      let cfg = {
        except: ['/api', '/user']
      };

      let server = createServer(cfg);

      request(server)
        .get('/user/jack')
        .expect(404, 'Page not found', done);
    });

    
  });

  describe('#serving assets', function () {

    it('should serve cfg.assetsFolder inside cfg.path when the url ends with a image format', function (done) {
      var cfg = {
        assetsFolder: 'images',
        assetsUrl: '/img'
      };
      
      let server = createServer(cfg);
      var img = fs.readFileSync(path.join('test', 'client', 'dist', 'images', 'stub-image.gif'));
      request(server)
        .get('/img/stub-image.gif')
        .expect(200, '*probably a cat*', done);
    });

    it('should throw an error when the image doesn\'t exist', function (done) {
      let server = createServer();

      request(server)
        .get('/assets/imageNotExist.png')
        .expect(500, '', done);
    });
  });
});

function createServer(cfg) {
  var _angular = require('..')(cfg);
  var server = http.createServer(function(req, res) {
    _angular(req, res, function onNext(err) {
      res.statusCode = err ? (err.status || 500) : 404
      res.end(err ? err.message : 'Page not found')
    });
  });

  return server;
}