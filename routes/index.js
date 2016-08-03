var express = require('express');
var router = express.Router();

var path = require('path');
var fs = require('fs');
var Handlebars = require('handlebars');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/read', function(req, res, next) {
  if (!req.query.path) {
    return next({
      status: 400,
      message: 'Must specify a path in query'
    });
  }

  parseJSON(req.query.path, function(err, doc) {
    if (err)
      return next(err);
    res.json(doc);
  });
});

router.get('/resume', function(req, res, next) {
  if (!req.query.path) {
    return next({
      status: 400,
      message: 'Must specify a path in query'
    });
  }

  parseJSON(req.query.path, function(err, doc) {
    if (err)
      return next(err);
    render('t1.html', doc, function(err, resume) {
      if (err)
        return next(err);
      res.send(resume);
    });
  });
});

function parseJSON(f, callback) {
  var fp = path.join(__dirname, '..', 'resumes', f);
  fs.readFile(fp, function(err, file) {
    if (err)
      return callback(err);
    var out;
    try {
      out = JSON.parse(file);
    } catch(err) {
      return callback(err)
    }
    return callback(null, out);
  });
}

function render(t, doc, callback) {
  var templatePath = path.join(__dirname, '..', 'templates', t);
  fs.readFile(templatePath, 'utf-8', function(err, temp) {
    if (err)
      return callback(err);

    Handlebars.registerHelper('sk-list', function(items, options) {
      var out = "<div>";
      for (var i = 0; i < items.length; i++) {
        out = out + '<div class="skill"><h5>' + options.fn(items[i])
          + '</h5><svg weight="' + items[i].weight + '"></svg></div>'
      }
      return out + '</div>'
    });

    Handlebars.registerHelper('list', function(items, options) {
      var out = '<div class="block-wrapper">';
      for (var i = 0; i < items.length; i++) {
        out = out + options.fn(items[i]);
      }
      return out + "</div>"
    });

    Handlebars.registerHelper('points', function(items, options) {
      var out = '<ul>';
      for (var i = 0; i < items.length; i++) {
        out = out + '<li>' + items[i] + '</li>';
      }
      return out + "</ul>"
    })

    var template = Handlebars.compile(temp);
    var res = template(doc);
    console.log(res);
    return callback(null, res);
  });
}

module.exports = router;
