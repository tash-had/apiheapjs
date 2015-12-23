var SHORT_URL = null;


function apiheap(source) {
    SOURCE_ID = source.toLowerCase();
    if (SOURCE_ID === "reddit") {
        this.reddit = function(subreddit, params, reqItem) {
            this.SOURCE_NAME = subreddit;
            this.FINAL_URL = "http://www.reddit.com/r/" + this.SOURCE_NAME;

        }

    } else if (SOURCE_ID === "tumblr") {
        this.tumblr = function(tumblr_url, key, reqItem) {
            this.SOURCE_NAME = tumblr_url;
            this.SOURCE_KEY = key;
        }

    } else if (SOURCE_ID === "bitly") {
        this.bitly = function(key, link) {
            this.SOURCE_NAME = link;
            this.SOURCE_KEY = key;
            var bitly_frame = "https://api-ssl.bitly.com/v3/shorten?access_token=" + this.SOURCE_KEY + "&";
            this.FINAL_URL = bitly_frame + "longUrl=" + encodeURIComponent(this.SOURCE_NAME) + "&format=json";
            try {
                $.ajax({
                    url: this.FINAL_URL,
                    dataType: 'json',
                    type: 'GET',
                    cache: false,
                    success: function(data) {
                        $(data.data).each(function(index, value) {
                            SHORT_URL = "http://bit.ly/" + value.hash;
                        });
                    }
                });
            } catch (err) {
                errorHandle("bitly request error");
            }

        }
    } else {
        errorHandle("invalid source");
    }
}

function errorHandle(errMessage) {
    alert("APIHEAP ERROR: " + errMessage);
}


/*
** BITLY https://bitly.com/a/oauth_apps 
PARAMS: oathkey, longlink

var myVar = new apiheap("bitly"); 
myVar.bitly("auth_token", "long_link");
function onClickMe(){
	document.write(SHORT_URL); 
} 

*NOTE: CALL AFTER AN ACTION EG.BUTTON PRESS. OTHERWISE VALUE = null. 
*/