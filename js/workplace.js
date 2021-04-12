function scrollToBottom(block) {
    block.scrollTop = block.scrollHeight;
}

function pushText(text) {
    const commands = document.querySelector('.commands');
    commands.insertAdjacentHTML('beforeend', '<p>'+text+'</p>');
    scrollToBottom(commands);
}

function performCommand() {
    const cmdPrompt = document.querySelector('#command-prompt');
    pushText(cmdPrompt.value);
    cmdPrompt.value = '';
}

scrollToBottom(document.querySelector('.commands'));
document.getElementById('command-prompt').focus();

$('#command-prompt').keypress(function (e) {
    if (e.key == 'Enter')
        performCommand();
});

$('#perform-button').click(function () {
    performCommand();
});