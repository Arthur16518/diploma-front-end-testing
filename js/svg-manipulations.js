const gradients = [
    //[bright, dark]
    ['#DBE6F6', '#C5796D'],
    ['#EC6EAD', '#3494E6'],
    ['#67B26F', '#4ca2cd'],
    ['#F3904F', '#3B4371'],
    ['#ff6a00', '#ee0979'],
    ['#f4c4f3', '#fc67fa'],
    ['#feb47b', '#ff7e5f'],
    ['#de6161', '#2657eb'],
    ['#3a6186', '#89253e'],
    ['#4ECDC4', '#556270'],
    ['#BE93C5', '#7BC6CC'],
    ['#bdc3c7', '#2c3e50'],
    ['#ffd89b', '#19547b'],
    ['#64f38c', '#f79d00'],
    ['#ef473a', '#cb2d3e'],
    ['#a8e063', '#56ab2f'],
    ['#004e92', '#000428'],
    ['#734b6d', '#42275a'],
    ['#243B55', '#141E30'],
    ['#FD746C', '#2C3E50'],
    ['#4CA1AF', '#2C3E50'],
    ['#e96443', '#904e95'],
    ['#3a7bd5', '#3a6073'],
    ['#00d2ff', '#928DAB'],
    ['#2196f3', '#f44336'],
    ['#FFC371', '#FF5F6D'],
    ['#ff9068', '#ff4b1f'],
    ['#A43931', '#1D4350'],
    ['#F4E2D8', '#BA5370']
];

let defaults = {
    fill: '#FFE2FF',
    stroke: '#FFE2FF',
    strokeWidth: 2,
    radius: 50,
    fontSize: '16pt',
    smallFontSize: '12pt',
    borderRadius: 10,
    verticalPadding: 2,
    horizontalPadding: 7,
    textOffset: 6,
    commitYOffset: 150,
    commitXOffset: 200,
    headMarkOffset: 4
};


let svg = SVG().addTo('#tree-wrapper').size('100%', '100%');
let svgObjects = new Map();
svgObjects.set('SVG', svg);
svgObjects.set('defs', svg.defs());
svg = svg.group();
svgObjects.set('local', svg);

// const filter = `<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%" filterRes="1">
//       <feGaussianBlur result="blurOut" in="offOut" stdDeviation="10" />
//       <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
//     </filter>`;
// document.querySelector('defs').insertAdjacentHTML('beforeend', filter);

//svgObjects.set('circle', svgObjects.get('defs').circle(defaults.radius).id('circle-def').cx(0).cy(0).attr({filter: 'url(#shadow)'}));
svgObjects.set('circle', svgObjects.get('defs').circle(defaults.radius).id('circle-def').cx(0).cy(0));
svgObjects.set('text', svgObjects.get('defs').text('').id('text-def'));
svgObjects.set('head-mark-def', svgObjects.get('defs').circle(10).id('head-mark-def').fill(defaults.fill));
svgObjects.set('detached-head', createHead(svgObjects.get('local')));
// let c1 = drawCommit('c1');
// let c2 = drawCommit('c2', 170);
// connectCommits(c1, c2);
// drawBranchName(c1, 'master');
console.log(svgObjects);

function drawCommit(name, branchName, cy = defaults.radius, cx = window.innerWidth/2, fill = randomGradient(), parent = svg, set = svgObjects) {
    let group = parent.group().id(name);
    let gradient = parent.gradient('linear', function(add) {
        add.stop(0, fill[0]);
        add.stop(1, fill[1]);
    }).transform({rotate: 45});
    group.use('circle-def').fill(`url(#${branchName}-fill)`).cx(cx).cy(cy);
    group.text(name).font({
        fill: defaults.fill, 
        size: defaults.fontSize, 
        family: `'Consolas', 'Inconsolata', 'Courier New', monospace`,
        anchor: 'middle',
        weight: 'bold'
    }).cx(cx).cy(cy);
    set.set(name, group);
    checkAndResizeForObject(group);
    return group;
}

