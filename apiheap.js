/*
 *
 *TITLE: Apiheap.js : JavaScript Library 
 *AUTHOR: Tash-had Saqif | tash-had.com 
 *PROJECT: tash-had.github.io/apiheapjs 
 *
 */


// Function to check if value is undefined/empty
isUndefined = function(value) {
    if (typeof(value) === 'undefined' || value === null || value === 'null' || value === undefined) {
        return true;
    } else {
        return false;
    }
}

// Main class 
function apiheap(source, key) {
    SOURCE_ID = source.toLowerCase();
    if (SOURCE_ID === "reddit") {
        this.reddit = function(subreddit, listing, opt_params) {
            this.SOURCE_NAME = subreddit;
            this.LISTING = listing;
            this.OPT_PARAMS = opt_params;
            var reddit_frame = "https://www.reddit.com/";

            if (!isUndefined(this.LISTING) && this.LISTING == "comments"){
                /**
                 * SUBREDDIT:
                 * Defaults to comments from /r/all if not specified.
                 * Format for OPT_PARAMS: QUERY + optional extras.
                 * cats&limit=80
                 * */
                this.SOURCE_NAME = (isUndefined(this.SOURCE_NAME) ? this.SOURCE_NAME = "" : "subreddit=" +
                    this.SOURCE_NAME);
                reddit_frame = "https://api.pushshift.io/reddit/search/comment?" + this.SOURCE_NAME + "&q=" +
                    this.OPT_PARAMS;
                this.FINAL_URL = reddit_frame;
            }else{
                if (isUndefined(this.SOURCE_NAME)) {
                    if (isUndefined(this.LISTING)) {
                        this.FINAL_URL = reddit_frame + ".json";
                    }else {
                        if (isUndefined(this.OPT_PARAMS)) {
                            this.FINAL_URL = reddit_frame + this.LISTING + "/.json";
                        } else {
                            this.FINAL_URL = reddit_frame + this.LISTING + "/.json?" + this.OPT_PARAMS;
                        }
                    }
                } else {
                    if (isUndefined(this.LISTING)) {
                        this.FINAL_URL = reddit_frame + "r/" + this.SOURCE_NAME + "/.json";
                    } else {
                        if (isUndefined(this.OPT_PARAMS)) {
                            this.FINAL_URL = reddit_frame + "r/" + this.SOURCE_NAME + "/" + this.LISTING + "/.json";
                        } else {
                            this.FINAL_URL = reddit_frame + "r/" + this.SOURCE_NAME + "/" + this.LISTING + "/.json?" + this.OPT_PARAMS;
                        }
                    }
                }
            }

            this.RESPONSE = apiRequest('json', this.FINAL_URL);
        }
        this.parse = function(item) {
            var RETURN_VALUE = [],
                reddit_json_data = this.RESPONSE,
                itemReq = item;
            try {
                if (isUndefined(itemReq)) {
                    RETURN_VALUE = reddit_json_data.responseJSON.data.children;
                } else {
                    if (itemReq == "comments"){
                        var data = reddit_json_data.responseJSON.data;
                        for(var i=0;i<data.length;i++){
                            RETURN_VALUE.push(data[i].body);
                        }
                    }else{
                        $(reddit_json_data.responseJSON.data.children).each(function(index, value) {
                            RETURN_VALUE.push(value.data[itemReq]);
                        });
                    }
                }
            } catch (err) {
                errorHandle("error| LOG:" + err + " ..." + "reddiit parse error");
            } finally {
                return RETURN_VALUE;
            }
        }
    } else if (SOURCE_ID === "tumblr") {
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
            this.RESPONSE = apiRequest('jsonp', this.FINAL_URL);
        }
        this.parse = function(item) {
            var tumblrResponse = this.RESPONSE.responseJSON.response,
                itemReq = item;
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
    } else if (SOURCE_ID === "bitly") {
        this.SOURCE_KEY = key;
        var bitly_frame = "https://api-ssl.bitly.com/v3/shorten?access_token=" + this.SOURCE_KEY + "&";
        this.bitly = function(link) {
            this.SOURCE_NAME = link;
            this.FINAL_URL = bitly_frame + "longUrl=" + encodeURIComponent(this.SOURCE_NAME) + "&format=json";
            this.RESPONSE = apiRequest('json', this.FINAL_URL);
        }
        this.parse = function() {
            var bitly_response = JSON.parse(this.RESPONSE.responseText);
            return bitly_response.data.url;
        }
    } else if (SOURCE_ID === "imgur") {
        this.SOURCE_KEY = key;
        this.imgur = function(tag_name, opt_params, topic) {
            this.TAG = tag_name;
            this.OPT_PARAMS = opt_params;
            this.TOPIC = topic;

            if (isUndefined(tag_name) && isUndefined(opt_params) && isUndefined(topic)) {
                this.TOPIC = true;
            } else {
                if (topic) {
                    if (isUndefined(this.OPT_PARAMS)) {
                        this.FINAL_URL = "https://api.imgur.com/3/topics/" + this.TAG;
                    } else {
                        this.FINAL_URL = "https://api.imgur.com/3/topics/" + this.TAG + "/" + this.OPT_PARAMS;
                    }
                } else {
                    if (isUndefined(this.TAG)) {
                        if (isUndefined(this.OPT_PARAMS)) {
                            this.FINAL_URL = "https://api.imgur.com/3/gallery/";
                        } else {
                            this.FINAL_URL = "https://api.imgur.com/3/gallery/" + this.OPT_PARAMS;
                        }
                    } else {
                        if (isUndefined(this.OPT_PARAMS)) {
                            this.FINAL_URL = "https://api.imgur.com/3/gallery/t/" + this.TAG;
                        } else {
                            this.FINAL_URL = "https://api.imgur.com/3/gallery/t/" + this.TAG + "/" + this.OPT_PARAMS;
                        }
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
                    errorHandle("error| LOG:" + err + " ..." + "imgur request error");
                }
            }
        }
        this.parse = function(itemReq) {
            var RETURN_VALUE = [],
                topic = this.TOPIC,
                imgur_api_response = this.RESPONSE;
            if (isUndefined(itemReq)) {
                if (!topic || isUndefined(topic)) {
                    return imgur_api_response.responseJSON.data.items;
                } else {
                    return imgur_api_response.responseJSON.data;
                }
            } else {
                try {
                    if (!topic || isUndefined(topic)) {
                        $(imgur_api_response.responseJSON.data.items).each(function(index, value) {
                            $(value).each(function(idx, val) {
                                RETURN_VALUE.push(val[itemReq]);
                            });
                        });
                    } else {
                        $(imgur_api_response.responseJSON.data).each(function(index, value) {
                            $(value).each(function(idx, val) {
                                RETURN_VALUE.push(val[itemReq]);
                            });
                        });
                    }
                } catch (err) {} finally {
                    return RETURN_VALUE;
                }
            }
        }
    } else if (SOURCE_ID === "youtube") {
        this.SOURCE_KEY = key;
        this.youtube = function(type, part, opt_params, page_token) {
            this.TYPE = type;
            this.PART = part;
            this.OPT_PARAMS = opt_params;
            this.PAGE_TOKEN = page_token;

            if (isUndefined(this.TYPE) || isUndefined(this.PART)) {
                errorHandle("error| LOG: youtube request error: type and part parameters are required");
            } else {
                var youtube_frame = "https://www.googleapis.com/youtube/v3/" + this.TYPE + "?part=" + this.PART + "&key=" + this.SOURCE_KEY;
                if (isUndefined(this.OPT_PARAMS)) {
                    if (isUndefined(this.PAGE_TOKEN)) {
                        this.FINAL_URL = youtube_frame;
                    } else {
                        this.FINAL_URL = youtube_frame + "&pageToken=" + this.PAGE_TOKEN;
                    }
                } else {
                    if (isUndefined(this.PAGE_TOKEN)) {
                        this.FINAL_URL = youtube_frame + "&" + this.OPT_PARAMS;

                    } else {
                        this.FINAL_URL = youtube_frame + "&" + this.OPT_PARAMS + "&pageToken=" + this.PAGE_TOKEN;
                    }
                }
            }
            this.RESPONSE = apiRequest('json', this.FINAL_URL);
        }
        this.parse = function(query_array, item) {
            if (isUndefined(item)) {
                errorHandle("youtube parse error: you must request an item as a parameter");
            } else {
                var youtube_data_array = query_array,
                    itemReq = item,
                    RETURN_VALUE = [];
                try {
                    $(youtube_data_array).each(function(idx, val) {
                        $(val.responseJSON.items).each(function(index, value) {
                            switch (itemReq) {
                                case "type":
                                    RETURN_VALUE.push(value.id.kind);
                                    break;

                                case "vid_links":
                                    if (value.id.videoId != undefined) {
                                        RETURN_VALUE.push("https://www.youtube.com/watch?v=" + value.id.videoId);
                                    } else {
                                        RETURN_VALUE.push("https://www.youtube.com/playlist?list=" + value.id.playlistId);
                                    }
                                    break;

                                case "vid_ids":
                                    if (value.id.videoId != undefined) {
                                        RETURN_VALUE.push(value.id.videoId);

                                    } else {
                                        RETURN_VALUE.push(value.id.playlistId);
                                    }
                                    break;

                                case "vid_dates":
                                    RETURN_VALUE.push(value.snippet.publishedAt);
                                    break;

                                case "vid_titles":
                                    RETURN_VALUE.push(value.snippet.title);
                                    break;

                                case "vid_thumbnails":
                                    RETURN_VALUE.push(value.snippet.thumbnails.high.url);
                                    break;

                                case "chan_links":
                                    RETURN_VALUE.push("https://www.youtube.com/channel/" + value.snippet.channelId);
                                    break;

                                case "chan_ids":
                                    RETURN_VALUE.push(value.snippet.channelId);
                                    break;

                                case "chan_names":
                                    RETURN_VALUE.push(value.snippet.channelTitle);
                                    break;

                                case "vid_descriptions":
                                    RETURN_VALUE.push(value.snippet.description);
                                    break;
                            }
                        });
                    });
                } catch (err) {
                    errorHandle("youtube parse error");
                } finally {
                    return RETURN_VALUE;
                }
            }
        }
    } else if (SOURCE_ID === "openweathermap") {
        this.SOURCE_KEY = key;
        this.weather = function(city, custom) {
            this.CITY = city;
            this.CUSTOM = custom;

            if (isUndefined(this.CUSTOM)) {
                if (isUndefined(this.CITY)) {
                    errorHandle("openweathermap error: missing perams");
                } else {
                    this.FINAL_URL = "http://api.openweathermap.org/data/2.5/weather?q=" + this.CITY + "&appid=" + this.SOURCE_KEY;
                }
            } else {
                this.FINAL_URL = "http://api.openweathermap.org/data/2.5/weather?" + this.CUSTOM + "&appid=" + this.SOURCE_KEY;
            }
            this.RESPONSE = apiRequest('json', this.FINAL_URL);
        }
        this.parse = function(item) {
            var weather_json_data = this.RESPONSE,
                itemReq = item;

            if (isUndefined(itemReq)) {
                return weather_json_data.responseJSON;
            } else {
                if (itemReq === "weather") {
                    return weather_json_data.responseJSON[itemReq][0].description;
                } else {
                    return weather_json_data.responseJSON[itemReq];
                }
            }
        }

    } else {
        errorHandle("error| LOG: invalid source");
    }
}

//Function to perform API requests and return response 
function apiRequest(format, FINAL_URL) {
    var response;
    try {
        response = $.ajax({
            url: FINAL_URL,
            dataType: format,
            type: 'GET',
            cache: false
        });
    } catch (err) {
        errorHandle("Request Error. Log| " + err);
    } finally {
        return response;
    }
}

// Function to handle errors
function errorHandle(errMessage) {
    console.log(errMessage); 
}

// Function to strip html tags from data
function html_strip(html_to_strip) {
    return jQuery('<p>' + html_to_strip + '</p>').text();
}

// Function to ensure a list of values does not contain duplicate data
function preventDuplicate(testValue, testArray) {
    if (testArray.indexOf(testValue) === -1 && testValue !== 'undefined' && testValue !== undefined &&
        testValue !== 'default' && typeof(testValue) !== undefined && testValue !== 'null' && testValue !== null) {
        return true;
    } else {
        return false;
    }
}

// Function to handle pagnations for YouTube requests
function pageToken(json_data) {
    return json_data.responseJSON.nextPageToken;
}
