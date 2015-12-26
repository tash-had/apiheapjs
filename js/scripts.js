var count=0; 
function moreText(id){
	if(count==0){
		$(id).css({
			"height" : "750px"
		});
		count=count+1;
	}else{
		$(id).css({
			"height" : "auto"
		});
		count = count-1;
	}
}