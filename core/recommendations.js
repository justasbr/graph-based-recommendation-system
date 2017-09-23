let ug = require('ug');
let _ = require('lodash');
let mockDb = require('./db');

let graph = new ug.Graph();

let data = mockDb.loadData();

//Clean up & prepare data
let users = _.uniq(data.map(([user,article]) => user));
let articles = _.uniq(data.map(([user,article]) => article));
let views = data;

//Populate graph
users.forEach(function (user) {
  graph.createNode('user', {'id': user});
});

articles.forEach(function (article) {
  graph.createNode('article', {'id': article});
});

views.forEach(function ([userId,articleId]) {
  let userNode = findNodeById('user', userId);
  let articleNode = findNodeById('article', articleId);
  graph.createEdge('view').link(userNode, articleNode);
});


function findNodeById(entity, id) {
  return graph.nodes(entity).query().filter({'id': parseInt(id)}).first();
}

function getClosest(userId) {
  let user = findNodeById('user', userId);

  if (!user) {
    return {};
  }

  let articlesRead = new Set(
    user.edges
      .map(edge => edge.outputNode)
      .map(node => node.properties)
      .map(prop => prop.id)
  );

  let results = graph.closest(user, {
    compare: function (article) {
      let articleId = article.properties.id;
      return article.entity === 'article' && !articlesRead.has(articleId);
    },
    minDepth: 0,
    count: 10
  });

  let resultNodes = results.map(function (path) {
    let lastNode = path.end();
    return {
      distance: path.distance(),
      id: lastNode.properties.id
    }
  });

  return resultNodes;
}

module.exports = {
  getClosest: getClosest
};