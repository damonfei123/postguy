$(function(){
    var i = 1;
    var cookieKey   = 'postkey';
    var $buildParam = $('#buildParam');
    var $queryParam = $('#queryParam');
    var $paramContainer = $('#paramContainer');
    var $clearParam     = $('#clearParam');
    var $querySingle    = $('#queryRes .single');
    var $showQueryRes   = $('#showQueryRes');
    var $submit         = $('#submit');
    var $url            = $('#url');
    var $query          = $('#query');
    var $querySec       = $('#querySec');
    var $queryCount     = $('#queryCount');
    var $hideRes        = $('#hideRes');
    var $queryContainer = $('#queryContainer');
    var interval        = null;


    var generateKey = function(sKey){
        var aKey = sKey.split(',');
        aKey    = aKey.unique();
        var sHtml = '', $old = $(), val = '';
        $.each(aKey, function(i, key){
            key = $.trim(key);
            if (key == '') {return false;};
            //如果之前老的key已经有了，那把值直接赋上
            $old = $('input.param[key="'+key+'"]');
            if ($old.length > 0) {
                val = $old.val();
            };

            sHtml += "<div class='row'>"+
                "<span class='item'>"+key+"</span>"+
                "<span>=</span>"+
                "<span><input type='text' key='"+key+"' class='param' value='"+val+"'></span>"+
                "</div>";
        });
        $paramContainer.html(sHtml);
    }


    $queryParam.keyup(function(event){
        var key = event.keyCode || event.which;
        if (key == 13) {
            $buildParam.trigger('click');
        };
    });

    /*初始化值*/
    $queryParam.val(getCookie(cookieKey));
    $url.val(getCookie('url'));
    $query.val(getCookie('query'));
    $querySec.val(getCookie('querySec',$querySec.val()));
    $queryCount.val(getCookie('queryCount', $queryCount.val()));

    $buildParam.click(function(){
        var key = $.trim($queryParam.val());
        if (key == '') {
            return false;
        };
        setCookie(cookieKey,key);//保存KEY

        generateKey(key);

    }).trigger('click');

    $clearParam.click(function(){
        $queryParam.val('');
        $paramContainer.html('');
        delCookie(cookieKey);
    });

    $('body').click(function(){
        hide($showQueryRes);
    });
    $showQueryRes.click(function(e){
        e.stopPropagation();
    });

    var timeout = null;
    $(document).on('click','.single',function(e){
        e.stopPropagation();
        if (timeout != null) {
            clearInterval(timeout);
        };
        var $this = $(this);
        timeout = setTimeout(function(){
            hide($showQueryRes);
            var key = $this.attr('key');
            show($showQueryRes,$('#'+key).html());
        }, 150);
    });

    /*发起请求*/
    $submit.click(function(){
        var url     = $url.val();
        var query   = $query.val();
        var querySec= $querySec.val();
        var queryCount = $queryCount.val();
        var data    = getParamData();
        if (url == '' || query == '' || querySec == '' || queryCount == '') {
            var html = "<h3 class='red'>请求地址、请求频率都不得为空哦，请检查!!!</h3>";
            show($showQueryRes, html);
            return false;
        };
        if (!/^http:\/\//.test(url)) {
            url     = "http://" + url;
        };
        $(this).disable('请求中..');
        //都存储cookie
        batchSetCookie({
            url     : url,
            query   : query,
            querySec: querySec,
            queryCount: queryCount
        });

        var times = queryCount == 0 ? 9999 : queryCount;

        if (times == 1) {
            ajax(url, query, data, times, true);
        }else{
            interval = setInterval(function(){
                ajax(url, query, data, times, true);
            }, querySec * 1000);
        };
    });

    var ajax = function(url, query, data, queryCount, decrease){
        if (i >= queryCount) {
            clearInterval(interval);
            $submit.enable('发起请求');
        };
        var startTime = (new Date()).valueOf();
        $.ajax({
            url : url,
            type : query,
            dataType : 'text',
            data : data,
            success: function(html){
                pasteRes(i, html, new Date().valueOf() - startTime, {
                    'url' : url,
                    'type': query,
                    'data': data
                });
                if (queryCount == 1) {
                    $queryContainer.find('.single:last').trigger('click');
                };
                if (decrease) { i++; };
            },
            error:function(){
                var html = "<h3 style='color: red;'>请求异常</h3>"+
                "<div class='resRow'>1、请检查URL是否正确</div>"+
                "<div class='resRow'>2、请检查是否跨域，如果是，请在服务器端设置header('Access-Control-Allow-Origin: *');允许跨域请求,<span class='red'>设置后请注意上线前删除，严禁提交!!!</span></div>"+
                "<div class='resRow'>3、请检查接口是否异常</div>"+
                "<div class='resRow'>4、有可能是postguy生病了，请免费为其治疗，或者联系damon哦^_^</div>";
                show($showQueryRes, html);
            }
        });
    }

    var pasteRes = function(i, html, useTime, param){
        var sRes = "<div key='key"+i+"' class='single'><a href='javascript: void(0)'>第"+
            i +"次请求,用时"+useTime+"毫秒</a></div>";
        var Res = $(sRes);
        $('#queryContainer').append(Res);
        //将结果存储到页面的隐藏表单里
        var sSaveHTML = "<div class='resRow'>请求地址:"+param.url +"</div><div class='resRow'>" +
            "请求方式:"+param.type + "</div><div class='resRow'>" +
            "请求参数:" + getJsonToStr(param.data) + '</div>';
        $("<div id='key"+i+"'>"+sSaveHTML +"<h3>返回结果:</h3><div class='resRow retRes'>" + "</div></div>").appendTo($hideRes);
        $hideRes.find('.retRes').html(html);
    }

    var getJsonToStr = function(json){
        var str = '{';
        $.each(json,function(key, val){
            str += '"' + key + '":"' + val + '",';
        });
        str = str.substring(0,str.length-1);
        str += '}';
        return str.length == 1 ? '' : str;
    }

    var getParamData = function(){
        var data = {}, key='',val='';
        $.each($paramContainer.find('input.param'),function(i,obj){
            key = $(obj).attr('key');
            val = $(obj).val();
            data[key] = val;
        });
        return data;
    }

    $.fn.disable = function (text){
        $(this).attr('disabled','disabled').text(text);
    }
    $.fn.enable = function (text){
        $(this).removeAttr('disabled').text(text);
    }
});
