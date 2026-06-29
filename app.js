// Guzo Go International Travel & Visa Consultancy

document.addEventListener("DOMContentLoaded", function () {

    const button = document.querySelector(".btn");

    if (button) {
        button.addEventListener("click", function (e) {
            e.preventDefault();

            // Go to application page
            window.location.href = "apply.html";
        });
    }

});
