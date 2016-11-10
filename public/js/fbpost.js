/**
 * Created by Poom2 on 11/11/2016.
 */
window.fbAsyncInit = function() {
    FB.init({
        appId      : '1538640013023390',
        xfbml      : true,
        version    : 'v2.8'
    });
    FB.AppEvents.logPageView();
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));



// $(document).ready(function() {
//     // Execute some code here
// });




function postFaceBook(){
    console.log('POST!!');
    var message = $('#debugFBpost').val();
    var postContent =
    {
        access_token: "1538640013023390|h1Rbu8ZEA9BOCes1bEY7N8BBOs4", // replace with the access_token that you got from the previous step
        message: message
    };

    FB.api('/me/feed', 'post', postContent, onPostingResult);
}


function onPostingResult(response)
{
    if (!response || response.error)
    {
        alert('FAILURE: '+response.error.message);
    }
    else
    {
        alert('SUCCESS!');
    }
}