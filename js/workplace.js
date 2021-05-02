let headCommit = null; // stores Commit object
newBranchGradient('HEAD');
let commits = [], branches = []; // restricted for changing the order of items
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
$('#command-prompt').focus(() => $('.commands').removeClass('low-opacity'));
$('#command-prompt').blur(() => $('.commands').addClass('low-opacity') );

function scrollToBottom(block) {
    block.scrollTop = block.scrollHeight;
}

function pushText(text) {
    const commands = document.querySelector('.commands');
    commands.insertAdjacentHTML('beforeend', '<p>'+text+'</p>');
    scrollToBottom(commands);
}

pushText(navigator.userAgent);

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
    commandStr.trim();
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
        case 'merge':
            merge(commandBody);
            break;
        case 'rebase':
            rebase(commandBody);
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

function commit(commandBody = [], name = GenerateName()) {
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

    let newCommit = new Commit(name, message);
    newCommit.commitBranch = currentBranch;
    let cx = headCommit.commitSvg.cx(), cy = headCommit.commitSvg.cy() + defaults.commitYOffset;
    if (headCommit.children.length > 0 || elementByPoint(cx, cy) != 'svg') {
        cx = findAvailablePosition(cx, cy);
    }

    let commitSvg = drawCommit(name, newCommit.commitBranch.branchName, cy, cx);
    newCommit.parents.push(headCommit);
    headCommit.children.push(newCommit);
    connectCommits(headCommit.commitSvg, commitSvg);
    newCommit.commitSvg = commitSvg;
    if (newCommit.commitBranch.branchName == 'HEAD')
        moveHead(newCommit.commitSvg);
    else
        newCommit.commitBranch.branchNameSvg.animate().x(getXForBranchName(newCommit.commitSvg)).cy(getCyForBranchName(newCommit.commitSvg));
    newCommit.commitBranch.lastCommit = newCommit;
    commits.push(newCommit);
    headCommit = newCommit;
    scrollToBottom(document.getElementById('tree-wrapper'));
    return newCommit;
}

function findAvailablePosition(cx, cy) {
    if (elementByPoint(cx, cy) == 'svg')
        return cx;
    else {
        let left = findLeftPos(cx - defaults.commitXOffset, cy);
        let right = findRightPos(cx + defaults.commitXOffset, cy);
        if (right - cx <= cx - left)
            return right;
        else
            return left;
    }
}

function findLeftPos(cx, cy) {
    if (elementByPoint(cx, cy) == 'svg')
        return cx;
    else
        return findLeftPos(cx - defaults.commitXOffset, cy);
}

