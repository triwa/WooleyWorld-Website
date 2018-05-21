let apiDomain = "http://localhost:60417/api/";

//initialize page
document.addEventListener( "DOMContentLoaded", function ( event ) {
    fillTable();
});

function fillTable() {
    let request = new XMLHttpRequest();
    request.open( "GET", apiDomain + "administrators" );
    request.send();

    request.onload = function () {
        let response = JSON.parse( request.responseText );

        for ( var i = 0; i < response.length; i++ ) {
            document.querySelector( "tbody" ).insertAdjacentHTML( "beforeend", `
                <tr>
                    <td>`+ response[i] + `</td>
                    <td><button onclick="removeAdmin(this)" value="`+response[i]+`">Remove</button></td>
                </tr>
            `);
        }
    };
}

function removeAdmin( sender ) {
    let request = new XMLHttpRequest();
    request.open( "DELETE", apiDomain + "administrators/" + sender.value);
    request.send();

    //remove row from table
    request.onload = sender.parentElement.parentElement.remove();
}

function addAdmin( form ) {
    let request = new XMLHttpRequest();
    request.open( "POST", apiDomain + "administrators" );
    request.setRequestHeader("Content-Type", "application/json");
    request.send(`
        {Admin_Username:"`+ form.newUsername.value + `",
         Admin_Password:"`+ form.newPassword.value + `"}
    `);

    //add row to table for new admin
    request.onload = function () {
        document.querySelector( "tbody" ).insertAdjacentHTML( "beforeend", `
            <tr>
                <td>`+ form.newUsername.value + `</td>
                <td><button onclick="removeAdmin(this)" value="`+ form.newUsername.value + `">Remove</button></td>
            </tr>
        `);
    }
}