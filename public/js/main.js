const socket = io.connect();

const chatMessages = document.getElementById('chat');
const params = new URLSearchParams(window.location.search);

var localUser = {
    id: params.get('id'),
    name: params.get('name')
};

socket.on('connect', function() {
    $('#chat').append("<span style='color:#000032;padding-left: 5px;'>Bienvenido al chat</span> " + "</br>");
    
    socket.emit('data_user', localUser);
});

socket.on('new_user', function(user) {
    objUser = user;
    if (objUser.id == localUser.id) {
        dName = 'Conectado';
    } else {
        dName = `${objUser.name} se ha conectado`;
    }
    $('#chat').append(`<center><small class="text-muted px-2 ">-${dName}-</small></center>`);
    scrollMessage();
});

socket.on('chat', function(message) {
    if (message.to != null) {
        objUser = message.user;
        console.log(objUser);
        if (objUser.id == localUser.id) {
            dName = 'Yo';
            boxChat = message.boxD;
        } else {
            dName = objUser.name;
            boxChat = message.boxU;
        }
        $(boxChat).append("<span style='color:black;padding-left: 5px; font-weight: bold;'>" + dName + "</span>: " + message.msg + "</br>");
    } else {
        objUser = message.user;
        if (objUser.id == localUser.id) {
            dName = 'Yo';
        } else {
            dName = objUser.name;
        }
        $('#chat').append("<span style='color:black;padding-left: 5px; font-weight: bold;'>" + dName + "</span>: " + message.msg + "</br>");
    }
    scrollMessage();
});

socket.on('update', function(users) {
    users.forEach(user => {
        if ( user.id != localUser.id ) {
            if ( $(`#list-${user.id}-list`).length <= 0 ) {
                $('#list-users').append(`<a class="list-group-item list-group-item-action" id="list-${user.id}-list" data-toggle="list" href="#list-${user.id}" role="tab" aria-controls="${user.id}">${user.name}</a>`);
                $('#nav-users').append(`
                <div class="tab-pane fade" id="list-${user.id}" role="tabpanel" aria-labelledby="list-${user.id}-list">
                    <div id="chat-${localUser.id}-${user.id}" class="txtarea fullsz">
                    <span style='color:#000032;padding-left: 5px;'>Bienvenido al chat con ${user.name}</span></br>
                    </div>

                    <div class="back-inp">
                        <input type="text" placeholder="Presione enter para enviar" class="fullsz form-control msg" data-to="${user.id}" />
                    </div>
                </div>`);
            }
        }
    });
});

socket.on('close', function(userId) {
    console.log(userId);
    $(`#list-${userId}-list`).remove();
    $(`#list-${userId}`).remove();
});

$(document).on('keypress', '.msg', function(e) {

    if (e.keyCode === 13) {
        e.preventDefault();
        if ($(this).val() === '')
            return false;
        var msg = $(this).val();
        var objMsg = {
            'user': localUser,
            'msg': msg,
            'to': $(this).data('to'),
            'boxU': `#chat-${$(this).data('to')}-${localUser.id}`,
            'boxD': `#chat-${localUser.id}-${$(this).data('to')}`
        };

        sendMessage(objMsg);

        $(this).val('');
        scrollMessage();
    }
});

function sendMessage(objMsg) {
    socket.emit('chat', objMsg);
}

function scrollMessage() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}