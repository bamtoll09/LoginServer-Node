var checkPasswordAtSignUp = function() {
    var inputPass = document.getElementById("pass");
    var inputRePass = document.getElementById("re-pass");
    var btnSubmit = document.getElementById("submit");

    if (inputPass) {
        inputPass.onkeyup = function() {
            if ( inputPass.value === inputRePass.value ) {
                btnSubmit.disabled = false;
                console.log("true");
            } else {
                btnSubmit.disabled = true;
                console.log("false");
            }
        } 
        inputRePass.onkeyup = function() {
            if ( inputPass.value === inputRePass.value ) {
                btnSubmit.disabled = false;
                console.log("true");
            } else {
                btnSubmit.disabled = true;
                console.log("false");
            }
        }
    }
}

var init = function() {
    checkPasswordAtSignUp();
}

window.onload = init;