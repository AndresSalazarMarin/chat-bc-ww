const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

server.listen(3000);

const io = require('socket.io')(server);
app.use(express.static('public'));

var usersOnId = new Array(); // 
var idsOnUsers = new Array(); //
var users = [];

io.on('connect', function(socket) {
    console.log("nueva conexion id: " + socket.id);
    // updateUsers();

    socket.on('data_user', function(user) {
        idUser = user.id;
        idSocket = socket.id;

        // Guardando Usuario por Id de conexión socket
        usersOnId[idSocket] = idUser;

        // Guardando Ids por Usuario
        if ( idsOnUsers[idUser] == null ) {
            idsOnUsers[idUser] = new Array();
            users.push(user);
        }
        idsOnUsers[idUser].push(idSocket);

        io.emit('new_user', user);

        updateUsers();
    });

    socket.on('chat', function(message) {
        if (message.to != null) {
            dest = message.to;
            idsOnlines = idsOnUsers[dest];

            for (let i = 0; i < idsOnlines.length; i++) {
                io.to(idsOnlines[i]).emit('chat', message);
            }
            io.to(socket.id).emit('chat', message);
        } else {
            io.emit('chat', message);
        }
    });

    socket.on('disconnect', function() {
        idSocket = socket.id;

        if( usersOnId[idSocket] != undefined ) {
            // Obtenemos Usuarios a partir de su Id
            idUser = usersOnId[idSocket];

            // Se elimina el elemento en usersOnId que ya no se necesita
            delete usersOnId[idSocket];

            // Obtenemos Ids del Usuario en una variable
            arrIds = idsOnUsers[idUser];

            // Recorremos los elementos para obtener la posición del Id que se requiere borrar
            for (let i = 0; i < arrIds.length; i++) {
                if (idSocket == arrIds[i]) {
                    idToDelete = i;
                }
            }

            // Eliminamos el Id con ayuda de la posición obtenida
            idsOnUsers[idUser].splice(idToDelete, 1);

            // Si para este usuario no quedaban más Ids lo borramos porque ya no lo utilizaremos
            if (idsOnUsers[idUser].length < 1) {
                delete idsOnUsers[idUser];
            }
        }

        if (users.length > 0) {
            for (let i = 0; i < users.length; i++) {
                if (idUser == users[i].id) {
                    otherIdDelete = i;
                }
            }
            users.splice(otherIdDelete, 1);
        }

        io.sockets.emit('close', idUser);

        updateUsers();
    });

    function updateUsers() {
        io.sockets.emit('update', users);
    }
});