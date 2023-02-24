function startMove(obj,json,fn){
    clearInterval(obj.timers);
    obj.timers=setInterval(function(){
        var now='';
        var onStop=true;
        for(attr in json){
            if(attr=='opacity'){
                now=parseInt(parseFloat(getStyle(obj,attr))*100);
            } else {
                now=parseInt(getStyle(obj,attr));
            }
            var speed=(json[attr]-now)/3; 
            speed=speed>0?Math.ceil(speed):Math.floor(speed);
            if(now!=json[attr]){
                onStop=false;
            }
            if(attr=='opacity'){
                obj.style[attr]=(now+speed)/100;
            } else {
                obj.style[attr]=now+speed+'px';
            }
        }
        if(onStop){
            clearInterval(obj.timers);
            if(fn){
                fn();
            }
        }
    },50);
}
function getStyle(obj,attr){
	if(obj.currentStyle){
		return obj.currentStyle(attr);
	} else {
		return getComputedStyle(obj,false)[attr];
	}
}
        
        
        