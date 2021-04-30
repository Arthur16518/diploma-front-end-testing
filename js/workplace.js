let headPointer = null; // stores Commit object
let commits = [], branches = [];

class Commit {
    parentCommit // Commit object
    commitName
    commitMessage
    commitBranch // Branch object
    commitSvg

    constructor (commitName, commitMessage = null) {
        this.commitName = commitName;
        this.commitMessage = commitMessage;
    }
}

class Branch {
    branchName
    lastCommit // Commit object
    branchColor // id of svg fill
    branchNameSvg
    branchFillSvg

    constructor (branchName) {
        this.branchName = branchName;
    }
}

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
    recognizeCommand(cmdPrompt.value);
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

function recognizeCommand(commandStr) {
    let commandParts = commandStr.split(' ');
    if (commandStr.length < 2 || commandParts[0] != 'git') {
        pushText(`Команда "${commandStr}" не является git-командой`);
        return;
    }
    commandBody = commandParts.slice(2);
    switch (commandParts[1]) {
        case 'init':
            init(commandBody);
            break;
        case 'commit':
            commit(commandBody);
            break;
        default:
            pushText(`Команда git ${commandParts[1]} не поддерживается`);
    }
}

function GenerateName(length = 2) {
    const set = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += set[getRandomInt(0, set.length - 1)];
    }
    return result;
}

function commit(commandBody = []) {
    if (headPointer == null) {
        pushText('Сначала создайте репозиторий с помощью git init');
        return;
    }

    let message = null;
    if (commandBody.length == 2) {
        switch (commandBody[0]) {
            case '-m':
                message = commandBody[1];
                break;
            default:
                pushText('На сайте не поддерживается данный аргумент');
                return;
        }
    }
    else if (commandBody.length != 0) {
        pushText('На сайте не поддерживаются данные аргументы');
        return;
    }

    const name = GenerateName();
    let newCommit = new Commit(name, message);
    newCommit.commitBranch = headPointer.commitBranch;
    let commitSvg = drawCommit(name, headPointer.commitSvg.cy() + defaults.commitYOffset, headPointer.commitSvg.cx());
    connectCommits(headPointer.commitSvg, commitSvg);
    newCommit.commitSvg = commitSvg;
    newCommit.commitBranch.branchNameSvg.animate().dy(defaults.commitYOffset);
    commits.push(newCommit);
    headPointer = newCommit;
    return newCommit;
}

function init(commandBody) {
    if (commandBody.length > 0) {
        pushText('Команда git init не требует аргументов');
        return;
    }
    if (headPointer != null) {
        pushText('Репозиторий создан. Команда git init не может быть выполнена еще раз');
        return;
    }

    const name = GenerateName();
    let newCommit = new Commit(name);
    let commitSvg = drawCommit(name);
    newCommit.commitSvg = commitSvg;
    commits.push(newCommit);
    let main = new Branch('main');
    let branchName = drawBranchName(commitSvg, 'main');
    main.branchNameSvg = branchName;
    main.lastCommit = newCommit;
    newCommit.commitBranch = main;
    main.branchFillSvg = newBranchGradient();
    branches.push(main);
    headPointer = newCommit;
    movePointer(branchName);
}