
$(document).ready(function() {
    /* Contact Form
     -----------------------------------------------------*/

    var $contactForm = $('#contact-form');

    $contactForm.validate({
        rules: {
            name: {
                required: true,
                minlength: 1
            },
            email: {
                required: true,
                email: true
            },
            message: {
                required: true,
                minlength: 10
            }
        },
        messages: {
            name: {
                required: "Please enter your name."
            },
            email: {
                required: "Please enter your email address."
            },
            message: {
                required: "Please enter a message."
            }
        }
    });

// Send the email
    $contactForm.submit(function () {
        var $success = '<strong>Success!</strong> Your message was sent.';
        var $error = '<strong>Error!</strong> Your message was not sent - try again later...';
        var response;
        if ($contactForm.valid()) {
            $.ajax({
                type: "POST",
                url: "contact",
                data: $(this).serialize(),
                success: function (msg) {
                    if (msg === 'SEND') {
                        response = '<div class="alert alert-success">' + $success + '</div>';
                    }
                    else {
                        response = '<div class="alert alert-warning">' + $error + '</div>';
                    }
                    $(".alert-error,.alert-success").remove();
                    $contactForm.prepend(response);
                }
            });
            return false;
        }
        return false;
    });
});