$(document).delegate("#add", "click", function() {
    var key = $("#key").val(),
        redirect = $("#redirect").val();

    if (key && redirect) {
        $.post("/add/", {
            key: key,
            redirect: redirect
        }).done(function() {
            location.reload();
        }).fail(function() {
            $("#key").addClass("is-invalid");
            $("#redirect").addClass("is-invalid");
        });
    }
    else {
        $("#key").addClass("is-invalid");
        $("#redirect").addClass("is-invalid");
    }
});

$(document).delegate("#edit", "click", function() {
    $.post("/get/", {
        key: $(this).data("key")
    }).done(function(resp) {
        key = $("#edit-key").val(resp.key),
        redirect = $("#edit-redirect").val(resp.redirect);
        $("#modal-edit").modal("show");
    });
});

$(document).delegate("#save", "click", function() {
    var key = $("#edit-key").val(),
        redirect = $("#edit-redirect").val();

    if (key && redirect) {
        $.post("/edit/", {
            key: key,
            redirect: redirect
        }).done(function() {
            location.reload();
        }).fail(function() {
            $("#redirect").addClass("is-invalid");
        });
    }
    else {
        $("#edit-key").addClass("is-invalid");
        $("#edit-redirect").addClass("is-invalid");
    }
});

$(document).delegate("#toggle", "click", function() {
    $.post("/toggle/", {
        key: $(this).data("key")
    }).done(function(resp) {
        location.reload();
    });
});

$(document).delegate("#delete", "click", function() {
    $.post("/delete/", {
        key: $(this).data("key")
    }).done(function(resp) {
        location.reload();
    });
});

$(document).delegate("input", "input", function() {
    $("#username").removeClass("is-invalid");
    $("#password").removeClass("is-invalid");
})

$(document).delegate("#close", "click", function() {
    $("#key").val("");
    $("#redirect").val("");
});

$(document).delegate("#cancel", "click", function() {
    $("#edit-key").val("");
    $("#edit-redirect").val("");
});