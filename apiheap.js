var SOURCE_ID; 
var SOURCE_NAME; 
var SOURCE_KEY; 
var SOURCE_REQ_ITEM; 
var RETURN_VAL = []; 

function apiheap1(source, name, key, reqItem){
}

function apiheap(source){
	SOURCE_ID = source.toLowerCase(); 
	if(SOURCE_ID === "reddit"){
		this.reddit = function(subreddit, reqItem){

		}

	}else if(SOURCE_ID==="tumblr"){
		this.tumblr = function(tumblr_url, key, reqItem){

		}

	}else if(SOURCE_ID==="bitly"){
		this.bitly = function(key, link){
			
		}
	}else{
		return "APIHEAP SOURCE ERROR."; 
	}
}

var x = new apiheap("reddit");
//document.write(x.apiheapReq("yee")); 


