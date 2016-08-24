var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var newId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res){
    res.send('Todo API Root');
});

app.get('/todos', middleware.requireAuthentication, function(req, res){
    var query = req.query;
    var qTrue = query.hasOwnProperty('completed') && query.completed === 'true';
    var qFalse = query.hasOwnProperty('completed') && query.completed === 'false';
    // var qBoolean = query.hasOwnProperty('completed');
    var qDescription = query.hasOwnProperty('q') && query.q.length > 0;
    var uniqueId = req.user.get('id');
    var where = {userId: uniqueId};
   

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

app.get('/todos/:id', middleware.requireAuthentication, function(req, res){
    var todoId = parseInt(req.params.id);
    var uniqueId = req.user.get('id');

    db.todo.findOne({   
        where:{
            id: todoId,
            userId: uniqueId
    }}).then(function(todo){
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

app.post('/todos', middleware.requireAuthentication, function(req, res){
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function(todo){
        req.user.addTodo(todo).then(function(){
            return todo.reload();
        }).then(function(todo){
            res.json(todo.toJSON());
        });
    }).catch(function(e){
        res.status(400).json(e);
    })
});

app.delete('/todos/:id', middleware.requireAuthentication, function(req,res){
    var todoId = parseInt(req.params.id);
    var uniqueId = req.user.get('id');

    db.todo.destroy({
        where: {
            id: todoId,
            userId: uniqueId
        },
        paranoid: {
            force: true
        }
    }).then(function(deletedRows){
        if(deletedRows === 0){
            res.status(404).json({error: 'No todo found with that ID.'});
        }else{
            res.status(204).send();
        }
    }).catch(function(e){
        res.status(500).send();
    });

    // db.todo.findById(todoId).then(function(todo){
    //     if(!!todo){
    //         res.json(todo.toJSON());
    //         todo.destroy({ force: true });
    //     }else{
    //         res.send('No matching todo found.');
    //     }
    // }).catch(function(e){
    //     res.status(404).send();
    // });
    // var requestedItem = _.findWhere(todos, {id: todoId});
    // var modifiedTodos = _.without(todos, requestedItem);

    // if(requestedItem){
    //     todos = modifiedTodos;
    //     res.json(modifiedTodos);
    // }else{
    //     res.status(400).json({"ERROR": "That shit doesn't exist bro. Try a different ID."});
    // }

});

app.put('/todos/:id', middleware.requireAuthentication, function(req, res){
    var todoId = parseInt(req.params.id);
    // var requestedItem = _.findWhere(todos, {id: todoId});
    var body = _.pick(req.body, 'description', 'completed');
    // var c = _.isBoolean(body.completed);
    // var d = _.isString(body.description);
    // var dLength = d && body.description.trim().length > 0;
    var newAttributes = {};
    var uniqueId = req.user.get('id');

    if(body.hasOwnProperty('description')){
        newAttributes.description = body.description;
    }

    if(body.hasOwnProperty('completed')){
        newAttributes.completed = body.completed;
    }

    db.todo.findOne({   
        where:{
            id: todoId,
            userId: uniqueId
    }}).then(function(todo){
        if(todo){
            todo.update(newAttributes).then(function(todo){
                res.json(todo.toJSON());
            });
        }else{
            res.status(404).json({error: "No todo found by that ID."});
        }
    }).catch(function(e){
        res.status(400).json(e);
    })
});

app.post('/users', function(req, res){
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function(user){
        res.json(user.toPublicJSON());
    }).catch(function(e){
        res.status(400).json(e);
    })
});

app.post('/users/login', function(req, res){
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body).then(function(user){
        var token = user.generateToken('authentication');
        userInstance = user;

        return db.token.create({
            token: token
        });
        // if(token){
        //     res.header('Auth', token).json(user.toPublicJSON());
        // }else{
        //     res.status(401).send();
        // }
    }).then(function(tokenInstance){
        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
    }).catch(function(e){
        res.status(401).send();
    });

});

app.delete('/users/login', middleware.requireAuthentication, function(req, res){
    req.token.destroy().then(function(){
        res.status(204).send();
    }).catch(function(e){
        res.status(500).send();
    })
});

db.sequelize.sync({force:true}).then(function(){
    app.listen(PORT, function(){
        console.log("Express listening on port: " + PORT);
    });
});






