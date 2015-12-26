function moreText(id, heightVal){
	$(id).css({
		"height" : heightVal
	});
}
function lessText(id){
	$(id).css({
		"height" : "auto"
	});
	count = count-1;
}