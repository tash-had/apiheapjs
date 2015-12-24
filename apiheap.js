isUndefined = function(value) {
    if (typeof(value) === 'undefined' || value === null) {
        return true;
    } else {
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
            if (isUndefined(reqItem)) {
                if (isUndefined(opt_params)) {
                    this.FINAL_URL = tumblr_frame + "/posts/?api_key=" + this.SOURCE_KEY;
                } else {
                    this.OPT_PARAMS = opt_params;
                    this.FINAL_URL = tumblr_frame + "/posts/?api_key=" + this.SOURCE_KEY + "&" + this.OPT_PARAMS;
                }
            } else {
                this.REQ_ITEM = reqItem;
                if (isUndefined(opt_params)) {
                    this.FINAL_URL = tumblr_frame + "/posts/" + this.REQ_ITEM + "?api_key=" + this.SOURCE_KEY;
                } else {
                    this.OPT_PARAMS = opt_params;
                    this.FINAL_URL = tumblr_frame + "/posts/" + this.REQ_ITEM + "?api_key=" + this.SOURCE_KEY + "&" + this.OPT_PARAMS;
                }
            }
            try {
                this.RESPONSE = $.ajax({
                    url: this.FINAL_URL,
                    type: 'POST',
                    dataType: 'jsonp',
                    cache: false
                });
            } catch (err) {
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

function tumblrParse(tumblr_json_data, item) {
    var tumblrResponse = tumblr_json_data.responseJSON.response;
    var itemReq = item;

    if (isUndefined(itemReq)) {
        //returns array of blog-post objects
        return tumblrResponse.posts;
    } else {
        switch (itemReq) {
            //Returns object with blog info 
            case "blog_info":
                return tumblrResponse.blog;
                break;

                //Returns number of total posts 
            case "total_posts":
                return tumblrResponse.total_posts;
                break;

                //Returns array of direct links to all images for each post in JSON data
            case "photo_urls":
                return tumblrPostParse(tumblrResponse, null, true);
                break;

                //Returns array of captions to photos in JSON data 
            case "photo_captions":
                return tumblrPostParse(tumblrResponse, "caption", false, true);
                break;

                //Returns array of slugs for each post in JSON data
            case "post_slugs":
                return tumblrPostParse(tumblrResponse, "slug");
                break;

                //Returns array of links to posts in JSON data
            case "post_urls":
                return tumblrPostParse(tumblrResponse, "post_url");
                break;

                //Returns an array of the type of each post in JSON data
            case "post_types":
                return tumblrPostParse(tumblrResponse, "type");
                break;

                //Returns an array of the publish date of each post in JSON data
            case "post_dates":
                return tumblrPostParse(tumblrResponse, "date");
                break;

                //Returns an array of the note count on each post in JSON data 
            case "post_notes":
                return tumblrPostParse(tumblrResponse, "note_count");
                break;

                //Returns an array of SHORT links for each post in JSON data
            case "post_url_short":
                return tumblrPostParse(tumblrResponse, "short_url");
                break;

                //Returns an array of SHORT 
            case "post_summaries":
                return tumblrPostParse(tumblrResponse, "summary");
                break;

                //Returns an array with the timestamp of each post in JSON data 
            case "post_timestamp":
                return tumblrPostParse(tumblrResponse, "timestamp");
                break;

                //Returns an array with the id of each post in JSON data 
            case "post_id":
                return tumblrPostParse(tumblrResponse, "id");
                break;

                //Invalid itemReq
            default:
                errorHandle("tumblr item request error");
                break;
        }
    }
}

function tumblrPostParse(json_data, property, photo_parse, html_strip) {
    var RETURN_VALUE = [];
    try {
        $(json_data.posts).each(function(index, value) {
            if (photo_parse) {
                $(value).each(function(idx, val) {
                    RETURN_VALUE.push(val.photos[0].original_size.url);
                });
            } else {
                if (html_strip) {
                    var bare_text = jQuery('<p>' + value[property] + '</p>').text();
                    RETURN_VALUE.push(bare_text);
                } else {
                    RETURN_VALUE.push(value[property]);
                }
            }
        });
    } catch (err) {} finally {
        return RETURN_VALUE;
    }
}

//Handle Errors 
function errorHandle(errMessage) {
    alert("APIHEAP ERROR: " + errMessage);
}