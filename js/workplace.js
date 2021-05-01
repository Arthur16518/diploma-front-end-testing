let headCommit = null; // stores Commit object
let commits = [], branches = [];

class Commit {
    parents = [] // Commit objects
    children = [] // Commit objects
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
    branchNameSvg

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
        case 'branch':
            branch(commandBody);
            break;
        default:
            pushText(`Команда git ${commandParts[1]} не поддерживается`);
    }
}

function GenerateName(length = 3) {
    const set = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += set[getRandomInt(0, set.length - 1)];
    }
    return result;
}

function checkIsHeadExists() {
    if (headCommit == null) {
        pushText('Сначала создайте репозиторий с помощью git init');
        return false;
    }
    return true;
}

function commit(commandBody = []) {
    if (!checkIsHeadExists()) {
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
    newCommit.commitBranch = headCommit.commitBranch;
    let cx = headCommit.commitSvg.cx();
    if (headCommit.children.length > 0) {
        cx = findAvailableCx(headCommit.children);
    }
    let commitSvg = drawCommit(name, newCommit.commitBranch.branchName, headCommit.commitSvg.cy() + defaults.commitYOffset, cx);
    newCommit.parents.push(headCommit);
    headCommit.children.push(newCommit);
    connectCommits(headCommit.commitSvg, commitSvg);
    newCommit.commitSvg = commitSvg;
    newCommit.commitBranch.branchNameSvg.animate().cy(getCyForBranchName(newCommit.commitSvg));
    newCommit.parentCommit = headCommit;
    commits.push(newCommit);
    headCommit = newCommit;
    return newCommit;
}

function findAvailableCx(nearCommits) {
    let maxCx = 0;
    for (let item of nearCommits) {
        if (item.commitSvg.cx() > maxCx)
            maxCx = item.commitSvg.cx();
    }
    return maxCx + defaults.commitXOffset;
}

function init(commandBody) {
    if (commandBody.length > 0) {
        pushText('Команда git init не требует аргументов');
        return;
    }
    if (headCommit != null) {
        pushText('Репозиторий создан. Команда git init не может быть выполнена еще раз');
        return;
    }

    const name = GenerateName();
    let newCommit = new Commit(name);
    newBranchGradient('main');
    let commitSvg = drawCommit(name, 'main');
    newCommit.commitSvg = commitSvg;
    commits.push(newCommit);
    let main = new Branch('main');
    let branchName = drawBranchName(commitSvg, 'main');
    main.branchNameSvg = branchName;
    main.lastCommit = newCommit;
    newCommit.commitBranch = main;
    branches.push(main);
    headCommit = newCommit;
    movePointer(branchName);
}

function branch(commandBody) {
    if (!checkIsHeadExists()) {
        return;
    }

    let branchName = '';
    if (commandBody.length == 1) {
        branchName = commandBody[0];
    }
    else if (commandBody.length == 0) {
        pushText('Не было указано имя овой ветки: git branch [имя ветки]');
        return;
    }
    else if (commandBody.length > 0) {
        pushText('На сайте не поддерживаются данные аргументы');
        return;
    }

    let newBranch = new Branch(branchName);
    newBranchGradient(branchName);
    let branchNameSvg = drawBranchName(headCommit.commitSvg, branchName);
    let cx = branchNameSvg.cx(), cy = branchNameSvg.cy();
    while (elementByPoint(cx, cy) != 'svg') {
        cy += branchNameSvg.height() + defaults.verticalPadding;
    }
    branchNameSvg.animate().cy(cy);
    newBranch.branchNameSvg = branchNameSvg;
    branches.push(newBranch);
}

function elementByPoint(x, y) {
    return document.elementFromPoint(x, y).localName;
}