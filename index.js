var Metalsmith   = require('metalsmith');
var collections  = require('metalsmith-collections');
var markdown     = require('metalsmith-markdown');
var templates    = require('metalsmith-templates');
var permalinks   = require('metalsmith-permalinks');
var tags         = require('metalsmith-tags');
var gist         = require('metalsmith-gist');
var drafts       = require('metalsmith-drafts');
var pagination   = require('metalsmith-pagination');
var excerpts     = require('metalsmith-excerpts');

var fs           = require('fs');
var Handlebars   = require('handlebars');
var moment       = require('moment');
var baseUrl      = 'http://geekwiki.local';
var logo         = 'assets/gw-logo.png';

Handlebars.registerPartial({
  'header': fs.readFileSync('./templates/partials/header.hbt').toString(),
  'footer': fs.readFileSync('./templates/partials/footer.hbt').toString()
});
Handlebars.registerHelper('baseUrl', function() {
  return baseUrl;
});

Handlebars.registerHelper('logo', function() {
  return logo;
});

Handlebars.registerHelper('dateFormat', function( context ) {
  return moment(context).format("LL");
});
Handlebars.registerHelper('dateGMT', function( context ) {
  context = context === 'new' ? new Date() : context;
  return context.toGMTString();
});

Handlebars.registerHelper('currentPage', function( current, page ) {
  return current === page ? 'current' : '';
});

Handlebars.registerHelper('excerpt', function(contents) {
    if (typeof contents !== 'string') return '';
    var text = contents,
        words = text.split(' ');
    if (words.length >= 100) {
        text = words.slice(0, 100).join(' ') + ' [&hellip;]';
    }
    return new Handlebars.SafeString('<p>' + text + '</p>');
});

Metalsmith(__dirname)
  .use(drafts())
  .use(collections({
      posts: {
          pattern: 'articles/*.md',
          sortBy: 'date',
          reverse: true
      }
  }))
  .use(markdown())
  .use(permalinks({
      pattern: ':title',
      relative: false
  }))
  .use(pagination({
    'collections.posts': {
      perPage: 15,
      template: 'indexWithPagination.hbt',
      first: 'index.html',
      path: ':num/index.html'
    }
  }))
  .use(gist())
  .use(tags({
    handle: 'tags',
    template:'tags.hbt',
    path:'tags',
    sortBy: 'title',
    reverse: true
  }))
  .use(templates('handlebars'))
  .use(excerpts())
  .destination('./build')
  .build(function(err, files) {
    if (err) { throw err; }
  });
