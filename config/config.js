/**
 * Created by chen on 2016/11/22.
 */

var config = {

    session_host: "127.0.0.1",
    session_port: 27017,
    session_db: "market",
    session_maxage: 60000 * 60 * 24 * 7,    //session保存7天

    db:{
        market: "mongodb://localhost/market" //
    }
};

module.exports = config;