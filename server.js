var express = require('express');
var bodyParser = require('body-parser');

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
    var todoId = req.params.id;
    var requestedItem;
    
    todos.forEach(function(todo) {
        if( "" + todo.id === todoId){
            requestedItem = todo;
        }
    });
    
    if(requestedItem){
        res.json(requestedItem);
    }else{
        res.status(404).send();
    }
});

app.post('/todos', function(req, res){
    var body = req.body;
    body.id = newId++;
    todos.push(body);
    console.log('Description: ' + body.description);
    res.json(body);
});

app.listen(PORT, function(){
    console.log("Express listening on port: " + PORT);
});