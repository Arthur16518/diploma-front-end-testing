const blobs = document.querySelectorAll('.blob');
for (let i of blobs) {
    const delay = getRandomInt(1, 6);
    i.style.animation = `bounceIn 1s 0s, full-rotation 7s ${delay}s ease-in-out infinite alternate`;
}

$('.lessons-section').hide();
const sections = document.querySelectorAll('.lessons-section');
for (let i = 0; i < sections.length; i++) {
    setTimeout(() => {
        $(sections[i]).show(300);
    }, i*50);
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

document.onmousemove = function (e) {
    if (!prevPos)
        prevPos = {top: e.pageY, left: e.pageX};
    let topDir = getDir(e.pageY, prevPos.top);
    let leftDir = getDir(e.pageX, prevPos.left);
    prevPos = {top: e.pageY, left: e.pageX};
    $(".blob:nth-of-type(1)").offset(function(i,val){
        return {top:val.top - topDir*0.4, left:val.left - leftDir*0.4};
    });
    $(".blob:nth-of-type(2)").offset(function(i,val){
        return {top:val.top - topDir*0.1, left:val.left - leftDir*0.1};
    });
    $(".blob:nth-of-type(3)").offset(function(i,val){
        return {top:val.top - topDir*0.3, left:val.left - leftDir*0.3};
    });
    $(".blob:nth-of-type(4)").offset(function(i,val){
        return {top:val.top + topDir*0.1, left:val.left + leftDir*0.1};
    });
    $(".blob:nth-of-type(5)").offset(function(i,val){
        return {top:val.top + topDir*0.4, left:val.left + leftDir*0.4};
    });
}

var prevPos;
function getDir(now, previous) {
    if (now > previous)
        return 1;
    else
        return -1;
}

