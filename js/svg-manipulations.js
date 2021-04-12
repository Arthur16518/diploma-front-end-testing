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
    ['#fceabb', '#f8b500'],
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
    fontSize: '16pt'
};


let svg = SVG().addTo('#tree-wrapper').size('100%', '100%');
let svgObjects = new Map();
svgObjects.set('SVG', svg);
svgObjects.set('defs', svg.defs());
svg = svg.group();
svgObjects.set('local', svg);

const filter = `<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%" filterRes="1">
      <feGaussianBlur result="blurOut" in="offOut" stdDeviation="10" />
      <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
    </filter>`;
document.querySelector('defs').insertAdjacentHTML('beforeend', filter);

svgObjects.set('circle', svgObjects.get('defs').circle(defaults.radius).id('circle-def').cx(0).cy(0).attr({filter: 'url(#shadow)'}));
svgObjects.set('text', svgObjects.get('defs').text('').id('text-def'));
let c1 = drawCommit('c1');
let c2 = drawCommit('c2', 170);
connectCommits(c1, c2);
console.log(svgObjects);

function drawCommit(name, cy = defaults.radius, cx = window.innerWidth/2, fill = randomGradient(), parent = svg, set = svgObjects) {
    let group = parent.group();
    let gradient = parent.gradient('linear', function(add) {
        add.stop(0, fill[0]);
        add.stop(1, fill[1]);
    }).transform({rotate: 45});
    group.use('circle-def').fill(gradient).cx(cx).cy(cy);
    group.text(name).font({
        fill: defaults.fill, 
        size: defaults.fontSize, 
        family: `'Consolas', 'Inconsolata', 'Courier New', monospace`,
        anchor: 'middle',
        weight: 'bold'
    }).cx(cx).cy(cy);
    set.set(name, group);
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
    let y2 = commit2.cy() - commit2.height() / 2
    let path = parent.path(`M${x1} ${y1} C ${x1} ${y2}, ${x2} ${y1}, ${x2} ${y2}`)
        .fill('none')
        .stroke({
            color: defaults.stroke,
            width: defaults.strokeWidth
        });
    set.set(`${commit1.id()}-${commit2.id()}`, path);
    return path;
}

function randomGradient() {
    let i = getRandomInt(0, 29);
    return gradients[i];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}