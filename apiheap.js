isUndefined = function (value){
	if(typeof(value)==='undefined' || value===null){
		return true; 
	}else{
		return false; 
	}
}
function apiheap(source, key) {
	SOURCE_ID = source.toLowerCase();
	if (SOURCE_ID === "reddit") {
		this.reddit = function(subreddit, params, reqItem) {
			this.SOURCE_NAME = subreddit;
			this.FINAL_URL = "http://www.reddit.com/r/" + this.SOURCE_NAME;
		}
    } else if (SOURCE_ID === "tumblr") { //REQ ITEM AND OPT_PARAMS IS NULLABLE
    	this.SOURCE_KEY = key;
    	this.tumblr = function(tumblr_url, reqItem, opt_params) {
    		this.SOURCE_NAME = tumblr_url;
    		var tumblr_frame = "api.tumblr.com/v2/blog/" + this.SOURCE_NAME; 
    		if(isUndefined(reqItem)){
    			if(isUndefined(opt_params)){
    				this.FINAL_URL = tumblr_frame + "/posts/?api_key=" + this.SOURCE_KEY; 
    			}else{
    				this.OPT_PARAMS = opt_params; 
    				this.FINAL_URL = tumblr_frame + "/posts/?api_key=" + this.SOURCE_KEY + "&" + this.OPT_PARAMS; 
    			}
    		}else{
    			this.REQ_ITEM = reqItem; 
    			if(isUndefined(opt_params)){
    				this.FINAL_URL = tumblr_frame + "/posts/" + this.REQ_ITEM + "?api_key=" + this.SOURCE_KEY; 
    			}else{
    				this.OPT_PARAMS = opt_params; 
    				this.FINAL_URL = tumblr_frame + "/posts/" + this.REQ_ITEM + "?api_key=" + this.SOURCE_KEY + "&" + this.OPT_PARAMS;  
    			}
    		}
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
function bitlyParse(bitly_json_data) {
	var bitly_response = JSON.parse(bitly_json_data.responseText);
	return bitly_response.data.url;
}

//Handle Errors 
function errorHandle(errMessage) {
	alert("APIHEAP ERROR: " + errMessage);
}


/*
CONTENTS: 
REDDIT
TUMBLR
BITLY 
** BITLY https://bitly.com/a/oauth_apps 
PARAMS: oathkey, longlink

var bitlyObj = new apiheap("bitly", "auth_token"), bitlyLink; 
bitlyObj.bitly("long_link"); 
function myFunction(){
	bitlyLink = bitlyParse(bitlyObj.RESPONSE); 
}

*NOTE: CALL AFTER AN ACTION EG.BUTTON PRESS. OTHERWISE VALUE = null. 
*/