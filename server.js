var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var newId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res){
    res.send('Todo API Root');
});

app.get('/todos',function(req, res){
    var query = req.query;
    var qTrue = query.hasOwnProperty('completed') && query.completed === 'true';
    var qFalse = query.hasOwnProperty('completed') && query.completed === 'false';
    // var qBoolean = query.hasOwnProperty('completed');
    var qDescription = query.hasOwnProperty('q') && query.q.length > 0;
    var where = {};

    if(qTrue){
        where.completed = true;
    }else if(qFalse){
        where.completed = false;
    }

    if(qDescription){
        where.description = {$like : '%' + req.query.q + '%'};
    }

    db.todo.findAll({where: where}).then(function(todos){
        if(todos.length > 0){
            res.json(todos);
        }else{
            res.json('Nothing matches that request.');
        }
    }).catch(function(e){
        res.status(400).send();
    })
    // if(qBoolean || qDescription){
    //     if(qBoolean){
    //         where.completed = req.query.completed;
    //     }
    //     if(qDescription){
    //         where.description = {$like : '%' + req.query.q + '%'};
    //     }
    // }
    // console.log(where);
    // console.log(query);

    // db.todo.findAll(where).then(function(todo){
    //     if(!!todo){
    //         res.json(todo.toJSON());
    //     }else{
    //         res.json('Nothing matches that request.');
    //     }
    // }).catch(function(e){
    //     res.status(400).send();
    // })

    // var filteredTodos = todos;
    // var body = req.body;
    // var qProp = query.hasOwnProperty('completed');

    // // console.log(queryParams);
    // if(qProp && queryParams.completed === 'true'){
    //     filteredTodos = _.where(filteredTodos, {completed: true});
    // }else if(qProp && queryParams.completed === 'false'){
    //     filteredTodos = _.where(filteredTodos, {completed: false});
    // }

    // if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0){
    //     filteredTodos = _.filter(filteredTodos, function(todo){
    //         return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
    //     });
    // }
    // res.json(filteredTodos);
})

app.get('/todos/:id',function(req, res){
    var todoId = parseInt(req.params.id);

    db.todo.findById(todoId).then(function(todo){
        if(!!todo){
            res.json(todo.toJSON());
        }else{
            res.json("No match found.");
        }
    }).catch(function(e){
        res.status(500).send();
    });
    // var requestedItem = _.findWhere(todos, {id: todoId});
    
    // if(requestedItem){
    //     res.json(requestedItem);
    // }else{
    //     res.status(404).send();
    // }
});

app.post('/todos', function(req, res){
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function(todo){
        res.json(todo.toJSON());
    }).catch(function(e){
        res.status(400).json(e);
    })
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
    var dLength = d && body.description.trim().length > 0;
    var newAttributes = {};

    if(!requestedItem){
        return res.status(404).send();
    }

    if(body.hasOwnProperty('description') && dLength){
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

db.sequelize.sync().then(function(){
    app.listen(PORT, function(){
        console.log("Express listening on port: " + PORT);
    });
});






