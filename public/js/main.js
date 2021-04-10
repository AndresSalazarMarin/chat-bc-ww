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

        if (objUser.id == localUser.id) {
            dName = 'Yo';
            boxChat = message.boxD;
            classNew = 'my-msg';
        } else {
            dName = objUser.name;
            boxChat = message.boxU;
            classNew = 'new-msg active';
            $('#pills-users-tab .entry-msg').addClass('active');
            $(`#list-${objUser.id}-list .entry-msg`).addClass('active');
            notifySound();
        }
        $(boxChat).append(`<div class='${classNew} px-2'><span class="font-weight-bold" style='color:black;'>${dName}</span>: ${message.msg}</div>`);
    } else {
        objUser = message.user;
        if (objUser.id == localUser.id) {
            dName = 'Yo';
            classNew = 'my-msg';
        } else {
            $('#pills-general-chat-tab .entry-msg').addClass('active');
            dName = objUser.name;
            classNew = 'new-msg active';
            notifySound();
        }
        $('#chat').append(`<div class='${classNew} px-2'><span class="font-weight-bold" style='color:black;'>${dName}</span>: ${message.msg}</div>`);
    }
    scrollMessage();
});

socket.on('update', function(users) {
    users.forEach(user => {
        if ( user.id != localUser.id ) {
            if ( $(`#list-${user.id}-list`).length <= 0 ) {
                $('#list-users').append(`<a class="list-group-item list-group-item-action" id="list-${user.id}-list" data-toggle="list" href="#list-${user.id}" role="tab" aria-controls="${user.id}">${user.name} <span class="entry-msg"></span></a>`);
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

        if ($(this).data('to') != null) {
            $(`#list-${$(this).data('to')}-list .entry-msg`).removeClass('active');
            $(`#chat-${localUser.id}-${$(this).data('to')} .new-msg`).removeClass('active');
            if( $(`#list-users .entry-msg.active`).length <= 0) {
                $('#pills-users-tab .entry-msg').removeClass('active');
            }
        } else {
            $('#pills-general-chat-tab .entry-msg').removeClass('active');
            $('#pills-general-chat .new-msg').removeClass('active');
        }

        $(this).val('');
        scrollMessage();
    }
});

function notifySound() {
    document.getElementById('notify-sound').play();
}

function sendMessage(objMsg) {
    socket.emit('chat', objMsg);
}

function scrollMessage() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}