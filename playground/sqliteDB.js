var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo',{
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

var User = sequelize.define('user', {
    email: Sequelize.STRING
});

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync().then(function(){
    console.log('Everything is synced.');
}).then(function(){
    return Todo.findById(2);
}).then(function(todo){
    if(todo){
        console.log(todo.toJSON());
    }else{
        console.log('No such todo.');
    }
}).catch(function(e){
    console.log(e);

    User.findById(1).then(function(user){
        user.getTodos({
            where: {
                completed: true
            }
        }).then(function(todos){
            todos.forEach(function(todo){
                console.log(todo.toJSON());
            });
        });
    });
    // User.create({
    //     email: 'james@gmail.com'
    // }).then(function(){
    //   return  Todo.create({
    //         description: 'I want sweets'
    //     }).then(function(todo){
    //         User.findById(1).then(function(user){
    //             user.addTodo(todo);
    //         });
    //     });
    // });
});
    // Todo.create({
    //     description: 'Shut your face'
    // }).then(function(todo){
    //     return Todo.create({
    //         description: 'I want food'
    //     });
    // }).then(function(){
    //     // return Todo.findById(1);
    //     return Todo.findAll({
    //         where: {
    //             description: {
    //                 $like: '%shut%'
    //             }
    //         }
    //     })
    // }).then(function(todos){
    //     if(todos){
    //         todos.forEach(function(todo){
    //             console.log(todo.toJSON());
    //         })
    //         // console.log(todos.toJSON());
    //     }else{
    //         console.log('No todo found bruh.');
    //     }
    // }).catch(function(e){
    //     console.log('There has been an ERROR!: ' + e);
    // })
// });