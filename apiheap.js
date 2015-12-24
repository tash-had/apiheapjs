isUndefined = function(value) {
    if (typeof(value) === 'undefined' || value === null || value === 'null') {
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
            case "post_total":
                return tumblrResponse.total_posts;
                break;

                //Returns array of direct links to all images for each post in JSON data
            case "post_photo_urls":
                return tumblrPostParse(tumblrResponse, null, true);
                break;

                //Returns array of captions to photos in JSON data 
            case "post_captions":
                return tumblrPostParse(tumblrResponse, "caption");
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

                //Returns an array of tag arrays. Tag arrays are arrays containing all the tags given a post in JSON data 
            case "post_tags":
                return tumblrPostParse(tumblrResponse, "tags");
                break;

                //Returns an array with the id of each post in JSON data 
            case "post_id":
                return tumblrPostParse(tumblrResponse, "id");
                break;

                //Returns an array of links for origin of shared/reblogged posts in JSON data. ie. Source of reblogged content 
            case "post_source":
                return tumblrPostParse(tumblrResponse, "source_url");
                break;

                //Returns array of links attatched to a post (link posts); 
            case "post_link":
                return tumblrPostParse(tumblrResponse, "url");
                break;

                //Returns array of body from TEXT posts in JSON data 
            case "post_body":
                return tumblrPostParse(tumblrResponse, "body");
                break;

                //Returns an array of titles from posts in JSON data 
            case "post_title":
                return tumblrPostParse(tumblrResponse, "title");
                break;

                //Returns an array of text from QUOTE posts in JSON data 
            case "post_quote_text":
                return tumblrPostParse(tumblrResponse, "text");
                break;

                //Returns an array of dialogue arrays. Dialogue arrays are a set of objects, each object as a line in the dialogue 
            case "post_chats":
                return tumblrPostParse(tumblrResponse, "dialogue");
                break;

                //Returns an array of image links to album art for AUDIO posts in JSON data 
            case "post_audio_art":
                return tumblrPostParse(tumblrResponse, "album_art");
                break;

                //Returns an array of artist names for AUDIO posts in JSON data 
            case "post_audio_artist":
                return tumblrPostParse(tumblrResponse, "artist");
                break;

                //Returns an array of HTML embed links to for AUDIO psots in JSON data
            case "post_audio_embed":
                return tumblrPostParse(tumblrResponse, "embed");
                break;

                //Returns an array of track names for AUDIO posts in JSON data 
            case "post_audio_track":
                return tumblrPostParse(tumblrResponse, "track_name");
                break;

                //Returns an array of durations in seconds for all VIDEO posts in JSON data 
            case "post_video_length":
                return tumblrPostParse(tumblrResponse, "duration");
                break;

                //Returns an array of image links for the thumbnails of each VIDEO post in JSON data 
            case "post_video_thumb":
                return tumblrPostParse(tumblrResponse, "thumbnail_url");
                break;

                //Returns an array of direct links for each VIDEO post in JSON data 
            case "post_video_url":
                return tumblrPostParse(tumblrResponse, "video_url");
                break;

                //Array of answers for ANSWER posts in JSON data. Note: If an answer post is reblogged, answers will contain HTML formatting showing author.  
            case "post_answers_ans":
                return tumblrPostParse(tumblrResponse, "answer");
                break;

                //Array of askers for ANSWER posts in JSON data 
            case "post_answers_asker":
                return tumblrPostParse(tumblrResponse, "asking_name");
                break;

                //Array of the tumblr URLs of askers for ANSWER posts in JSON data
            case "post_answers_asker_url":
                return tumblrPostParse(tumblrResponse, "asking_url");
                break;

                //Returns array of questions asked for all ANSWER posts in JSON data
            case "post_answers_question":
                return tumblrPostParse(tumblrResponse, "question");
                break;

                //Invalid itemReq
            default:
                errorHandle("tumblr item request error");
                break;
        }
    }
}

function html_strip(html_to_strip) {
    return jQuery('<p>' + html_to_strip + '</p>').text();
}

function tumblrPostParse(json_data, property, photo_parse) {
    var RETURN_VALUE = [];
    try {
        $(json_data.posts).each(function(index, value) {
            if (photo_parse) {
                $(value).each(function(idx, val) {
                    RETURN_VALUE.push(val.photos[0].original_size.url);
                });
            } else {
                RETURN_VALUE.push(value[property]);
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
