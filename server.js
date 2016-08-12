var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
    id: 1,
    description: 'Meet mom for lunch.',
    completed: false
}, {
    id: 2,
    description: 'Do coding.',
    completed: false
}, {
    id: 3,
    description: 'Open PostMan',
    completed: true
}];

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
})

app.listen(PORT, function(){
    console.log("Express listening on port: " + PORT);
});