$('.overlay, .window, .module, #to-task-button').hide();
const modules = document.querySelectorAll('.module');
let currentModule = 0

$('#back-button').click(function () {
    window.history.back();
});

$('#show-commands-button').click(function () {
    $('.overlay').fadeIn();
    $('#commands-window').slideToggle();
});

$('.close-button').click(function() {
    $(this.parentElement).slideToggle();
    $('.overlay').fadeOut();
});

$('#show-lesson-button').click(function() {
    switchModule(0);
    $('.overlay').fadeIn();
    $('.lesson').slideToggle();
});

$('#show-task-button').click(function() {
    $('.overlay').fadeIn();
    $('.task').slideToggle();
});

$('#next-module').click(function () {
    switchModule(currentModule + 1);
});

$('#previous-module').click(function () {
    switchModule(currentModule - 1);
});


function switchModule(moduleToShow) {
    $(modules[currentModule]).fadeOut();
    $(modules[moduleToShow]).fadeIn();
    currentModule = moduleToShow;
    if (moduleToShow == 0)
        $('#previous-module').hide();
    else
        $('#previous-module').show();
    if (moduleToShow == modules.length - 1) {
        $('#next-module').hide();
        $('#to-task-button').slideDown();
    }
    else
        $('#next-module').show();
}

$('#to-task-button').click(function() {
    $('.lesson').slideToggle();
    setTimeout(() => $('.task').slideToggle(), 350);
});