function findRightPos(cx, cy) {
    if (elementByPoint(cx, cy) == 'svg')
        return cx;
    else
        return findRightPos(cx + defaults.commitXOffset, cy);
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
    if (getBranchByName(branchName)) {
        pushText('Ветка с таким именем уже существует');
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
    let svg = svgObjects.get('SVG');
    if (svg.width() <= x)
        svg.width(x + 2 * defaults.radius);
    if (svg.height() <= y)
        svg.height(y + 2 * defaults.radius);
    let treeWrapper = document.getElementById('tree-wrapper');
    treeWrapper.scrollTop = y;
    y -= treeWrapper.scrollTop;
    $('.command-prompt-div').hide();
    let result;
    try {
        result = document.elementFromPoint(x, y).localName;
    }
    catch {
        result = 'svg';
    }
    if (result == 'body')
        result = 'svg';
    $('.command-prompt-div').show();
    return result;
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
    if (!target) {
        pushText('Неверный аргумент команды');
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

function merge(commandBody) {
    if (!checkIsHeadExists()) {
        return;
    }
    if (commandBody.length != 1) {
        pushText('Команда git merge должна иметь 1 аргумент');
        return;
    }
    let target = getBranchByName(commandBody[0]);
    if (!target)
        target = getCommitByName(commandBody[0]);
    if (!target) {
        pushText('Данный коммит или ветка не найдены');
        return;
    }
    if (target instanceof Branch)
        target = target.lastCommit;
    if (isParentToChild(headCommit, target)) {
        pushText('Изменения из данного коммита уже присутствуют');
        return;
    }
    if (isChildToParent(headCommit, target)) {
        moveBranch(headCommit.commitBranch, target);
        pushText('Произошел fast forward');
        return;
    }
    let newCommit = commit();
    while (newCommit.commitSvg.cy() <= target.commitSvg.cy()) {
        newCommit.commitSvg.cy(newCommit.commitSvg.cy() + defaults.commitYOffset);
    }
    newCommit.parents.push(target);
    target.children.push(newCommit);
    connectCommits(target.commitSvg, newCommit.commitSvg);
}

function isParentToChild(childCommit, parentCommit) {
    if (childCommit.parents.length == 0)
        return false;
    if (childCommit.parents.indexOf(parentCommit) != -1)
        return true;
    let result = false;
    for (let parent of childCommit.parents) {
        result = result || isParentToChild(parent, parentCommit);
        if (result)
            return result;
    }
    return result;
}

function isChildToParent(parentCommit, childCommit) {
    if (parentCommit.children.length == 0)
        return false;
    if (parentCommit.children.indexOf(childCommit) != -1)
        return true;
    let result = false;
    for (let child of parentCommit.children) {
        result = result || isChildToParent(child, childCommit);
        if (result)
            return result;
    }
    return result;
}

function moveBranch(branch, targetCommit) {
    let x = getXForBranchName(targetCommit.commitSvg), cy = getCyForBranchName(targetCommit.commitSvg);
    let cx = x + (branch.branchNameSvg.width() / 2);
    while (elementByPoint(cx, cy) != 'svg') {
        cy += branch.branchNameSvg.height() + defaults.verticalPadding;
    }
    branch.branchNameSvg.animate().x(x).cy(cy);
    targetCommit.parents.concat(branch.lastCommit.parents);
    branch.lastCommit = targetCommit;
    headCommit = targetCommit;
}

function rebase(commandBody) {
    if (!checkIsHeadExists()) {
        return;
    }
    if (commandBody.length != 1) {
        pushText('Команда git rebase должна иметь 1 аргумент');
        return;
    }
    let target = getBranchByName(commandBody[0]);
    if (!target)
        target = getCommitByName(commandBody[0]);
    if (!target) {
        pushText('Данный коммит или ветка не найдены');
        return;
    }
    if (target instanceof Branch)
        target = target.lastCommit;
    if (isChildToParent(headCommit, target)) {
        moveBranch(headCommit.commitBranch, target);
        pushText('Произошел fast forward');
        return;
    }
    if (isParentToChild(headCommit, target)) {
        pushText('Изменения из данной ветки уже присутствуют');
        return;
    }
    let commonParent = findCommonParent(headCommit, target);
    let commitsToRebase = collectCommitsFromParentToChild(commonParent, headCommit);
    let commitsBetweenParentAndTarget = collectCommitsFromParentToChild(commonParent, target);
    commitsBetweenParentAndTarget = commitsBetweenParentAndTarget.map(value => value.commitName);
    commitsToRebase = commitsToRebase.filter(value => commitsBetweenParentAndTarget.indexOf(value.commitName+`'`) == -1);
    let rebasedCommits = [];
    headCommit = target;
    for (let i of commitsToRebase) {
        let rebaseCommit = commit([], i.commitName+`'`);
        rebaseCommit.commitSvg.node.querySelector('text').attributes.getNamedItem('font-size').value = defaults.smallFontSize;
        rebasedCommits.push(rebaseCommit);
    }
}

function findCommonParent(commit1, commit2) {
    const i1 = commits.indexOf(commit1), i2 = commits.indexOf(commit2);
    let i = i1 < i2 ? i1 : i2;
    for (i; i >= 0; i--) {
        if (isParentToChild(commit1, commits[i]) && isParentToChild(commit2, commits[i]))
            return commits[i];
    }
    return null;
}

function collectCommitsFromParentToChild(parentCommit, childCommit) {
    let i = commits.indexOf(parentCommit), end = commits.indexOf(childCommit), result = [];
    for (i++; i <= end; i++) {
        if (isChildToParent(parentCommit, commits[i]) && isParentToChild(childCommit, commits[i]) || commits[i] == childCommit)
            result.push(commits[i]);
    }
    return result;
}