isUndefined = function(value) {
    if (typeof(value) === 'undefined' || value === null || value === 'null' || value === undefined) {
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
                    type: 'GET',
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
    } else if (SOURCE_ID === "imgur") {
        this.SOURCE_KEY = key;
        this.imgur = function(tag_name, opt_params, topic) {
            this.TAG = tag_name;
            this.OPT_PARAMS = opt_params;

            if (topic === true) {
                if (isUndefined(this.TAG)) {
                    errorHandle("imgur request error: you need to set a topic name");
                } else {
                    if (isUndefined(this.OPT_PARAMS)) {
                        this.FINAL_URL = "https://api.imgur.com/3/topics/" + this.TAG;
                    } else {
                        this.FINAL_URL = "https://api.imgur.com/3/topics/" + this.TAG + "/" + this.OPT_PARAMS;
                    }
                }
            } else {
                if (isUndefined(this.TAG)) {
                    this.FINAL_URL = "https://api.imgur.com/3/gallery/";
                } else {
                    this.FINAL_URL = "https://api.imgur.com/3/gallery/t/" + this.TAG;
                }
                if (!isUndefined(this.OPT_PARAMS)) {
                    this.FINAL_URL = this.FINAL_URL + "/" + this.OPT_PARAMS;
                }
            }
            try {
                this.RESPONSE = $.ajax({
                    url: this.FINAL_URL,
                    dataType: 'json',
                    type: 'GET',
                    cache: false,
                    headers: {
                        "Authorization": "Client-ID " + this.SOURCE_KEY
                    }
                });
            } catch (err) {
                errorHandle("imgur request error");
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
        return tumblrResponse.posts;
    } else {
        if (itemReq === "blog_info") {
            return tumblrResponse.blog;
        } else if (itemReq === "total_posts") {
            return tumblrResponse.total_posts;
        } else {
            var RETURN_VALUE = [];
            try {
                $(tumblrResponse.posts).each(function(index, value) {
                    if (itemReq === "photos_url") {
                        $(value).each(function(idx, val) {
                            RETURN_VALUE.push(val.photos[0].original_size.url);
                        });
                    } else {
                        RETURN_VALUE.push(value[itemReq]);
                    }
                });
            } catch (err) {} finally {
                return RETURN_VALUE;
            }
        }
    }
}

function imgurParse(json_data, itemReq) {
    var RETURN_VALUE = [];
    var imgur_api_response = json_data;
    try {
        $(imgur_api_response.responseJSON.data).each(function(index, value) {
            $(value).each(function(idx, val) {
                RETURN_VALUE.push(val[itemReq]);
            });
        });
    } catch (err) {} finally {
        return RETURN_VALUE;
    }
}

function errorHandle(errMessage) {
    alert("APIHEAP ERROR: " + errMessage);
}

function html_strip(html_to_strip) {
    return jQuery('<p>' + html_to_strip + '</p>').text();
}
