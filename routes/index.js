const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');

router.get('/', function(req, res, next) {
  res.redirect('/resume');
});

router.get('/read', function(req, res, next) {
  if (!req.query.path) {
    return next({
      status: 400,
      message: 'Must specify a path in query',
    });
  }

  parseJSON(req.query.path, function(err, doc) {
    if (err) return next(err);
    res.json(doc);
  });
});

router.get('/resume', function(req, res, next) {
  if (!req.query.path) {
    req.query.path = 'jx.json';
  }

  parseJSON(req.query.path, function(err, doc) {
    if (err) return next(err);
    render('t1.html', doc, function(err, resume) {
      if (err) return next(err);
      res.send(resume);
    });
  });
});

function parseJSON(f, callback) {
  const fp = path.join(__dirname, '..', 'resumes', f);
  fs.readFile(fp, function(err, file) {
    if (err) return callback(err);
    try {
      const out = JSON.parse(file);
      return callback(null, out);
    } catch (err) {
      return callback(err);
    }
  });
}

function render(t, doc, callback) {
  const templatePath = path.join(__dirname, '..', 'templates', t);
  fs.readFile(templatePath, 'utf-8', function(err, temp) {
    if (err) return callback(err);

    Handlebars.registerHelper('sk-list', function(items, options) {
      let out = '<div>';
      for (let i = 0; i < items.length; i++) {
        out =
          out +
          '<div class="skill"><h5>' +
          options.fn(items[i]) +
          '</h5><svg weight="' +
          items[i].weight +
          '"></svg></div>';
      }
      return out + '</div>';
    });

    Handlebars.registerHelper('list', function(items, options) {
      let out = '<div class="block-wrapper">';
      for (let i = 0; i < items.length; i++) {
        out = out + options.fn(items[i]);
      }
      return out + '</div>';
    });

    Handlebars.registerHelper('points', function(items, options) {
      let out = '<ul>';
      for (let i = 0; i < items.length; i++) {
        out = out + '<li>' + items[i] + '</li>';
      }
      return out + '</ul>';
    });

    Handlebars.registerHelper('courses', function(items, options) {
      let out = '<div><ul>';
      for (let i = 0; i < items.length; i++) {
        out = out + `<li>${items[i].number} - ${items[i].name}</li>`;
        if (items.length > 1 && i >= items.length / 2 - 1 && i < items.length / 2) {
          out = out + '</ul></div><div><ul>';
        }
      }
      return out + '</ul></div>';
    });

    const template = Handlebars.compile(temp);
    const res = template(doc);
    return callback(null, res);
  });
}

module.exports = router;

