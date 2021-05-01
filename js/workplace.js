let headCommit = null; // stores Commit object
newBranchGradient('HEAD');
let commits = [], branches = [];
let currentBranch = null; // stores Branch object

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

branches.push(new Branch('HEAD'));

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

let commandListPos = 0, commandList = [];
function addCommandToList(commandStr) {
    commandList.unshift(commandStr);
    commandListPos = 0;
}

function putPreviousCommand() {
    const commandPrompt = document.getElementById('command-prompt');
    if (commandList.length == 0)
        return;
    if (commandPrompt.value != '')
        commandListPos++;
    if (commandListPos >= commandList.length)
        commandListPos = commandList.length - 1;
    commandPrompt.value = commandList[commandListPos];
}

function putNextCommand() {
    const commandPrompt = document.getElementById('command-prompt');
    if (commandList.length == 0 || commandPrompt.value == '')
        return;
    commandListPos--;
    if (commandListPos < 0)
        commandListPos = 0;
    commandPrompt.value = commandList[commandListPos];
}

$('#command-prompt').keydown(function (e) {
    if (e.key == 'Enter')
        performCommand();
    else if (e.key == 'ArrowUp')
        putPreviousCommand();
    else if (e.key == 'ArrowDown')
        putNextCommand();
});

$('#perform-button').click(function () {
    performCommand();
});

function recognizeCommand(commandStr) {
    addCommandToList(commandStr);
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
        case 'checkout':
            checkout(commandBody);
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
    newCommit.commitBranch = currentBranch;
    let cx = headCommit.commitSvg.cx();
    if (headCommit.children.length > 0) {
        cx = findAvailableCx(headCommit.children);
    }
    let commitSvg = drawCommit(name, newCommit.commitBranch.branchName, headCommit.commitSvg.cy() + defaults.commitYOffset, cx);
    newCommit.parents.push(headCommit);
    headCommit.children.push(newCommit);
    connectCommits(headCommit.commitSvg, commitSvg);
    newCommit.commitSvg = commitSvg;
    if (newCommit.commitBranch.branchName == 'HEAD')
        moveHead(newCommit.commitSvg);
    else
        newCommit.commitBranch.branchNameSvg.animate().x(getXForBranchName(newCommit.commitSvg)).cy(getCyForBranchName(newCommit.commitSvg));
    newCommit.parentCommit = headCommit;
    newCommit.commitBranch.lastCommit = newCommit;
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
    currentBranch = main;
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
        pushText('Не было указано имя новой ветки: git branch [имя ветки]');
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
    if (currentBranch.branchName != 'HEAD')
        while (elementByPoint(cx, cy) != 'svg') {
            cy += branchNameSvg.height() + defaults.verticalPadding;
        }
    branchNameSvg.animate().cy(cy);
    newBranch.branchNameSvg = branchNameSvg;
    newBranch.lastCommit = headCommit;
    branches.push(newBranch);
}

function elementByPoint(x, y) {
    return document.elementFromPoint(x, y).localName;
}

function checkout(commandBody) {
    if (!checkIsHeadExists()) {
        return;
    }
    if (commandBody.length == 0) {
        pushText('Команда git checkout должна иметь аргументы');
        return;
    }
    let target;
    if (commandBody.length == 2 && commandBody[0] == '-b') {
        const branchName = commandBody[1];
        branch([branchName]);
        target = getBranchByName(branchName);
    }
    else if (commandBody.length == 1) {
        target = getBranchByName(commandBody[0]);
        if (!target)
            target = getCommitByName(commandBody[0]);
    }
    else {
        pushText('На сайте не поддерживаются данные аргументы');
        return;
    }

    if (target instanceof Branch) {
        movePointer(target.branchNameSvg);
        headCommit = target.lastCommit;
        currentBranch = target;
    }
    else {
        moveHead(target.commitSvg);
        headCommit = target;
        currentBranch = getBranchByName('HEAD');
    }
}

function getCommitByName(commitName) {
    for (let item of commits) {
        if (item.commitName == commitName)
            return item;
    }
    return null;
}

function getBranchByName(branchName) {
    for (let item of branches) {
        if (item.branchName == branchName)
            return item;
    }
    return null;
}