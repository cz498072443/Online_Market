
var template = require('art-template');
var moment = require('moment');

template.config('base', '');
template.config('extname', '.html');
template.config('cache', false);

//模板配置

template.helper('plus', function (num1, num2) {
    return  num1 + num2;
});
template.helper('length', function (ary) {
    return  ary.length;
});

template.helper('substring', function (string, num1, num2) {
    return string.substring(num1, num2);
});

template.helper('obj2str', function (obj) {
    try{
        return obj.toString();
    }catch(e){
        return "";
    }
});

template.helper('obj2json', function (obj) {
    try{
        return JSON.stringify(obj);
    }catch(e){
        return "";
    }
});

template.helper('mod', function (num1,num2) {
    return  parseInt(num1) % parseInt(num2);
});

template.helper('parseInt', function (num1) {
    return  parseInt(num1);
});

template.helper('obj2date', function (obj, format) {
    if(!!obj){
        return  moment(obj).format(format)
    }else{
        return ""
    }

});

template.helper('json2str', function (json, format) {
    return  JSON.stringify(json);
});

template.helper('json2str4', function (json, format) {
    // console.log(json)
    return  JSON.stringify(json,null,4);
});

template.helper('regex', function (str, str1, str2) {

    if(typeof str1 == 'string' && typeof str2 == 'string')
    {
        return  str.replace( new RegExp(str1,'g'),str2);
    }else{
        return str;
    }
});


template.helper('toFixed', function (data,num) {
    if(typeof data == "number"){
        return  parseFloat(data).toFixed(2);
    }else{
        return '-'
    }

});


template.helper('toPlatformIcon', function (data, format) {
    if(data == "android"){
        return  '<i class="uk-icon-android uk-text-muted"></i>';
    }else  if(data == "ios"){
        return '<i class="uk-icon-apple uk-text-success"></i>';
    }

});


template.helper('truncate', function (string, number, bHide) {
    string = string.toString();
    if(string.length <=number )
        return string;
    else
        return  string.substring(0, number)+'…';
});


//渠道号显示成中文
template.helper('channelNumberToName', function (number, format) {

    //console.log(number,config.CHANNEL_CODE[number]);

    if(config.CHANNEL_CODE[number]){
        return config.CHANNEL_CODE[number];
    }else{
        return "未知";
    }

});

//微信商城 商品ID显示成中文名
template.helper('productId2GoodsBody', function (number, format) {
    return product2bodyDict[number];
});


//微信商城 商品ID显示成中文名
template.helper('version2name', function (versionid) {
    return version2nameDict[versionid];
});

//武将id转成中文名
template.helper('general2name', function (generalid) {
    return general2nameDict[generalid];
});


module.exports = template;