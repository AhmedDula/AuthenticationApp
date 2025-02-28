const allowedorigins = require("./allowedorigins");

const corsoptions ={
    origin: (origin,callback)=>{
        if(allowedorigins.indexOf(origin)!== -1 || !origin){
            callback(null,true)
        }else{
            callback(new Error("Not Allowed by cors"))
            
        }
    },
    credentials: true,
    optionsSccessStatus: 200,
};

module.exports = corsoptions;