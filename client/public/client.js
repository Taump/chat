const chat = document.getElementById("chat");
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        '(?:^|\s)' + name + '=(.*?)(?:;|$)'
));
    return matches[1];
}

const token = getCookie('token');
window.onload = function() {
    let addMsg = document.getElementById('addMsg');
    const socket = io.connect('http://localhost:3000');
    socket.emit('receiveHistory');
    socket.on('history', messages => {
        for (let message of messages) {
            console.log(message);
            addMessage(message);
        }
    });
    socket.on('message',addMessage);
    chat.scrollTop = chat.scrollHeight;
    addMsg.addEventListener('click',function (e) {
        let msg =  document.getElementById('msg_text').value;
        msg = msg.replace(/<[^>]+>/g,'');

        document.getElementById('msg_text').value = '';
        e.preventDefault();
        if(msg !==''){
            console.log(document.cookie.match(/token=(.+?);/));
            if(token!=null){
                socket.emit('msg', {msg: msg, token: token});
            }
        }
    });


};

function addMessage(data) {
    console.log(data);
    let html =  `
    <div class="row callout small message">
                        <p>${data.content}</p>
                        <div class="user_info">
                            <strong>${data.username}</strong> <time>${data.date}</time>
                        </div>
                    </div>
    `;
    chat.innerHTML=  chat.innerHTML+html ;
    chat.scrollTop = chat.scrollHeight;

}