function connectCommits(commit1, commit2, parent = svg, set = svgObjects) {
    if (commit1.cy() > commit2.cy()) {
        const temp = commit1;
        commit1 = commit2;
        commit2 = temp;
    }
    let x1 = commit1.cx();
    let y1 = commit1.cy() + commit1.height() / 2;
    let x2 = commit2.cx();
    let y2 = commit2.cy() - commit2.height() / 2;
    let middleYPoint = y1 + (y2 - y1) / 2;
    let path = parent.path(`M${x1} ${y1} C ${x1} ${middleYPoint}, ${x2} ${middleYPoint}, ${x2} ${y2}`)
        .fill('none')
        .stroke({
            color: defaults.stroke,
            width: defaults.strokeWidth
        });
    set.set(`${commit1.id()}-${commit2.id()}`, path);
    return path;
}

function drawBranchName(targetCommit, branchName, parent = svg, set = svgObjects) {
    let group = parent.group().id('branch-'+branchName);
    let text = group.text(branchName).font({
        fill: defaults.fill, 
        size: defaults.fontSize, 
        family: `'Consolas', 'Inconsolata', 'Courier New', monospace`,
        anchor: 'middle'
    });
    const bbox = text.bbox();
    let rect = group.rect()
        .rx(defaults.borderRadius)
        .ry(defaults.borderRadius)
        .width(bbox.width + defaults.horizontalPadding * 2)
        .height(bbox.height + defaults.verticalPadding * 2)
        .cx(text.cx())
        .cy(text.cy())
        .fill(defaults.fill)
        .opacity(0.3)
        .backward();
    group.back();
    group.x(getXForBranchName(targetCommit)).cy(getCyForBranchName(targetCommit));
    set.set(group.id(), group);
    checkAndResizeForObject(group);
    return group;
}

function createHead(parent = svg) {
    let group = parent.group().id('detached-head').hide();
    let text = group.text('HEAD').font({
        fill: defaults.fill,
        size: defaults.fontSize,
        family: `'Consolas', 'Inconsolata', 'Courier New', monospace`,
        anchor: 'middle',
        style: 'italic',
        weight: 'bold'
    });
    const bbox = text.bbox();
    let rect = group.rect()
        .rx(defaults.borderRadius)
        .ry(defaults.borderRadius)
        .width(bbox.width + defaults.horizontalPadding * 2)
        .height(bbox.height + defaults.verticalPadding * 2)
        .cx(text.cx())
        .cy(text.cy())
        .fill(defaults.fill)
        .opacity(0.3)
        .backward();
    group.back();
    group.cx(0).cy(0);
    return group;
}

function getCyForBranchName(targetCommit) {
    return targetCommit.cy()  - targetCommit.height() / 2 + defaults.textOffset;
}

function getXForBranchName(targetCommit) {
    return targetCommit.x() + targetCommit.width() - defaults.textOffset;
}

function randomGradient() {
    let i = getRandomInt(0, gradients.length - 1);
    return gradients[i];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function movePointer(targetGroup) {
    if (svgObjects.get('detached-head')) {
        attachHead();
    }
    let headCircle = svgObjects.get('head-circle');
    if (headCircle)
        headCircle.remove();
    const cy = targetGroup.cy() - defaults.headMarkOffset;
    headCircle = targetGroup.use('head-mark-def')
        .cx(targetGroup.x() + targetGroup.width() + defaults.horizontalPadding)
        .cy(cy);
    svgObjects.set('head-circle', headCircle);
}

function newBranchGradient(branchName) {
    const fill = randomGradient();
    let gradient = svgObjects.get('defs').gradient('linear', function(add) {
        add.stop(0, fill[0]);
        add.stop(1, fill[1]);
    }).transform({rotate: 45}).id(branchName+'-fill');
}

function moveHead(targetGroup) {
    let head = detachHead();
    head.animate().x(targetGroup.x() - head.width() - defaults.horizontalPadding).cy(targetGroup.cy());
}

function detachHead() {
    let headCircle = svgObjects.get('head-circle');
    if (headCircle)
        headCircle.remove();
    let detachedHead = svgObjects.get('detached-head');
    detachedHead.show();
    return detachedHead;
}

function attachHead() {
    svgObjects.get('detached-head').hide();
}

function checkAndResizeForObject(object) {
    let svg = svgObjects.get('SVG');
    if (object.cy() >= svg.node.clientHeight)
        svg.height(object.cy() + 2 * defaults.radius);
    if (object.cx() >= svg.node.clientWidth)
        svg.width(object.cx() + 2 * defaults.radius);
}