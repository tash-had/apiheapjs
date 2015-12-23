function apiheap(source, key) {
    SOURCE_ID = source.toLowerCase();
    if (SOURCE_ID === "reddit") {
        this.reddit = function(subreddit, params, reqItem) {
            this.SOURCE_NAME = subreddit;
            this.FINAL_URL = "http://www.reddit.com/r/" + this.SOURCE_NAME;

        }

    } else if (SOURCE_ID === "tumblr") {
        this.SOURCE_KEY = key;
        this.tumblr = function(tumblr_url, reqItem) {
            this.SOURCE_NAME = tumblr_url;
        }

    } else if (SOURCE_ID === "bitly") {
        this.SHORT_URL;
        this.SOURCE_KEY = key;
        var bitly_frame = "https://api-ssl.bitly.com/v3/shorten?access_token=" + this.SOURCE_KEY + "&";
        this.bitly = function(link) {
            this.SOURCE_NAME = link;
            this.FINAL_URL = bitly_frame + "longUrl=" + encodeURIComponent(this.SOURCE_NAME) + "&format=json";
            try {
                /*
                Set Ajax Response to this.RESPONSE. --This is a workaround to be able to return the link to the user without an undefined value.
                User can send response to bitlyLinkParse(); 
                */ //
                this.RESPONSE = $.ajax({
                    url: this.FINAL_URL,
                    dataType: 'json',
                    type: 'GET',
                    cache: false
                });

            } catch (err) {
                errorHandle("bitly request error");
            }
        }
    } else {
        errorHandle("invalid source");
    }
}
//Take JSON Response from BitLy and fetch link 
function bitlyLinkParse(bitly_json_data) {
    var bitly_response = JSON.parse(bitly_json_data.responseText);
    return bitly_response.data.url;
}
//Handle Errors 
function errorHandle(errMessage) {
    alert("APIHEAP ERROR: " + errMessage);
}

/*
** BITLY https://bitly.com/a/oauth_apps 
PARAMS: oathkey, longlink

var myVar = new apiheap("bitly", "api_token"); 
myVar.bitly("long_url");
function onClickMe(){
	bitlyLinkParse(myVar.RESPONSE);
}
*NOTE: CALL AFTER AN ACTION EG.BUTTON PRESS. OTHERWISE VALUE = null. 
*/