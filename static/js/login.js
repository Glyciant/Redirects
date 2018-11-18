function login() {
    $.post("/login/", {
        username: $("#username").val(),
        password: $("#password").val()
    }).done(function() {
        location.reload();
    }).fail(function() {
        $("#username").addClass("is-invalid");
        $("#password").addClass("is-invalid");
    });
}

$(document).delegate("button", "click", function() {
    login();
});

$(document).keypress(function(e) {
    if(e.which == 13) {
        login();
    }
});

$(document).delegate("input", "input", function() {
    $("#username").removeClass("is-invalid");
    $("#password").removeClass("is-invalid");
})