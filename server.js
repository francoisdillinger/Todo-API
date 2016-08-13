var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var newId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res){
    res.send('Todo API Root');
});

app.get('/todos',function(req, res){
    res.json(todos);
})

app.get('/todos/:id',function(req, res){
    var todoId = parseInt(req.params.id);
    var requestedItem = _.findWhere(todos, {id: todoId});
    
    if(requestedItem){
        res.json(requestedItem);
    }else{
        res.status(404).send();
    }
});

app.post('/todos', function(req, res){
    var body = _.pick(req.body, 'description', 'completed');
    var c = _.isBoolean(body.completed);
    var d = _.isString(body.description);
    var dLength = body.description.trim().length === 0;

    if(!c || !d || dLength){
        return res.status(400).send();
    }

    body.description = body.description.trim();
    body.id = newId++;
    todos.push(body);
    res.json(body);
});

app.delete('/todos/:id', function(req,res){
    var todoId = parseInt(req.params.id);
    var requestedItem = _.findWhere(todos, {id: todoId});
    var modifiedTodos = _.without(todos, requestedItem);

    if(requestedItem){
        todos = modifiedTodos;
        res.json(modifiedTodos);
    }else{
        res.status(400).json({"ERROR": "That shit doesn't exist bro. Try a different ID."});
    }

});

app.put('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id);
    var requestedItem = _.findWhere(todos, {id: todoId});
    var body = _.pick(req.body, 'description', 'completed');
    var c = _.isBoolean(body.completed);
    var d = _.isString(body.description);
    var dLength = body.description.trim().length > 0;
    var newAttributes = {};

    if(!requestedItem){
        return res.status(404).send();
    }

    if(body.hasOwnProperty('description') && d && dLength){
        newAttributes.description = body.description;
    }else if(body.hasOwnProperty('description')){
        return res.status(400).send();
    }

    if(body.hasOwnProperty('completed') && c){
        newAttributes.completed = body.completed;
    }else if(body.hasOwnProperty('completed')){
        return res.status(400).send();
    }

    _.extend(requestedItem, newAttributes);
    res.json(requestedItem);
});

app.listen(PORT, function(){
    console.log("Express listening on port: " + PORT);
});