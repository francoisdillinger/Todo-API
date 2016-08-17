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
})

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
})
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