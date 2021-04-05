document.onmousemove = function (e) {
    if (!prevPos)
        prevPos = {top: e.pageY, left: e.pageX};
    let topDir = getDir(e.pageY, prevPos.top);
    let leftDir = getDir(e.pageX, prevPos.left);
    prevPos = {top: e.pageY, left: e.pageX};
    $("#tree-img").offset(function(i,val){
        return {top:val.top + topDir*0.2, left:val.left + leftDir*0.2};
    });
}

var prevPos;
function getDir(now, previous) {
    if (now > previous)
        return 1;
    else
        return -1;
}