Array.prototype.unique = function()
{
    this.sort();
    var re=[this[0]];
    for(var i = 1; i < this.length; i++) {
        if( this[i] !== re[re.length-1]) {
            re.push(this[i]);
        }
    }
    return re;
};



function setCookie(name,value)//两个参数，一个是cookie的名子，一个是值
{
    var Days = 1; //此 cookie 将被保存 1 天
    var exp  = new Date();    //new Date("December 31, 9998");
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}
function batchSetCookie(data){
    $.each(data, function(key,item){
        setCookie(key, item);
    });
}
function getCookie(name)//取cookies函数
{
    var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
    if(arr != null) return unescape(arr[2]); return '';
}
function delCookie(name)//删除cookie
{
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null) document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}

var time = 100;
function show($item, html) {
    $item.html(html);
    $item.animate({
        'right':0,
    }, time);
}

function hide($item) {
    var width   = $item.width();
    $item.animate({
        'right': -(width + 40) +'px'
    }, time);
}
