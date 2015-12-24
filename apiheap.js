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
    } else if (SOURCE_ID === "tumblr") { //REQ ITEM AND OPT_PARAMS IS NULLABLE..can set them as nothing 
    	this.SOURCE_KEY = key;
    	this.tumblr = function(tumblr_url, reqItem, opt_params) {
    		this.SOURCE_NAME = tumblr_url;
    		var tumblr_frame = "http://api.tumblr.com/v2/blog/" + this.SOURCE_NAME; 
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
    		try{
    			this.RESPONSE = $.ajax({
    				url: this.FINAL_URL,
    				type: 'POST',
    				dataType: 'jsonp',
    				cache: false 
    			});
    		}catch(err){
    			errorHandle("tumblr request error"); 
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
function tumblrParse(tumblr_json_data, item){
	var tumblrResponse = tumblr_json_data.responseJSON.response; 
	var itemReq = item; 

	if(isUndefined(itemReq)){
		return tumblrResponse.posts;
	}else{
		switch(itemReq){
			//Returns object with blog info 
			case "blog_info": 
			return tumblrResponse.blog; 
			break;

			//Returns number of total posts 
			case "total_posts": 
			return tumblrResponse.total_posts;
			break; 

			//Returns array of direct links to all images in JSON data
			case "photo_urls": 
			return tumblrPhotosParse(tumblrResponse); 
			break; 

			case "post_urls": 

			break; 

			case "post_titles": 
			break; 

			case "post_captions": 
			break; 

			case "post_titles": 
			break; 

			case "post_bodys": 
			break; 

			case "post_ids": 
			break; 

			case "photo_slugs": 
			break; 

			case "post_dates": 
			break; 

			default: 
			errorHandle("tumblr item request error"); 
			break; 
		}
	}
}

//Function to get all original size images 
function tumblrPhotosParse(json_data){
	var RETURN_VALUE = []; 
	try{
		$(json_data.posts).each(function(index, value){
			$(value).each(function(idx, val){
				RETURN_VALUE.push(val.photos[0].original_size.url);  
			});	
		});
	}catch(err){}
	finally{
		return RETURN_VALUE; 
	}
}


//Handle Errors 
function errorHandle(errMessage) {
	alert("APIHEAP ERROR: " + errMessage);
}

////////////////// Testing 



/*
CONTENTS: 
REDDIT
TUMBLR
BITLY 

-NOTE; create delay before running function
-NOTE: usage example; using multiple arrays 

parse object yourself or use a function 
** BITLY https://bitly.com/a/oauth_apps 
PARAMS: oathkey, longlink

BITLY USAGE 

var bitlyObj = new apiheap("bitly", "auth_token"), bitlyLink; 
bitlyObj.bitly("long_link"); 
function myFunction(){
	bitlyLink = bitlyParse(bitlyObj.RESPONSE); 
}


TUMBLR IMAGE USAGE
var x = new apiheap("tumblr", "tumblr_key"), z; 
x.tumblr("humansofnewyork.com", "photo", 'limit=10');
function myFunction(){
	z = tumblrParse(x.RESPONSE,"photo_urls"); 
	console.log(z); 
}
*NOTE: CALL AFTER AN ACTION EG.BUTTON PRESS. OTHERWISE VALUE = null. 
*/